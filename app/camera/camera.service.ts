import {Injectable, NgZone} from '@angular/core';
import {ipcRenderer} from 'electron';
import {Observable, Subscription} from "rxjs/Rx";

import {LoginService} from "../login/login.service";
import {AppService} from "../app.service";
import {Model, mapDescToCurrProp, mapCurrPropToDesc, mirrorProps} from "./c300.model";
import {setInterval} from "timers";
import {Request} from "@angular/http";

const pingedCameraNotReachable = "Camera couldn't be pinged successfully";
const pingedCameraResponseSuccess = "Camera was pinged successfully";

@Injectable()
export class CameraService {

    private model = {"left": new Model(), "right": new Model()};

    private liveViewTimer: any;
    private liveViewTimerSubscription: any;
    private liveViewTimerStartDelay:number = 1000;
    private liveViewTimerFrequency:number = 500;
    private updateLoopTimer: any;
    private updateLoopTimerSubscription: any;
    private updateLoopTimerStartDelay:number = 0;
    private updateLoopTimerFrequency:number = 2000;
    private requestQueue: RequestData[];

    private myLoginService: LoginService;
    private myAppService: AppService;
    private zone: NgZone;


    constructor(private loginService: LoginService, private appService: AppService, zone: NgZone) {

        this.myLoginService = loginService;
        this.myAppService = appService;
        this.zone = zone;
        this.requestQueue = Array();

        ipcRenderer.on("response", (event: any, resp: any, body: any) => {
            let ip = resp.request.href.substring(this.model['left'].generalProperties.protocolWftServer.length + 3);
            ip = ip.substring(0, ip.indexOf("/"));
            let cam_name = this.loginService.getCamNameByIp(ip);
            let query = resp.request.href.substring(resp.request.href.lastIndexOf('/') + 1);
            let pingQuery = this.model[cam_name].generalProperties.pingCamera+"-"+cam_name;

            if(decodeURIComponent(query) == pingQuery) {
                this.parsePingResponse(resp.request.host, resp.request.path, JSON.parse(body), resp.request.href);
            }
            else {
                this.parseResponse(resp.request.host, resp.request.path, JSON.parse(body), resp.requestURL);
            }
        });

        ipcRenderer.on("error", (event: any, msg: any, args: any) => {
            console.log(`[Error] ${msg}`);
            let ip = args.substring(this.model['left'].generalProperties.protocolWftServer.length + 3);
            ip = ip.substring(0, ip.indexOf("/"));
            let cam_name = this.loginService.getCamNameByIp(ip);
            let query = args.substring(args.lastIndexOf('/') + 1);
            let pingQuery = this.model[cam_name].generalProperties.pingCamera+"-"+cam_name;

            if(decodeURIComponent(query) == pingQuery) {
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "No response from " + cam_name + " camera", msg);
                });
            }
            else {
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "Property couldn't be changed", msg);
                });
            }
            this.SetWaitingPropsToFail(this.myLoginService.getCamNameByIp(ip));
            this.pushToRequestQueue({requestURL: args, iterations: this.getRequestIterationsByURL(args), state: RequestState.Fail});
        });

        this.startUpdateLoopTimer();
    }

    public startLiveViewTimer() {
        this.liveViewTimer = Observable.timer(this.liveViewTimerStartDelay, this.liveViewTimerFrequency);
        this.liveViewTimerSubscription = this.liveViewTimer.subscribe(t => this.updateLiveView(t));
    }

    public stopLiveViewTimer() {
        this.liveViewTimerSubscription.unsubscribe();
    }

    private updateLiveView(tick: any) {
        console.log(tick);
    }

    public startUpdateLoopTimer() {
        this.updateLoopTimer = Observable.timer(this.updateLoopTimerStartDelay, this.updateLoopTimerFrequency);
        this.updateLoopTimerSubscription = this.updateLoopTimer.subscribe(t => this.updateLoop(t));
    }

    public stopUpdateLoopTimer() {
        this.updateLoopTimerSubscription.unsubscribe();
    }

    private updateLoop(tick: any) {
        for(let i = 0; i < this.requestQueue.length; i++) {
            if(this.requestQueue[i].iterations < 4 && this.requestQueue[i].state === RequestState.Pending) {
                this.requestQueue[i].iterations++;
                ipcRenderer.send("request", this.requestQueue[i].requestURL);
                console.log("RESENDING REQUEST.........");
            }
            else {
                this.requestQueue.splice(i, 1);
                console.log("REMOVING REQUEST FROM QUEUE.........");
            }
        }
    }

    public getIp(cam_name: string): string {
        return this.myLoginService.getIp(cam_name);
    }

    public getAdjustableProps(cam_name: string): any {
        return this.model[cam_name].adjustableProperties;
    }

    public getLiveViewProps(cam_name: string) :any {
        let lvprops = Array();
        let adjProps = this.model[cam_name].adjustableProperties;
        for(let i = 0; i < adjProps.length; i++) {
            if(adjProps[i].desc == "Liveview" || adjProps[i].desc == "Liveview-Image" ||
                adjProps[i].desc == "Record") {
                lvprops.push(adjProps[i]);
            }
        }
        return lvprops;
    }

    public getCurrProps(cam_name: string): any {
        return this.model[cam_name].currentProperties;
    }

    public getCurrProp(cam_name: string, key: string): any {
        return this.model[cam_name].currentProperties[key];
    }

    public getGenProps(cam_name: string): any {
        return this.model[cam_name].generalProperties;
    }

    public getMapDescToCurrProp(): any {
        return mapDescToCurrProp;
    }

    resetProperty(cam_name: string, args: string[]) {
        for (let item of args) {

            let currProp = this.model[cam_name].currentProperties[mapDescToCurrProp[item]];
            let firstKey = String(Object.keys(currProp)[0]);
            let value = new String(currProp[firstKey]);

            this.zone.run(() => {
                currProp.state = 'success';
                currProp[firstKey] = value;
            });
        }
    }

    public changeProperty(cam_name: string, query: string, propDesc: string): void {
        if (this.myAppService.IsMirrored()) {
            this.sendRequest('left', query, propDesc);
            this.sendRequest('right', query, propDesc);
        } else {
            this.sendRequest(cam_name, query, propDesc);
        }
    }

    public pingCameras() {
        this.pingCamera('left');
        this.pingCamera('right');
    }

    private pingCamera(cam_name: string) {
        let encodedQuery = encodeURIComponent(`${this.model[cam_name].generalProperties.pingCamera}-${cam_name}`);
        let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${encodedQuery}`;
        this.pushToRequestQueue({requestURL: url, iterations: 0, state: RequestState.Pending});
    }

    private sendRequest(cam_name: string, query: string, propDesc: string): void {
        let encodedQuery = encodeURIComponent(query);
        let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${encodedQuery}`;
        console.log(`[Request | ${cam_name}] ${url}`);

        //Set state of currProp to 'waiting'
        this.zone.run(() => {
            this.model[cam_name].currentProperties[mapDescToCurrProp[propDesc]].state = 'waiting';
        });

        //TODO uncomment for production use
        //var id = setInterval(ipcRenderer.send("request", url), 2000);
        //ipcRenderer.send("request", url);
        this.pushToRequestQueue({requestURL: url, iterations: 0, state: RequestState.Pending});


        //TODO comment for production use
        let testUrl = "http://webuser.hs-furtwangen.de/~hochanda/RemoteStereo/Testdaten.txt/?a=b";
        //ipcRenderer.send("request", testUrl);
        this.parseResponseDummy(query, cam_name, url);
    }

    private parseResponseDummy(resp: any, cam_name: string, url:string): void {
        let query = resp.substring(resp.lastIndexOf("?") + 1);
        let key = query.substring(0, query.indexOf("="));
        let value = query.substring(query.indexOf("=") + 1);

        //Simulate Network errors
        let res: string;
        if (Math.random() > 0.33) {
            res = "ok";
        } else {
            res = "fail";
            console.log("Simulated Network Error occured");
        }

        if (key == "nd") {
            if (value == "plus") {
                this.parseResponse(cam_name, 'dummyPath', JSON.parse(`{"res":"${res}", "${key}":"${Number(this.model[cam_name].currentProperties["nd"]["val"]) + 1}"}`), url);
            } else {
                this.parseResponse(cam_name, 'dummyPath', JSON.parse(`{"res":"${res}", "${key}":"${this.model[cam_name].currentProperties["nd"]["val"] - 1}"}`), url);
            }
        } else {
            this.parseResponse(cam_name, 'dummyPath', JSON.parse(`{"res":"${res}", "O${key}":{"pv":"${value}","en": 1}}`), url);
        }
    }

    private parseResponse(host: string, path: any, body: any, url:any) {
        console.log(`[Parse Response | Host: ${host}, Path: ${path}] ${JSON.stringify(body)}`);

        let camName = (host != "left" && host != "right") ? this.myLoginService.getCamNameByIp(host) : host;
        console.log("URL:" + url + " PATH:" + path);

        if (body["res"] != null) {
            if (body["res"] == "ok") {

                for (let item in body) {

                    //Item is a currentProp
                    if (this.model[camName].currentProperties[item] != null) {

                        //Item is Object
                        if (typeof body[item] === 'object') {

                            for (let subItem in body[item]) {
                                if (this.model[camName].currentProperties[item][subItem] != body[item][subItem]) {
                                    console.log(`Change ${item}.${subItem}: ${this.model[camName].currentProperties[item][subItem]} -> ${body[item][subItem]}`);
                                    this.zone.run(() => {
                                        this.model[camName].currentProperties[item][subItem] = body[item][subItem];
                                        this.model[camName].currentProperties[item].state = 'success';
                                        this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Successs});
                                    });
                                }
                            }

                        } else {

                            if (this.model[camName].currentProperties[item].val != body[item]) {
                                console.log(`Change ${item}: ${this.model[camName].currentProperties[item].val} -> ${body[item]}`);
                                this.zone.run(() => {
                                    this.model[camName].currentProperties[item].val = body[item];
                                    this.model[camName].currentProperties[item].state = 'success';
                                    this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Successs});
                                });
                            }

                        }

                    } else {
                        if (item != "res") console.log(`${item} is not a currProp`);
                    }
                }
            } else {
                console.log(`Camera Response wasn't OK: ${JSON.stringify(body)}`);
                this.zone.run(() => {
                    //this.model[camName].currentProperties['Oav'].pv = 20;
                    this.myAppService.showGrowl("error", "Property couldn't be changed", "Operation not allowed");
                    this.SetWaitingPropsToFail(camName);
                    this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Fail});
                });
            }
        } else {
            console.log(`Camera Response is corrupted`);
            this.zone.run(() => {
                this.myAppService.showGrowl("error", "Property couldn't be changed", "There was a network problem. Try again!");
                this.SetWaitingPropsToFail(camName);
                this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Fail});
            });
        }
    }

    private parsePingResponse(host: string, path: any, body: any, url:any) {
        console.log(`[Parse Ping Response | Host: ${host}, Path: ${path}] ${JSON.stringify(body)}`);

        let camName = (host != "left" && host != "right") ? this.myLoginService.getCamNameByIp(host) : host;
        console.log("URL:" + url + " PATH:" + path);

        if (body["res"] != null) {
            if (body["res"] == "ok") {
                this.zone.run(() => {
                    this.myAppService.showGrowl("success", "Pinged " + camName + " camera successfully", "Success");
                    this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Successs});
                });
            } else {
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "Couldn't ping " + camName + " camera successfully", "Network error");
                    this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Fail});
                });
            }
        } else {
            this.zone.run(() => {
                this.myAppService.showGrowl("error", "Couldn't ping " + camName + " camera successfully", "Network error");
                this.pushToRequestQueue({requestURL: url, iterations: this.getRequestIterationsByURL(url), state: RequestState.Fail});
            });
        }
    }

    private SetWaitingPropsToFail(camName: string) {

        for (let item in this.model[camName].currentProperties) {
            if (this.model[camName].currentProperties[item].state == 'waiting') {
                this.zone.run(() => {
                    this.model[camName].currentProperties[item].state = 'fail';
                });
            }
        }
    }

    public mirrorProperties() {

        if (this.myAppService.IsMirrored()) {

            let master = this.myLoginService.getMasterCamera();
            let slave = master == 'left' ? 'right' : 'left';
            let query: string, value: string;

            console.log(`[Mirror Props] ${master} -> ${slave}`);

            for (let mirrorProp of mirrorProps) {

                for (let key in this.model[master].currentProperties[mirrorProp]) {

                    if (this.model[master].currentProperties[mirrorProp][key] !=
                        this.model[slave].currentProperties[mirrorProp][key]
                        && key != "state") {

                        switch (mirrorProp) {
                            case "rec":
                                this.sendRequest(slave, "rec?cmd=trig", mapCurrPropToDesc[mirrorProp]);
                                break;
                            case "pushai":
                                this.sendRequest(slave, "drivelens?ai=push", mapCurrPropToDesc[mirrorProp]);
                                break;
                            case "nd":
                                let diff = Number(this.model[master].currentProperties[mirrorProp].val) - Number(this.model[slave].currentProperties[mirrorProp].val);
                                query = diff < 0 ? "drivelens?nd=minus" : "drivelens?nd=plus";
                                for (let _i = 0; _i < Math.abs(diff); _i++) this.sendRequest(slave, query, mapCurrPropToDesc[mirrorProp]);
                                break;
                            default:
                                value = this.model[master].currentProperties[mirrorProp].pv;
                                query = `${"setprop"}?${mirrorProp.substring(1)}=${value}`;
                                this.sendRequest(slave, query, mapCurrPropToDesc[mirrorProp]);
                                break;
                        }
                    }
                }
            }
        }
    }

    private pushToRequestQueue(element:RequestData) {
        for(let i = 0; i < this.requestQueue.length; i++) {
            if(element.requestURL === this.requestQueue[i].requestURL) {
                this.requestQueue[i] = element;
                return;
            }
        }
        this.requestQueue.push(element);
    }

    private getRequestIterationsByURL(url:string) {
        for(let i = 0; i < this.requestQueue.length; i++) {
            if(url === this.requestQueue[i].requestURL) {
                return this.requestQueue[i].iterations;
            }
        }
        return 0;
    }
}


interface RequestData {
    requestURL: string;
    state: RequestState;
    iterations: number;
}

enum RequestState {
    Successs,
    Fail,
    Pending,
}