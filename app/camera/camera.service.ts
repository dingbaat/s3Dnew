import {Injectable, NgZone} from '@angular/core';
import {ipcRenderer} from 'electron';
import {Observable, Subscription} from "rxjs/Rx";

import {LoginService} from "../login/login.service";
import {AppService} from "../app.service";
import {Model, mapDescToCurrProp, mapCurrPropToDesc, mirrorProps} from "./c300.model";

@Injectable()
export class CameraService {

    private model = {"left": new Model(), "right": new Model()};

    private timer: any;
    private sub: any;

    private myLoginService: LoginService;
    private myAppService: AppService;
    private zone: NgZone;


    constructor(private loginService: LoginService, private appService: AppService, zone: NgZone) {

        this.myLoginService = loginService;
        this.myAppService = appService;
        this.zone = zone;

        ipcRenderer.on("response", (event: any, resp: any, body: any) => {
            this.parseResponse(resp.request.host, resp.request.path, JSON.parse(body));
        });

        ipcRenderer.on("error", (event: any, msg: any, args: any) => {
            console.log(`[Error] ${msg}`);
            let ip = args.substring(this.model['left'].generalProperties.protocolWftServer.length + 3);
            ip = ip.substring(0, ip.indexOf("/"));
            this.zone.run(() => {
                this.myAppService.showGrowl("error", "Property couldn't be changed", msg);
                this.SetWaitingPropsToFail(this.getCamNameByIp(ip));
            });
        });
    }

    public startTimer() {
        this.timer = Observable.timer(1000, 500);
        this.sub = this.timer.subscribe(t => this.updateLiveView(t));
    }

    public stopTimer() {
        this.sub.unsubscribe();
    }

    private updateLiveView(tick: any) {
        console.log(tick);
    }

    public getIp(cam_name: string): string {
        return this.myLoginService.getIp(cam_name);
    }

    public getAdjustableProps(cam_name: string): any {
        return this.model[cam_name].adjustableProperties;
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

    private getCamNameByIp(ip: string): string {
        //TODO Lookup implementieren
        return "left";
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

    private sendRequest(cam_name: string, query: string, propDesc: string): void {
        let encodedQuery = encodeURIComponent(query);
        let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${encodedQuery}`;
        console.log(`[Request | ${cam_name}] ${url}`);

        //Set state of currProp to 'waiting'
        this.zone.run(() => {
            this.model[cam_name].currentProperties[mapDescToCurrProp[propDesc]].state = 'waiting';
        });

        //TODO uncomment for production use
        //ipcRenderer.send("request", url);
        //TODO comment for production use
        let testUrl = "http://webuser.hs-furtwangen.de/~hochanda/RemoteStereo/Testdaten.txt";
        //ipcRenderer.send("request", testUrl);
        this.parseResponseDummy(query, cam_name);
    }

    private parseResponseDummy(resp: any, cam_name: string): void {
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
                this.parseResponse(cam_name, 'dummyPath', JSON.parse(`{"res":"${res}", "${key}":"${Number(this.model[cam_name].currentProperties["nd"]["val"]) + 1}"}`));
            } else {
                this.parseResponse(cam_name, 'dummyPath', JSON.parse(`{"res":"${res}", "${key}":"${this.model[cam_name].currentProperties["nd"]["val"] - 1}"}`));
            }
        } else {
            this.parseResponse(cam_name, 'dummyPath', JSON.parse(`{"res":"${res}", "O${key}":{"pv":"${value}","en": 1}}`));
        }
    }

    private parseResponse(host: string, path: any, body: any) {
        console.log(`[Parse Response | ${host}${path}] ${JSON.stringify(body)}`);

        let camName = (host != "left" && host != "right") ? this.getCamNameByIp(host) : host;

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
                                    });
                                }
                            }

                        } else {

                            if (this.model[camName].currentProperties[item].val != body[item]) {
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
                    this.SetWaitingPropsToFail(camName);
                });
            }
        } else {
            console.log(`Camera Response is corrupted`);
            this.zone.run(() => {
                this.myAppService.showGrowl("error", "Property couldn't be changed", "There was a network problem. Try again!");
                this.SetWaitingPropsToFail(camName);
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

            //TODO Master dynamisch bestimmen
            let master = 'left';
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

}
