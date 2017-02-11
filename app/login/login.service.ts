import {Injectable, NgZone} from '@angular/core';
import {NetworkService} from "../utils/network.service";
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {LoginComponent} from "./login.component";

const noLoginErrorMssg: string = "NOERROR";

@Injectable()
export class LoginService {


    private master_camera = "";
    private ip_left: string;
    private ip_right: string;
    private user_left: string;
    private user_right: string;
    private pass_left: string;
    private pass_right: string;
    public loggedIn: boolean = false;

    private myNetworkService: NetworkService;

    constructor(private networkService: NetworkService, private http: Http, private zone: NgZone) {
        this.myNetworkService = networkService;
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

    public checkConnection(ipAddress: string) {
        return this.http.get(ipAddress).map(this.extractData);
    }

    private extractData(response: Response) {
        return response;
    }

    public getCamNameByIp(ip:string) {
        if(ip.includes(this.ip_left))
            return "left";
        else if(ip.includes(this.ip_right))
            return "right";
        else
            return null;
    }

    public setMasterCamera(camera:string) {
        if(camera != "left" && camera != "right")
            return;

        this.master_camera = camera;
    }

    public getMasterCamera() {
        return this.master_camera;
    }

    public checkCameraConnection(cameraInputType: CameraInputType, loginComponent: LoginComponent) {
        //let url = cameraInputType === CameraInputType.left ? this.leftCameraInput.ipAddress : this.rightCameraInput.ipAddress;
        let url = "http://www.google.de";
        this.checkConnection(url).subscribe(
            connection => {
                console.log("finished request")
                this.doLogin(cameraInputType, loginComponent);
            },
            error => {
                loginComponent.updateLoginErrorStatus(cameraInputType, String(error.status));
                this.doLogin(cameraInputType, loginComponent);
            }
        );
    }

    private doLogin(cameraInputType: CameraInputType, loginComponent:LoginComponent): void {
        cameraInputType === CameraInputType.left ? loginComponent.leftCameraReadyToLogIn = true : loginComponent.rightCameraReadyToLogIn = true;

        if (loginComponent.leftCameraReadyToLogIn === true && loginComponent.rightCameraReadyToLogIn === true) {
            if (loginComponent.leftCameraloginErrorStatus == LoginErrorStatus.none && loginComponent.rightCameraloginErrorStatus == LoginErrorStatus.none) {
                loginComponent.updateLoginErrorStatus(CameraInputType.left, noLoginErrorMssg);
                loginComponent.updateLoginErrorStatus(CameraInputType.right, noLoginErrorMssg);

                //update the stereo-app-component with the valid login credentials for both cameras
                this.master_camera = loginComponent.getMasterCamera();
                this.ip_left = loginComponent.leftCameraInput.ipAddress;
                this.user_left = loginComponent.leftCameraInput.username;
                this.pass_left = loginComponent.leftCameraInput.password;
                this.ip_right = loginComponent.rightCameraInput.ipAddress;
                this.user_right = loginComponent.rightCameraInput.username;
                this.pass_right = loginComponent.rightCameraInput.password;


                this.zone.run(() => {
                    this.loggedIn = true;
                });

                console.log("Login successful!");
            }
            else {
                loginComponent.leftCameraReadyToLogIn = false;
                loginComponent.rightCameraReadyToLogIn = false;

                this.zone.run(() => {
                    this.loggedIn = false;
                });
                console.log("Login failed!");
            }
        }
    }
}

enum CameraInputType {
    left,
    right,
}

enum LoginErrorStatus {
    none,
    forbidden,
    unreachable,
    genericError,
}
