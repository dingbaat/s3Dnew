import {Component, Input, Output, EventEmitter, Type} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'dropdown_slider',
    templateUrl: 'dropdown_slider.component.html',
    styleUrls: [],
})

export class DropdownSliderComponent {

    @Input()
    prop: any;

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    modes: any;
    selectedMode: string;
    prevSelectedMode: string;

    values: any;
    selectedValues: string[];
    prevSelectedValues: string[];


    constructor() {
        this.modes = [];
        this.values = [];
        this.selectedValues = [];
        this.prevSelectedValues = [];
    }

    ngOnInit() {

        //Setup Modes
        for (var query of this.prop.queries) {
            this.modes.push({label: query[0].name, value: {key: query[0].key, value: query[0].value}});
        }
        //TODO Set initial mode to currentCameraProperties
        this.selectedMode = this.modes[0].value;
        this.prevSelectedMode = this.modes[0].value;

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
                //TODO Set initial value to currentCameraProperties
                this.selectedValues.push(temp[0].value);
                this.prevSelectedValues.push(temp[0].value);

            } else {

                this.values.push([]);
                this.selectedValues.push("");
                this.prevSelectedValues.push("");
            }
        }
    }

    onModeChange() {

        if (this.selectedMode != this.prevSelectedMode) {
            this.sendPropertyChangeRequest(this.selectedMode);
        }

        this.prevSelectedMode = this.selectedMode;
    }

    onValueChange(index: number) {

        if (this.selectedValues[index] != this.prevSelectedValues[index]) {
            this.sendPropertyChangeRequest(this.selectedValues[index]);
        }

        this.prevSelectedValues[index] = this.selectedValues[index];
    }

    onIncrementValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = currIndex == this.values[index].length - 1 ? currIndex : currIndex + 1;

        if (currIndex != targetIndex) {
            this.selectedValues[index] = this.values[index][targetIndex].value;
            this.prevSelectedValues[index] = this.selectedValues[index];
            this.sendPropertyChangeRequest(this.selectedValues[index]);
        }
    }

    onDecrementValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = currIndex == 0 ? currIndex : currIndex - 1;

        if (currIndex != targetIndex) {
            this.selectedValues[index] = this.values[index][targetIndex].value;
            this.prevSelectedValues[index] = this.selectedValues[index];
            this.sendPropertyChangeRequest(this.selectedValues[index]);
        }
    }

    onFirstValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = 0;

        if (currIndex != targetIndex) {
            this.selectedValues[index] = this.values[index][targetIndex].value;
            this.prevSelectedValues[index] = this.selectedValues[index];
            this.sendPropertyChangeRequest(this.selectedValues[index]);
        }
    }

    onLastValue(index: number) {

        var currIndex = this.getIndexOfValue(index);
        var targetIndex = this.values[index].length - 1;

        if (currIndex != targetIndex) {
            this.selectedValues[index] = this.values[index][targetIndex].value;
            this.prevSelectedValues[index] = this.selectedValues[index];
            this.sendPropertyChangeRequest(this.selectedValues[index]);
        }
    }

    getIndexOfValue(index: number): number {

        for (var _i = 0; _i < this.values[index].length; _i++) {
            if (this.values[index][_i].value == this.selectedValues[index]) {
                return _i
            }
        }
    }

    sendPropertyChangeRequest(request: any) {

        this.propChangeRequested.emit(`${this.prop.path}?${request.key}=${request.value}`);
    }

}