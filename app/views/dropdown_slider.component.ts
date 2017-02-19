import {Component, Input, Output, EventEmitter, Type} from "@angular/core";
import {AppService} from "../app.service";

@Component({
    moduleId: module.id,
    selector: 'dropdown_slider',
    templateUrl: 'dropdown_slider.component.html',
    styleUrls: [],
})

export class DropdownSliderComponent {

    private myAppService: AppService;

    @Input()
    prop: any;

    @Output()
    propChangeRequested: EventEmitter<string[]> = new EventEmitter<string[]>();

    @Output()
    propResetRequested: EventEmitter<string[]> = new EventEmitter<string[]>();

    modes: any;
    @Input()
    selectedMode: any;
    prevSelectedMode: any;

    @Input()
    modeState: any;

    values: any;
    @Input()
    selectedValue: any;
    prevSelectedValue: any;

    @Input()
    valueState: any;


    constructor(private appService: AppService) {
        this.myAppService = appService;
        this.modes = [];
        this.values = [];
    }

    ngOnInit() {

        //Setup Modes
        for (var query of this.prop.queries) {
            this.modes.push({label: query[0].name, value: {key: query[0].key, value: query[0].value}});
        }
        this.prevSelectedMode = this.selectedMode;

        //Setup Values
        for (var query of this.prop.queries) {

            //Has values
            if (query[1]) {

                var temp: any;
                temp = [];

                if (query[1].value instanceof Array) {
                    for (var value of query[1].value) {
                        temp.push({label: value.toString(), value: {key: query[1].key, value: value.toString()}});
                    }
                } else {
                    //Range of values
                    for (var _i = query[1].value.min; _i <= query[1].value.max; _i += query[1].value.step) {
                        temp.push({label: _i.toString(), value: {key: query[1].key, value: _i.toString()}});
                    }
                }

                this.values.push(temp);

            } else {

                this.values.push([]);
            }
        }
        this.prevSelectedValue = this.selectedValue;
    }

    onModeChange() {

        if (this.selectedMode != this.prevSelectedMode) {
            this.sendPropertyChangeRequest(this.selectedMode, 'Mode');
        }

        this.prevSelectedMode = this.selectedMode;
    }

    onValueChange(index: number) {

        if (this.selectedValue != this.prevSelectedValue) {
            this.sendPropertyChangeRequest(this.selectedValue, 'Value');
        }

        this.prevSelectedValue = this.selectedValue;
    }

    onIncrementValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = currIndex == this.values[index].length - 1 ? currIndex : currIndex + 1;

        if (isNaN(currIndex)) {
            this.myAppService.showGrowl('error', 'An internal error occured', 'Incrementing value failed');
        } else {
            if (currIndex != targetIndex) {
                this.selectedValue = this.values[index][targetIndex].value;
                this.prevSelectedValue = this.selectedValue;
                this.sendPropertyChangeRequest(this.selectedValue, 'Value');
            }
        }
    }

    onDecrementValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = currIndex == 0 ? currIndex : currIndex - 1;

        if (isNaN(currIndex)) {
            this.myAppService.showGrowl('error', 'An internal error occured', 'Decrementing value failed');
        } else {
            if (currIndex != targetIndex) {
                this.selectedValue = this.values[index][targetIndex].value;
                this.prevSelectedValue = this.selectedValue;
                this.sendPropertyChangeRequest(this.selectedValue, 'Value');
            }
        }
    }

    onFirstValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = 0;

        if (isNaN(currIndex)) {
            this.myAppService.showGrowl('error', 'An internal error occured', 'Going to first value failed');
        } else {
            if (currIndex != targetIndex) {
                this.selectedValue = this.values[index][targetIndex].value;
                this.prevSelectedValue = this.selectedValue;
                this.sendPropertyChangeRequest(this.selectedValue, 'Value');
            }
        }
    }

    onLastValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = this.values[index].length - 1;

        if (isNaN(currIndex)) {
            this.myAppService.showGrowl('error', 'An internal error occured', 'Going to last value failed');
        } else {
            if (currIndex != targetIndex) {
                this.selectedValue = this.values[index][targetIndex].value;
                this.prevSelectedValue = this.selectedValue;
                this.sendPropertyChangeRequest(this.selectedValue, 'Value');
            }
        }
    }

    getIndexOfValue(index: number): number {

        for (var _i = 0; _i < this.values[index].length; _i++) {
            if (this.values[index][_i].value.value == this.selectedValue.value) {
                return _i
            }
        }
        return NaN;
    }

    sendPropertyChangeRequest(request: any, type: string) {

        this.propChangeRequested.emit([`getprop?r=${request.key}`, '']);
        this.propChangeRequested.emit([`${this.prop.path}?${request.key}=${request.value}`, `${this.prop.desc}-${type}`]);
    }

    sendPropResetRequest() {

        this.propResetRequested.emit([this.prop.desc + "-Mode", this.prop.desc + "-Value"]);
    }

}