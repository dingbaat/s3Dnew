import {Injectable, NgZone} from '@angular/core';
import {ipcRenderer} from 'electron';

import {LoginService} from "../login/login.service";
import {AppService} from "../app.service";
import {Model} from "./c300.model";

@Injectable()
export class CameraService {

  private model = {"left": new Model(), "right": new Model()};
  private log: string;

  private myLoginService: LoginService;
  private myAppService: AppService;
  private zone: NgZone;

  constructor(private loginService: LoginService, private appService: AppService, zone: NgZone) {
    this.myLoginService = loginService;
    this.myAppService = appService;
    this.zone = zone;

    ipcRenderer.on("response", (event: any, args: any) => {
      console.log(`[Response] ${args}`);
      //TODO Parse response and set new values in currProps
    });

    ipcRenderer.on("error", (event: any, args: any) => {
      console.log(`[Error] ${args}`);
      // http://stackoverflow.com/questions/31352397/how-to-update-view-after-change-in-angular2-after-google-event-listener-fired
      this.zone.run(() => {
        this.log = args;
      });
    });

  }

  public getLog(): string {
    return this.log;
  }

  public getIp(cam_name: string): string {
    return this.myLoginService.getIp(cam_name);
  }

  public getProps(cam_name: string): any {
    return this.model[cam_name].properties;
  }

  public getCurrProps(cam_name: string): any {
    return this.model[cam_name].currentProperties;
  }

  public getGenProps(cam_name: string): any {
    return this.model[cam_name].generalProperties;
  }

  public changeProperty(cam_name: string, query: string): void {
    if (this.myAppService.IsMirrored()) {
      this.sendRequest('left', query);
      this.sendRequest('right', query);
    } else {
      this.sendRequest(cam_name, query);
    }
  }

  private sendRequest(cam_name: string, query: string): void {
    //TODO EnodeURI not working for slash in shutterspeed values, Decode URI in parseResponse
    let encodedQuery = encodeURI(query);
    let url = `${this.model[cam_name].generalProperties.protocolWftServer}://${this.getIp(cam_name)}${this.model[cam_name].generalProperties.pathWftServer}${encodedQuery}`;
    console.log(`[Request] ${url}`);

    //TODO uncomment for production use
    ipcRenderer.send("request", url);

    this.parseResponse(query, cam_name);
  }

  private parseResponse(resp: any, cam_name: string): void {
    let query = resp.substring(resp.lastIndexOf("?") + 1);
    let key = query.substring(0, query.indexOf("="));
    let value = query.substring(query.indexOf("=") + 1);

    try {
      this.model[cam_name].currentProperties['O' + key].pv = value;
    } catch (e) {
    }

    console.log(`[Parsed Response] key: ${key}, value: ${value}`);
  }

}
