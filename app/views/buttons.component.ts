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

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    sendPropertyChangeRequest(index: number) {

        let key = this.prop.queries[index].key;
        let value = this.prop.queries[index].value;
        this.propChangeRequested.emit(`${this.prop.path}?${key}=${value}`);
    }

}