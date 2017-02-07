import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'toggle',
    templateUrl: 'toggle.component.html',
    styleUrls: [],
})

export class ToggleComponent {

    @Input()
    prop: any;

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    checked: boolean;

    constructor() {

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

        this.propChangeRequested.emit(`${this.prop.path}?${key}=${value}`);
    }

}