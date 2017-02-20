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

    private updateLoopTimer: any;
    private updateLoopTimerSubscription: any;
    private updateLoopTimerStartDelay: number = 0;
    private updateLoopTimerFrequency: number = 2000;

    private currPropTimer: any;
    private currPropTimerSubscription: any;
    private currPropTimerStartDelay: number = 0;
    private currPropTimerFrequency = 450;
    private currPropTimerRunning: boolean = false;

    private requestQueue: RequestData[];
    private lvPropCounter: number = 1;

    private myLoginService: LoginService;
    private myAppService: AppService;
    private zone: NgZone;

    private bla: number = 0;


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
            let pingQuery = this.model[cam_name].generalProperties.pingCamera + "-" + cam_name;

            if (decodeURIComponent(query) == pingQuery) {
                this.parsePingResponse(resp.request.host, resp.request.path, JSON.parse(body), resp.request.href);
            } else if (decodeURIComponent(query) == 'lv?cmd=start&sz=l') {
                let parsedBody = JSON.parse(body);

                if (parsedBody['res'] != null) {
                    if (parsedBody['res'] == 'ok') {

                        this.pushToRequestQueue({
                            cam_name: cam_name,
                            requestURL: resp.request.href,
                            iterations: this.getRequestIterationsByURL(resp.request.href),
                            state: RequestState.Successs
                        });

                        console.log("Resp is okay");
                        this.model[cam_name].currentProperties['lv'].val = 'true';
                    }
                    else {
                        this.pushToRequestQueue({
                            cam_name: cam_name,
                            requestURL: resp.request.href,
                            iterations: this.getRequestIterationsByURL(resp.request.href),
                            state: RequestState.Fail
                        });
                    }
                }
                else {
                    this.pushToRequestQueue({
                        cam_name: cam_name,
                        requestURL: resp.request.href,
                        iterations: this.getRequestIterationsByURL(resp.request.href),
                        state: RequestState.Fail
                    });
                }
            }
            else if (decodeURIComponent(query) == 'lv?cmd=stop') {
                let parsedBody = JSON.parse(body);

                if (parsedBody['res']) {
                    if (parsedBody['res'] == 'ok') {
                        this.model[cam_name].currentProperties['lv'].val = 'false';
                        this.pushToRequestQueue({
                            cam_name: cam_name,
                            requestURL: resp.request.href,
                            iterations: this.getRequestIterationsByURL(resp.request.href),
                            state: RequestState.Successs
                        });
                    }
                    else {
                        this.pushToRequestQueue({
                            cam_name: cam_name,
                            requestURL: resp.request.href,
                            iterations: this.getRequestIterationsByURL(resp.request.href),
                            state: RequestState.Fail
                        });
                    }
                }
                else {
                    this.pushToRequestQueue({
                        cam_name: cam_name,
                        requestURL: resp.request.href,
                        iterations: this.getRequestIterationsByURL(resp.request.href),
                        state: RequestState.Fail
                    });
                }
            }
            else {

                this.parseResponse(resp.request.host, resp.request.path, JSON.parse(body), resp.request.href);


            }
        });

        ipcRenderer.on("error", (event: any, msg: any, args: any) => {
            console.log(`[Error] ${msg}`);
            let ip = args['url'].substring(this.model['left'].generalProperties.protocolWftServer.length + 3);
            ip = ip.substring(0, ip.indexOf("/"));
            let cam_name = this.loginService.getCamNameByIp(ip);
            let query = args['url'].substring(args['url'].lastIndexOf('/') + 1);
            let pingQuery = this.model[cam_name].generalProperties.pingCamera + "-" + cam_name;

            if (decodeURIComponent(query) == pingQuery) {
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "No response from " + cam_name + " camera", msg);
                });
            }
            else {
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "Property couldn't be changed", msg);
                });
            }
            this.SetWaitingPropToFail(this.myLoginService.getCamNameByIp(ip), this.getCurrPropByUrl(args['url']));
            this.pushToRequestQueue({
                cam_name: cam_name,
                requestURL: args,
                iterations: this.getRequestIterationsByURL(args),
                state: RequestState.Fail
            });
        });

        this.startUpdateLoopTimer();
    }

    public startUpdateLoopTimer() {
        this.updateLoopTimer = Observable.timer(this.updateLoopTimerStartDelay, this.updateLoopTimerFrequency);
        this.updateLoopTimerSubscription = this.updateLoopTimer.subscribe(t => this.updateLoop(t));
    }

    public stopUpdateLoopTimer() {
        this.updateLoopTimerSubscription.unsubscribe();
    }

    private updateLoop(tick: any) {
        for (let i = 0; i < this.requestQueue.length; i++) {
            if (this.requestQueue[i].iterations < 4 && this.requestQueue[i].state === RequestState.Pending) {
                this.requestQueue[i].iterations++;

                if (this.requestQueue[i].requestURL.includes('start&sz=l')) {
                    ipcRenderer.send("propRequest", {
                        url: this.requestQueue[i].requestURL,
                        authlevel: this.myLoginService.getCookie(this.requestQueue[i].cam_name).authlevel,
                        acid: this.myLoginService.getCookie(this.requestQueue[i].cam_name).acid
                    });
                } else {

                    ipcRenderer.send("request", {
                        url: this.requestQueue[i].requestURL,
                        authlevel: this.myLoginService.getCookie(this.requestQueue[i].cam_name).authlevel,
                        acid: this.myLoginService.getCookie(this.requestQueue[i].cam_name).acid
                    });
                }
                console.log("RESENDING REQUEST.........");
            }
            else if (this.requestQueue[i].iterations >= 4) {
                this.SetWaitingPropToFail(this.requestQueue[i].cam_name, this.getCurrPropByUrl(this.requestQueue[i].requestURL))
            }
            else {
                this.requestQueue.splice(i, 1);
                console.log("REMOVING REQUEST FROM QUEUE.........");
            }
        }

        if (this.myLoginService.isLoggedIn() && !this.currPropTimerRunning) {
            this.startCurrPropTimer();
            this.currPropTimerRunning = true;
        }

    }

    public getIp(cam_name: string): string {
        return this.myLoginService.getIp(cam_name);
    }

    public getAdjustableProps(cam_name: string): any {
        return this.model[cam_name].adjustableProperties;
    }

    public getLiveViewProps(cam_name: string): any {
        let lvprops = Array();
        let adjProps = this.model[cam_name].adjustableProperties;
        for (let i = 0; i < adjProps.length; i++) {
            if (adjProps[i].desc == "Liveview" || adjProps[i].desc == "Liveview-Image" ||
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

    public isLiveViewActive(cam_name: string) {
        return this.model[cam_name].currentProperties['lv'].val;
    }

    public getMapDescToCurrProp(): any {
        return mapDescToCurrProp;
    }

    public startCurrPropTimer() {
        this.currPropTimer = Observable.timer(this.currPropTimerStartDelay, this.currPropTimerFrequency);
        this.currPropTimerSubscription = this.currPropTimer.subscribe(t => this.getCameraStatus());
    }

    private getCameraStatus() {
        if(this.lvPropCounter % 11 == 0) {
            ipcRenderer.send("propRequest", {
                url: `${this.model['left'].generalProperties.protocolWftServer}://${this.myLoginService.getUser('left')}:${this.myLoginService.getPassword('left')}@${this.getIp('left')}${this.model['left'].generalProperties.pathWftServer}getcurprop?seq=1`,
                authlevel: this.myLoginService.getCookie('left').authlevel,
                acid: this.myLoginService.getCookie('left').acid
            });
            ipcRenderer.send("propRequest", {
                url: `${this.model['right'].generalProperties.protocolWftServer}://${this.myLoginService.getUser('right')}:${this.myLoginService.getPassword('right')}@${this.getIp('right')}${this.model['right'].generalProperties.pathWftServer}getcurprop?seq=1`,
                authlevel: this.myLoginService.getCookie('right').authlevel,
                acid: this.myLoginService.getCookie('right').acid
            });
        }
        else if(this.model["left"].currentProperties["lv"].val == 'true' || this.model["right"].currentProperties['lv'].val == 'true') {
            if(this.model["right"].currentProperties['lv'].val == 'true') {
                let a = new Date;
                let b = "?d\x3d" + a.getFullYear() + "-" + ("00" + (a.getMonth() + 1)).slice(-2) + "-" + ("00" + a.getDate()).slice(-2) + "T" + ("00" + a.getHours()).slice(-2) + ":" + ("00" + a.getMinutes()).slice(-2) + ":" + ("00" + a.getSeconds()).slice(-2) + ("000" + a.getMilliseconds()).slice(-3);
                let cam_name = 'left';
                let query = "lvgetimg" + b;
                let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.myLoginService.getUser(cam_name)}:${this.myLoginService.getPassword(cam_name)}@${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${query}`;
                ipcRenderer.send("lvRequest", {url: url, authlevel: this.myLoginService.getCookie(cam_name).authlevel, acid: this.myLoginService.getCookie(cam_name).acid});
            }
            if(this.model["left"].currentProperties['lv'].val == 'true') {
                let a = new Date;
                let b = "?d\x3d" + a.getFullYear() + "-" + ("00" + (a.getMonth() + 1)).slice(-2) + "-" + ("00" + a.getDate()).slice(-2) + "T" + ("00" + a.getHours()).slice(-2) + ":" + ("00" + a.getMinutes()).slice(-2) + ":" + ("00" + a.getSeconds()).slice(-2) + ("000" + a.getMilliseconds()).slice(-3);
                let cam_name = 'right';
                let query = "lvgetimg" + b;
                let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.myLoginService.getUser(cam_name)}:${this.myLoginService.getPassword(cam_name)}@${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${query}`;
                ipcRenderer.send("lvRequest", {url: url, authlevel: this.myLoginService.getCookie(cam_name).authlevel, acid: this.myLoginService.getCookie(cam_name).acid});
            }
        }

        this.lvPropCounter++;
        if(this.lvPropCounter > 12) {
            this.lvPropCounter = 1;
        }

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
        let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.myLoginService.getUser(cam_name)}:${this.myLoginService.getPassword(cam_name)}@${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${encodedQuery}`;
        this.pushToRequestQueue({cam_name: cam_name, requestURL: url, iterations: 0, state: RequestState.Pending});
    }

    private sendRequest(cam_name: string, query: string, propDesc: string): void {
        let encodedQuery = query;

        if (propDesc == 'Shutterspeed-Value') {
            //var s1 = query.substring(0, query.lastIndexOf('1/'));
            //var s2 = query.substring(query.lastIndexOf('1/') + 1);
            //encodedQuery = s1 + '1%2F' + s2;
            encodedQuery = query.replace("1/", "1%2F");
            console.log(encodedQuery);
        }
        let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.myLoginService.getUser(cam_name)}:${this.myLoginService.getPassword(cam_name)}@${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${encodedQuery}`;
        console.log(`[Request | ${cam_name}] ${url}`);

        //Set state of currProp to 'waiting'
        this.zone.run(() => {


            if (!(decodeURIComponent(encodedQuery).startsWith('getprop?r='))) {
                this.model[cam_name].currentProperties[mapDescToCurrProp[propDesc]].state = 'waiting';
            }
        });

        this.pushToRequestQueue({cam_name: cam_name, requestURL: url, iterations: 0, state: RequestState.Pending});
    }

    private getCurrPropByUrl(url: string): string {
        let query = url.substring(url.lastIndexOf("?") + 1);
        let key = query.substring(0, query.indexOf("="));
        let value = query.substring(query.indexOf("=") + 1);

        if (key != "nd") {
            key = "O${key}";
        }

        return key;
    }

    private parseResponse(host: string, path: any, body: any, url: any) {

        //Skip PropState request
        if (!path.startsWith('/api/cam/getprop?r=')) {

            let camName = (host != "left" && host != "right") ? this.myLoginService.getCamNameByIp(host) : host;
            //console.log("URL:" + url + " PATH:" + path);
            console.log(`[Parse Response | Host: ${host}, Path: ${path}]`);

            if (body["res"] != null) {
                if (body["res"] == "ok") {

                    this.pushToRequestQueue({
                        cam_name: camName,
                        requestURL: url,
                        iterations: this.getRequestIterationsByURL(url),
                        state: RequestState.Successs
                    });

                    for (let item in body) {

                        //Item is a currentProp
                        if (this.model[camName].currentProperties[item] != null) {

                            //Item is Object
                            if (typeof body[item] === 'object') {

                                for (let subItem in body[item]) {
                                    if (this.model[camName].currentProperties[item][subItem].toString() == body[item][subItem].toString()) {
                                        console.log("Prop ist unverändert");
                                    }

                                    {
                                        console.log(`Change ${item}.${subItem}: ${this.model[camName].currentProperties[item][subItem]} -> ${body[item][subItem]}`);
                                        this.zone.run(() => {
                                            this.model[camName].currentProperties[item][subItem] = body[item][subItem];
                                            this.model[camName].currentProperties[item].state = 'success';
                                        });
                                    }
                                }

                            } else {
                                if (this.model[camName].currentProperties[item].val.toString() == body[item].toString()) {
                                    console.log("Prop ist unverändert");
                                }

                                {
                                    console.log(`Change ${item}: ${this.model[camName].currentProperties[item].val} -> ${body[item]}`);
                                    this.zone.run(() => {
                                        this.model[camName].currentProperties[item].val = body[item];
                                        this.model[camName].currentProperties[item].state = 'success';
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
                        this.SetWaitingPropToFail(camName, this.getCurrPropByUrl(url));
                        this.pushToRequestQueue({
                            cam_name: camName,
                            requestURL: url,
                            iterations: this.getRequestIterationsByURL(url),
                            state: RequestState.Fail
                        });
                    });
                }
            } else {
                console.log(`Camera Response is corrupted`);
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "Property couldn't be changed", "There was a network problem. Try again!");
                    this.SetWaitingPropToFail(camName, this.getCurrPropByUrl(url));
                    this.pushToRequestQueue({
                        cam_name: camName,
                        requestURL: url,
                        iterations: this.getRequestIterationsByURL(url),
                        state: RequestState.Fail
                    });
                });
            }
        }
    }

    private parsePingResponse(host: string, path: any, body: any, url: any) {
        console.log(`[Parse Ping Response | Host: ${host}, Path: ${path}] ${JSON.stringify(body)}`);

        let camName = (host != "left" && host != "right") ? this.myLoginService.getCamNameByIp(host) : host;
        console.log("URL:" + url + " PATH:" + path);

        if (body["res"] != null) {
            if (body["res"] == "ok") {
                this.zone.run(() => {
                    this.myAppService.showGrowl("success", "Pinged " + camName + " camera successfully", "Success");
                    this.pushToRequestQueue({
                        cam_name: camName,
                        requestURL: url,
                        iterations: this.getRequestIterationsByURL(url),
                        state: RequestState.Successs
                    });
                });
            } else {
                this.zone.run(() => {
                    this.myAppService.showGrowl("error", "Couldn't ping " + camName + " camera successfully", "Network error");
                    this.pushToRequestQueue({
                        cam_name: camName,
                        requestURL: url,
                        iterations: this.getRequestIterationsByURL(url),
                        state: RequestState.Fail
                    });
                });
            }
        } else {
            this.zone.run(() => {
                this.myAppService.showGrowl("error", "Couldn't ping " + camName + " camera successfully", "Network error");
                this.pushToRequestQueue({
                    cam_name: camName,
                    requestURL: url,
                    iterations: this.getRequestIterationsByURL(url),
                    state: RequestState.Fail
                });
            });
        }
    }

    private SetWaitingPropToFail(camName: string, currProp: string) {

        /* for (let item in this.model[camName].currentProperties) {
         if (this.model[camName].currentProperties[item].state == 'waiting') {
         this.zone.run(() => {
         this.model[camName].currentProperties[item].state = 'fail';
         });
         }
         }*/

        if (this.model[camName].currentProperties[currProp]) {
            this.model[camName].currentProperties[currProp].state = 'fail';
        } else {
            console.log("ERROR bei SetWaitingPropToFail: currProp gibts nicht");
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

                    if (key == "val" || key == "pv") {

                        switch (mirrorProp) {
                            case "nd":
                                let diff = Number(this.model[master].currentProperties[mirrorProp].val) - Number(this.model[slave].currentProperties[mirrorProp].val);
                                query = diff < 0 ? "drivelens?nd=minus" : "drivelens?nd=plus";
                                for (let _i = 0; _i < Math.abs(diff); _i++) this.sendRequest(slave, query, mapCurrPropToDesc[mirrorProp]);
                                break;
                            default:
                                value = this.model[master].currentProperties[mirrorProp].pv;
                                query = `${"setprop"}?${mirrorProp.substring(1)}=${value}`;
                                this.sendRequest(slave, `getprop?r=${mirrorProp.substring(1)}`, '');
                                this.sendRequest(slave, query, mapCurrPropToDesc[mirrorProp]);
                                break;
                        }
                    }
                }
            }
        }
    }

    private pushToRequestQueue(element: RequestData) {
        for (let i = 0; i < this.requestQueue.length; i++) {
            if (element.requestURL === this.requestQueue[i].requestURL) {
                this.requestQueue[i] = element;
                return;
            }
        }
        this.requestQueue.push(element);
    }

    private getRequestIterationsByURL(url: string) {
        for (let i = 0; i < this.requestQueue.length; i++) {
            if (url === this.requestQueue[i].requestURL) {
                return this.requestQueue[i].iterations;
            }
        }
        return 0;
    }

    public isCameraSidebarActive(cam_name: string) {
        return this.model[cam_name].directiveProperties["sidebarVisisble"];
    }

    public toggleCameraSidebar(cam_name: string) {
        this.zone.run(() => {
            if (this.model[cam_name].directiveProperties["sidebarVisisble"] === true)
                this.model[cam_name].directiveProperties["sidebarVisisble"] = false;
            else
                this.model[cam_name].directiveProperties["sidebarVisisble"] = true;
        });
    }
}


interface RequestData {
    requestURL: string;
    state: RequestState;
    iterations: number;
    cam_name: string;
}

enum RequestState {
    Successs,
    Fail,
    Pending,
}