import {Component, enableProdMode} from '@angular/core';

import {AppService} from "./app.service";
import {LoginService} from "./login/login.service";
import {CameraService} from "./camera/camera.service";

//enableProdMode();

@Component({
    moduleId: module.id,
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
})

export class AppComponent {

    private myAppService: AppService;
    private myLoginService: LoginService;
    private myCameraService: CameraService;


    constructor(private appService: AppService, private loginService: LoginService, private cameraService: CameraService) {
        this.myAppService = appService;
        this.myLoginService = loginService;
        this.myCameraService = cameraService;
    }

}

