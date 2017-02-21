import {Component, Input, Output, EventEmitter} from "@angular/core";
import {CameraService} from "../camera/camera.service";
import {AppService} from "../app.service";

@Component({
    moduleId: module.id,
    selector: 'toggle',
    templateUrl: 'toggle.component.html',
    styleUrls: [],
})

export class ToggleComponent {

    @Input()
    prop: any;

    @Input()
    selectedValue: any;

    @Input()
    valueState: any;

    @Output()
    propChangeRequested: EventEmitter<string[]> = new EventEmitter<string[]>();

    @Output()
    propResetRequested: EventEmitter<string[]> = new EventEmitter<string[]>();

    checked: boolean;
    _mirrorChecked: boolean;

    getMirrorChecked() {
        if(this.checked || (this.myCameraService.mirrorRecActive && this.myAppService.IsMirrored()))
            this._mirrorChecked = true;
        else
            this._mirrorChecked = false;
        return this._mirrorChecked;
    }

    constructor(public myCameraService:CameraService, private myAppService: AppService) {

        this.checked = false;
    }

    sendPropertyChangeRequest() {

        let key: any, value: any;

        if (this.checked) {
            key = this.prop.queries[0].key;
            value = this.prop.queries[0].value;
        } else {
            if (this.prop.queries[1]) {
                key = this.prop.queries[1].key;
                value = this.prop.queries[1].value;
            } else {
                key = this.prop.queries[0].key;
                value = this.prop.queries[0].value;
            }
        }

        this.propChangeRequested.emit([`${this.prop.path}?${key}=${value}`, this.prop.desc]);
    }

    sendPropResetRequest() {

        this.propResetRequested.emit([this.prop.desc]);
    }

    setRecMirrorActive() {
        if(this.myAppService.IsMirrored()) {
            this.myCameraService.mirrorRecActive = true;
        }
        else {
            this.myCameraService.mirrorRecActive = false;
        }
    }

}