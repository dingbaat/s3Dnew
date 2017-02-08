import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'slider',
    templateUrl: 'slider.component.html',
    styleUrls: [],
})

export class SliderComponent {

    @Input()
    prop: any;

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    values: any;

    @Input()
    selectedValue: any;

    prevSelectedValue: any;


    constructor() {
        this.values = [];
    }

    ngOnInit() {

        //Setup Values
        var values = this.prop.queries[0].value;

        if (values instanceof Array) {
            for (var value of values) {
                this.values.push({
                    label: value.toString(),
                    value: {key: this.prop.queries[0].key, value: value.toString()}
                });
            }
        } else {
            //Range of values
            for (var _i = values.min; _i <= values.max; _i += values.step) {
                this.values.push({label: _i.toString(), value: {key: this.prop.queries[0].key, value: _i.toString()}});
            }
        }

        //TODO Set initial value to currentCameraProperties
        //this.selectedValue = values[0].value;
        //this.prevSelectedValue = values[0].value;
        this.prevSelectedValue = this.selectedValue;

    }

    onValueChange() {

        if (this.selectedValue != this.prevSelectedValue) {
            this.sendPropertyChangeRequest(this.selectedValue);
        }

        this.prevSelectedValue = this.selectedValue;
    }

    onIncrementValue() {

        var currIndex = this.getIndexOfSelectedValue();
        var targetIndex = currIndex == this.values.length - 1 ? currIndex : currIndex + 1;

        if (currIndex != targetIndex) {
            this.selectedValue = this.values[targetIndex].value;
            this.prevSelectedValue = this.selectedValue;
            this.sendPropertyChangeRequest(this.selectedValue);
        }
    }

    onDecrementValue() {

        var currIndex = this.getIndexOfSelectedValue();
        var targetIndex = currIndex == 0 ? currIndex : currIndex - 1;

        if (currIndex != targetIndex) {
            this.selectedValue = this.values[targetIndex].value;
            this.prevSelectedValue = this.selectedValue;
            this.sendPropertyChangeRequest(this.selectedValue);
        }
    }

    onFirstValue() {

        var currIndex = this.getIndexOfSelectedValue();
        var targetIndex = 0;

        if (currIndex != targetIndex) {
            this.selectedValue = this.values[targetIndex].value;
            this.prevSelectedValue = this.selectedValue;
            this.sendPropertyChangeRequest(this.selectedValue);
        }
    }

    onLastValue() {

        var currIndex = this.getIndexOfSelectedValue();
        var targetIndex = this.values.length - 1;

        if (currIndex != targetIndex) {
            this.selectedValue = this.values[targetIndex].value;
            this.prevSelectedValue = this.selectedValue;
            this.sendPropertyChangeRequest(this.selectedValue);
        }
    }

    getIndexOfSelectedValue(): number {

        for (var _i = 0; _i < this.values.length; _i++) {
            if (this.values[_i].value.value == this.selectedValue.value) {
                return _i
            }
        }
    }

    sendPropertyChangeRequest(request: any) {

        this.propChangeRequested.emit(`${this.prop.path}?${request.key}=${request.value}`);
    }

}