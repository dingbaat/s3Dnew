import {Component, Input, Output, EventEmitter} from "@angular/core";
import {DomSanitizer} from '@angular/platform-browser';
import {CameraService} from "../camera/camera.service";
import {LoginService} from "../login/login.service";
import {Model, mapDescToCurrProp, mapCurrPropToDesc, mirrorProps} from "../camera/c300.model";
import {ipcRenderer} from 'electron';
import {Injectable, NgZone} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'liveview',
    templateUrl: 'liveview.component.html',
    styleUrls: [],
})

export class LiveviewComponent {

    @Input()
    cameraName: any;
    @Input()
    props: any;

    propLvToggle: any;
    propLvImage: any;
    liveViewActive:boolean = false;
    liveViewSource:any = "app/images/stereo-test-image.png";
    private zone: NgZone;

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    checked: boolean;

    constructor(private myLoginService: LoginService, public myCameraService:CameraService, private sanitizer: DomSanitizer, zone: NgZone) {

        console.log("LV:" + this.cameraName);
        this.checked = false;
        this.zone = zone;

        ipcRenderer.on("lvResponse", (event: any, resp: any, body: any) => {
            console.log("img response");
            let ip = resp.request.href.substring(("http://").length);
            ip = ip.substring(0, ip.indexOf("/"));


            if(body != null) {
                if(this.cameraName == myLoginService.getCamNameByIp(ip)) {
                    let img = new Image();
                    let url = URL.createObjectURL(new Blob([body], {type: 'image/jpeg'}));
                    this.zone.run(() => {
                        this.liveViewSource = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                    });

                    console.log("parsedImage");
                }
            }

        });
    }

    ngOnInit() {
        for (let prop of this.props) {
            if (prop.type == "lv-toggle") {
                this.propLvToggle = prop;
                continue;
            }
            if (prop.type == "lv-image") {
                this.propLvImage = prop;
                continue;
            }
        }
    }

    sendPropertyChangeRequest() {

        let key: any, value: any;

        if (this.checked) {

            key = this.propLvToggle.queries[0].key;
            value = this.propLvToggle.queries[0].value;

            this.propChangeRequested.emit(`${this.propLvToggle.path}?${key}=${value}`);

        } else {

            if (this.propLvToggle.queries[1]) {
                key = this.propLvToggle.queries[1].key;
                value = this.propLvToggle.queries[1].value;
            } else {
                key = this.propLvToggle.queries[0].key;
                value = this.propLvToggle.queries[0].value;
            }

            this.propChangeRequested.emit(`${this.propLvToggle.path}?${key}=${value}`);
        }
    }

    public changeProperty(args: string[]): void {
        this.myCameraService.changeProperty(this.cameraName, args[0], args[1]);
    }

    public resetProperty(args: string[]): void {
        this.myCameraService.resetProperty(this.cameraName, args);
    }

    public getMapDescToCurrProp(): any {
        return mapDescToCurrProp;
    }

}