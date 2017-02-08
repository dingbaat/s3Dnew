import {Component, Input, Output, EventEmitter, Type, NgZone} from "@angular/core";
import {LoginService} from "./login.service";
import {Component, Input, Output, NgZone} from '@angular/core';
import 'rxjs/Rx';
import {AppComponent} from "../app.component";

const noLoginErrorMssg : string = "NOERROR";

@Component({
  moduleId: module.id,
  selector: 'login-form',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  private leftCameraReadyToLogIn : boolean;
  private rightCameraReadyToLogIn : boolean;
  private myLoginService: LoginService;
  private zone : NgZone;

  public leftCameraloginErrorStatus: LoginErrorStatus;
  public rightCameraloginErrorStatus: LoginErrorStatus;
  public loginErrorMessages: string[];
  public leftCameraInput: LoginInputData;
  public rightCameraInput: LoginInputData;

  constructor(zone : NgZone, private myLoginService: LoginService, private app:AppComponent) {
    this.initializeInputs();
    this.zone = zone;
    this.leftCameraReadyToLogIn = false;
    this.rightCameraReadyToLogIn = false;
    this.leftCameraloginErrorStatus = LoginErrorStatus.none;
    this.rightCameraloginErrorStatus = LoginErrorStatus.none;
    this.loginErrorMessages = Array();
    this.loginErrorMessages[0] = "Kein Fehler";
    this.loginErrorMessages[1] = "Zugriff verweigert. Überprüfe deinen Nutzernamen und das Passwort!";
    this.loginErrorMessages[2] = "Kamera ist nicht erreichbar. Überprüfe die IP-Adresse und deine Netzwerkverbindung!";
    this.loginErrorMessages[3] = "Es ist ein Fehler aufgetreten. Überprüfe deine Daten und versuche es erneut!";
  }

  private initializeInputs() : void {
    this.leftCameraInput = {
      username: '',
      usernameValid: true,
      password: '',
      passwordValid: true,
      ipAddress: '',
      ipAddressValid: true,
    }
    this.rightCameraInput = {
      username: '',
      usernameValid: true,
      password: '',
      passwordValid: true,
      ipAddress: '',
      ipAddressValid: true,
    }
  }

  public handleLogin() : void  {
    console.log("trying to login....");

    let valid : boolean = this.validate();

    //TODO Later, use the camera's ip addresses
    if(valid) {
      //check the left camera's connection
      this.checkCameraConnection(CameraInputType.left);
      this.checkCameraConnection(CameraInputType.right);
    }
  }

  private doLogin(cameraInputType : CameraInputType) : void {
    cameraInputType === CameraInputType.left ? this.leftCameraReadyToLogIn = true : this.rightCameraReadyToLogIn = true;

    if(this.leftCameraReadyToLogIn === true && this.rightCameraReadyToLogIn === true) {
      if(this.leftCameraloginErrorStatus == LoginErrorStatus.none && this.rightCameraloginErrorStatus == LoginErrorStatus.none) {
        this.updateLoginErrorStatus(CameraInputType.left, noLoginErrorMssg);
        this.updateLoginErrorStatus(CameraInputType.right, noLoginErrorMssg);

        //update the stereo-app-component with the valid login credentials for both cameras
        //this.stereoApp.leftCamera.loginData.ipAddress = this.leftCameraInput.ipAddress;
        //this.stereoApp.leftCamera.loginData.username = this.leftCameraInput.username;
        //this.stereoApp.leftCamera.loginData.password = this.leftCameraInput.password;
        //this.stereoApp.rightCamera.loginData.ipAddress = this.rightCameraInput.ipAddress;
        //this.stereoApp.rightCamera.loginData.username = this.rightCameraInput.username;
        //this.stereoApp.rightCamera.loginData.password = this.rightCameraInput.password;


        this.zone.run(() => {
          this.myLoginService.loggedIn = true;
        });

        console.log(this.myLoginService.loggedIn)
        console.log("Login successful!");
      }
      else {
        this.leftCameraReadyToLogIn = false;
        this.rightCameraReadyToLogIn = false;

        this.zone.run(() => {
          this.myLoginService.loggedIn = false;
        });
        console.log("Login failed!");
      }
    }
  }

  private checkCameraConnection(cameraInputType : CameraInputType)  {

    //let url = cameraInputType === CameraInputType.left ? this.leftCameraInput.ipAddress : this.rightCameraInput.ipAddress;
    let url = "http://www.google.de";
    this.myLoginService.checkConnection(url).subscribe(
        connection => {
          console.log("finished request")
          this.doLogin(cameraInputType);
        },
        error => {
          this.updateLoginErrorStatus(cameraInputType, String(error.status));
          this.doLogin(cameraInputType);
        }
    );
  }

  private updateLoginErrorStatus(cameraInputType : CameraInputType, errorStatus : string) : void {
    switch(errorStatus) {
      case "403":
        this.zone.run(() => {
          cameraInputType === CameraInputType.left ? this.leftCameraloginErrorStatus = LoginErrorStatus.forbidden : this.rightCameraloginErrorStatus = LoginErrorStatus.forbidden;
        });
        break;
      case "0":
        this.zone.run(() => {
          cameraInputType === CameraInputType.left ? this.leftCameraloginErrorStatus = LoginErrorStatus.unreachable : this.rightCameraloginErrorStatus = LoginErrorStatus.unreachable;
        });
        break;
      case noLoginErrorMssg:
        this.zone.run(() => {
          cameraInputType === CameraInputType.left ? this.leftCameraloginErrorStatus = LoginErrorStatus.none : this.rightCameraloginErrorStatus = LoginErrorStatus.none;
        });
        break;
      default:
        this.zone.run(() => {
          cameraInputType === CameraInputType.left ? this.leftCameraloginErrorStatus = LoginErrorStatus.genericError : this.rightCameraloginErrorStatus = LoginErrorStatus.genericError;
        });
    }
  }

  private validate() : boolean {
    let valid : boolean = true;

    for(let i = 0; i < Object.keys(CameraInputType).length; i++) {
      for(let j = 0; j < Object.keys(TextInputType).length; j++) {
        this.validateTextInput(i, j);
      }
      this.validateIPAdress(i);
    }

    if(this.leftCameraInput.ipAddressValid === false || this.leftCameraInput.usernameValid === false || this.leftCameraInput.passwordValid === false
        || this.rightCameraInput.ipAddressValid === false || this.rightCameraInput.usernameValid === false || this.rightCameraInput.passwordValid === false) {
      return false;
    }

    return true;
  }

  public validateIPAdress(cameraInputType : CameraInputType) {
    let address : string = cameraInputType === CameraInputType.left ?  this.leftCameraInput.ipAddress : this.rightCameraInput.ipAddress;
    let valid : boolean = /^((([0-1]{0,1}[0-9]{1,2})|(2([0-5][0-4])?|([0-9])?))\.){3}(([0-1]{0,1}[0-9]{1,2})|(2([0-5][0-4])?|([0-9])?))$/.test(address);
    cameraInputType === CameraInputType.left ?  this.leftCameraInput.ipAddressValid = valid : this.rightCameraInput.ipAddressValid = valid;
  }

  public validateTextInput(cameraInputType : CameraInputType, textInputType : TextInputType) {
    let text : string = "";
    if(cameraInputType === CameraInputType.left)
      text = textInputType === TextInputType.password ?  this.leftCameraInput.password : this.leftCameraInput.username;
    else
      text = textInputType === TextInputType.password ? this.rightCameraInput.password : this.rightCameraInput.username;

    let valid : boolean = text.trim() !== "";
    if(cameraInputType === CameraInputType.left)
      textInputType === TextInputType.password ? this.leftCameraInput.passwordValid = valid : this.leftCameraInput.usernameValid = valid
    else
      textInputType === TextInputType.password ? this.rightCameraInput.passwordValid = valid : this.rightCameraInput.usernameValid = valid
  }

}

interface LoginInputData {
  username : string;
  usernameValid : boolean;
  password : string;
  passwordValid : boolean;
  ipAddress : string;
  ipAddressValid : boolean;
}

enum CameraInputType {
  left,
  right,
}

enum TextInputType {
  username,
  password,
}

enum LoginErrorStatus {
  none,
  forbidden,
  unreachable,
  genericError,
}


