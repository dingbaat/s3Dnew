import {Component, enableProdMode} from '@angular/core';

import {AppService} from "./app.service";
import {LoginService} from "./login/login.service";
import {CameraService} from "./camera/camera.service";

//enableProdMode();

@Component({
    moduleId: module.id,
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: [],
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

    public onWindowResize(event) {
        let middleColumn = document.getElementById("middle-column");
        if(this.myLoginService.isLoggedIn() == false || (middleColumn != null && middleColumn.length <= 0)) return;
        middleColumn.removeAttribute("style");
    }

    public adaptMiddleColumnSize() {
        let middleColumn = document.getElementById("middle-column");
        if(this.myLoginService.isLoggedIn() == false || (middleColumn != null &&  middleColumn.length <= 0)) return;
        middleColumn.removeAttribute("style");

        if(window.matchMedia("(max-width: 1250px)").matches) {
            let leftColumnHeight = document.getElementById("left-settings-column").clientHeight;
            let rightColumnHeight = document.getElementById("right-settings-column").clientHeight;

            let targetHeight = leftColumnHeight > rightColumnHeight ? leftColumnHeight : rightColumnHeight;
            targetHeight += 30;
            middleColumn.style.height = targetHeight + "px";
        }
    }
}

