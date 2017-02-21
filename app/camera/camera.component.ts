import {Component, Input, OnInit} from '@angular/core';

import {CameraService} from "./camera.service";
import {LoginService} from "../login/login.service";

@Component({
    moduleId: module.id,
    selector: 'camera',
    templateUrl: 'camera.component.html'
})

export class CameraComponent implements OnInit {

    myLoginService: LoginService;
    myCameraService: CameraService;

    @Input()
    name: string;
    adjProps: any;
    currProps: any;
    genProps: any;

    mapDescToCurrProp: any;

    constructor(private cameraService: CameraService, private loginService: LoginService) {
        this.myLoginService = loginService;
        this.myCameraService = cameraService;
    }

    ngOnInit() {

        this.adjProps = this.myCameraService.getAdjustableProps(this.name);

        //Assign the available aperture values to the model
        //TODO uncomment
        //this.adjProps[1].queries[0].value = this.myLoginService.apertureValues;

        this.currProps = this.myCameraService.getCurrProps(this.name);
        this.genProps = this.myCameraService.getGenProps(this.name);
        this.mapDescToCurrProp = this.myCameraService.getMapDescToCurrProp();
    }

    public changeProperty(args: string[]): void {
        this.myCameraService.changeProperty(this.name, args[0], args[1]);
    }

    public resetProperty(args: string[]): void {
        this.myCameraService.resetProperty(this.name, args);
    }

    //TODO löschen
    test() {
        this.myCameraService.getCurrProp('left', 'Ocf').sel = "C";
    }

}

