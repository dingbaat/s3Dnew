import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'buttons',
    templateUrl: 'buttons.component.html',
    styleUrls: [],
})

export class ButtonsComponent {

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


    capitalize(str: string) {
        str = str.toString();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    sendPropertyChangeRequest(index: number) {

        let key = this.prop.queries[index].key;
        let value = this.prop.queries[index].value;
        this.propChangeRequested.emit([`${this.prop.path}?${key}=${value}`, this.prop.desc]);
    }

    sendPropResetRequest() {

        this.propResetRequested.emit([this.prop.desc]);
    }

}