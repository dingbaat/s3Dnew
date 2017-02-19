import {Injectable, NgZone} from '@angular/core';
import {NetworkService} from "../utils/network.service";
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {LoginComponent} from "./login.component";
import {CameraService} from "../camera/camera.service";
import {ipcRenderer} from 'electron';
import {log} from "util";
import * as fs from "fs-jetpack";

const noLoginErrorMssg: string = "NOERROR";

@Injectable()
export class LoginService {

    private login_steps: any;
    private master_camera = "";
    private ip_left: string;
    private ip_right: string;
    private user_left: string;
    private user_right: string;
    private pass_left: string;
    private pass_right: string;
    private cookie_left: any;
    private cookie_right: any;
    private current_login_component: LoginComponent;
    public loggedIn: boolean = false;
    public isLoginProcessRunning:boolean = false;

    private myNetworkService: NetworkService;

    constructor(private networkService: NetworkService, private http: Http, private zone: NgZone) {
        this.myNetworkService = networkService;

        this.login_steps = {"left": 0, "right": 0};

        ipcRenderer.on("loginResponse", (event: any, resp: any, body: any) => {
            let ip = resp.request.href.substring(("http://").length);
            ip = ip.substring(0, ip.indexOf("/"));
            let cam_name = this.getCamNameByIp(ip);


            let acid: string, authlevel: string;

            if (this.login_steps[cam_name] == 1) {

                this.checkConnection(`http://${ip}/api/acnt/login`);
                this.login_steps[cam_name]++;

            } else if (this.login_steps[cam_name] == 2) {

                if (cam_name == "left") {
                    this.checkConnection(`http://${this.current_login_component.leftCameraInput.username}:${this.current_login_component.leftCameraInput.password}@${ip}/api/acnt/login`);
                } else {
                    this.checkConnection(`http://${this.current_login_component.rightCameraInput.username}:${this.current_login_component.rightCameraInput.password}@${ip}/api/acnt/login`);
                }
                this.login_steps[cam_name]++;

            } else if (this.login_steps[cam_name] == 3) {
                console.log(cam_name);
                console.log(resp.headers);

                if (resp.headers["set-cookie"] && resp.headers["set-cookie"].length > 1) {

                    this.login_steps[cam_name] = 0;

                    if (resp.headers["set-cookie"][0].includes("acid")) {
                        acid = resp.headers["set-cookie"][0].substring(resp.headers["set-cookie"][0].indexOf("=") + 1, resp.headers["set-cookie"][0].indexOf(";"));
                        authlevel = 'full';

                    }
                    else if (resp.headers["set-cookie"][0].includes("authlevel")) {
                        authlevel = 'full';
                        acid = resp.headers["set-cookie"][1].substring(resp.headers["set-cookie"][0].indexOf("=") + 1, resp.headers["set-cookie"][0].length);
                    } else {
                        console.log(cam_name);
                        console.log("Cookie errror");
                    }


                    if (cam_name == "left") {
                        this.cookie_left = {acid: acid, authlevel: authlevel};
                    }
                    else {
                        this.cookie_right = {acid: acid, authlevel: authlevel};
                    }

                    this.current_login_component.updateLoginErrorStatus(cam_name == "left" ? CameraInputType.left : CameraInputType.right, String("NOERROR"));
                    this.doLogin(cam_name);
                } else {

                    var cookies = fs.read('cookies.json', 'json');


                    this.current_login_component.updateLoginErrorStatus(cam_name == "left" ? CameraInputType.left : CameraInputType.right, String("cookieError"));
                    this.login_steps[cam_name] = 0;
                    this.isLoginProcessRunning = false;
                }
            }


        });

        ipcRenderer.on("loginError", (event: any, msg: any, args: any) => {
            let ip = args['url'].substring(("http://").length);
            ip = ip.substring(0, ip.indexOf("/"));
            let cam_name = this.getCamNameByIp(ip);
            let cameraInputType = cam_name == "left" ? CameraInputType.left : CameraInputType.right;

            switch (msg) {
                case "ENOENT" :
                case "EACCES" :
                    this.current_login_component.updateLoginErrorStatus(cameraInputType, String("403"));
                default:
                    this.current_login_component.updateLoginErrorStatus(cameraInputType, String("0"));
                    break;
            }


            this.doLogin(cam_name);
        });

    }

    login(ip_left: string, ip_right: string, user_left: string, user_right: string, pass_left: string, pass_right: string): void {

        this.ip_left = ip_left;
        this.ip_right = ip_right;
        this.user_left = user_left;
        this.user_right = user_right;
        this.pass_left = pass_left;
        this.pass_right = pass_right;

        //TODO validate ip's
        //TODO Do http request
        this.loggedIn = true;
    }

    getPassword(cam_name: string) {
        return cam_name == "left" ? this.pass_left : this.pass_right;
    }

    getUser(cam_name: string) {
        return cam_name == "left" ? this.user_left : this.user_right;
    }

    getCookie(cam_name: string) {
        if (cam_name == "left")
            return this.cookie_left;
        return this.cookie_right;
    }

    logout(): void {

        this.ip_left = "";
        this.ip_right = "";
        this.user_left = "";
        this.user_right = "";
        this.pass_left = "";
        this.pass_right = "";

        this.loggedIn = false;
    }

    public isLoggedIn(): boolean {
        return this.loggedIn;
    }

    getIp(name: string) {
        return name == "left" ? this.ip_left : this.ip_right;
    }

    public checkConnection(url: string) {
        //return this.http.get(ipAddress).map(this.extractData);
        ipcRenderer.send('loginRequest', {url: url, acid: null, authlevel: null});
    }

    private extractData(response: Response) {
        return response;
    }

    public getCamNameByIp(ip: string) {
        if (ip.includes(this.current_login_component.leftCameraInput.ipAddress))
            return "left";
        else if (ip.includes(this.current_login_component.rightCameraInput.ipAddress))
            return "right";
        else
            return null;
    }

    public setMasterCamera(camera: string) {
        if (camera != "left" && camera != "right")
            return;

        this.master_camera = camera;
    }

    public getMasterCamera() {
        return this.master_camera;
    }

    public checkCameraConnection(cameraInputType: CameraInputType, loginComponent: LoginComponent) {
        let cam_name = cameraInputType == CameraInputType.left ? "left" : "right";
        let cam = cameraInputType == CameraInputType.left ? loginComponent.leftCameraInput : loginComponent.rightCameraInput;
        this.current_login_component = loginComponent;
        let url = `http://${cam.ipAddress}`;

        if (this.login_steps[cam_name] == 0) {
            this.checkConnection(url);
            this.login_steps[cam_name]++;
        }
    }

    private doLogin(cam_name: string): void {

        if (cam_name === "left")
            this.current_login_component.leftCameraReadyToLogIn = true;
        else
            this.current_login_component.rightCameraReadyToLogIn = true;

        if (this.current_login_component.leftCameraReadyToLogIn === true && this.current_login_component.rightCameraReadyToLogIn === true) {
            if (this.current_login_component.leftCameraloginErrorStatus == LoginErrorStatus.none && this.current_login_component.rightCameraloginErrorStatus == LoginErrorStatus.none) {
                this.current_login_component.updateLoginErrorStatus(CameraInputType.left, noLoginErrorMssg);
                this.current_login_component.updateLoginErrorStatus(CameraInputType.right, noLoginErrorMssg);

                //update the stereo-app-component with the valid login credentials for both cameras
                this.master_camera = this.current_login_component.getMasterCamera();
                this.ip_left = this.current_login_component.leftCameraInput.ipAddress;
                this.user_left = this.current_login_component.leftCameraInput.username;
                this.pass_left = this.current_login_component.leftCameraInput.password;
                this.ip_right = this.current_login_component.rightCameraInput.ipAddress;
                this.user_right = this.current_login_component.rightCameraInput.username;
                this.pass_right = this.current_login_component.rightCameraInput.password;


                this.zone.run(() => {
                    this.loggedIn = true;
                });

                ipcRenderer.send('propRequest', {
                    url: 'http://' + this.current_login_component.leftCameraInput.username +
                    ':' + this.current_login_component.leftCameraInput.password + '@192.168.1.1/api/cam/getcurprop?seq=0',
                    acid: this.getCookie("left").acid,
                    authlevel: null
                });

                console.log("Login successful!");
            }
            else {
                this.current_login_component.leftCameraReadyToLogIn = false;
                this.current_login_component.rightCameraReadyToLogIn = false;

                this.zone.run(() => {
                    this.loggedIn = false;
                });
                console.log("Login failed!");
            }
        }
        this.isLoginProcessRunning = false;

    }
}

enum CameraInputType {
    left
        ,
    right
        ,
}

enum LoginErrorStatus {
    none,
    forbidden,
    unreachable,
    genericError,
}
