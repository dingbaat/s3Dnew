import {Component, Input, Output, EventEmitter} from "@angular/core";
import {CameraService} from "../camera/camera.service";
import {Model, mapDescToCurrProp, mapCurrPropToDesc, mirrorProps} from "../camera/c300.model";

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

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    checked: boolean;

    constructor(public myCameraService:CameraService) {

        this.checked = false;
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
            this.startStreamingLvImage();

        } else {

            if (this.propLvToggle.queries[1]) {
                key = this.propLvToggle.queries[1].key;
                value = this.propLvToggle.queries[1].value;
            } else {
                key = this.propLvToggle.queries[0].key;
                value = this.propLvToggle.queries[0].value;
            }

            this.propChangeRequested.emit(`${this.propLvToggle.path}?${key}=${value}`);
            this.stopStreamingLvImage();
        }

    }

    getCurrentLvImage() {

        let key = this.propLvImage.queries[0].key;
        let value = this.propLvImage.queries[0].value;

        //TODO Timer
        this.propChangeRequested.emit(`${this.propLvImage.path}?${key}=${value}`);
    }

    startStreamingLvImage() {

        this.getCurrentLvImage();
    }

    stopStreamingLvImage() {

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