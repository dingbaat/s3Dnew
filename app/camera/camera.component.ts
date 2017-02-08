import {Component, Input, OnInit} from '@angular/core';

import {CameraService} from "./camera.service";
import {LoginService} from "../login/login.service";
import {Injectable, NgZone} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'camera',
    templateUrl: 'camera.component.html'
})

export class CameraComponent implements OnInit {

    myLoginService: LoginService;
    myCameraService: CameraService;
    private zone: NgZone;

    @Input()
    name: string;
    adjProps: any;
    currProps: any;
    genProps: any;


    constructor(private cameraService: CameraService, private loginService: LoginService, zone: NgZone) {
        this.myLoginService = loginService;
        this.myCameraService = cameraService;
    }

    ngOnInit() {
        this.adjProps = this.myCameraService.getAdjustableProps(this.name);
        this.currProps = this.myCameraService.getCurrProps(this.name);
        this.genProps = this.myCameraService.getGenProps(this.name);
    }

    public test() {


        this.currProps.Ossm.pv = "cls";
        this.currProps.Owbm.pv = "Kelvin";
        this.currProps.Ogcm.pv = "gain";


    }

    public changeProperty(query: string): void {
        this.myCameraService.changeProperty(this.name, query);
    }

}

