import {Component, Input, Output, EventEmitter, Type} from "@angular/core";
import {Model} from "../camera/c300.model";

@Component({
    moduleId: module.id,
    selector: 'property',
    templateUrl: 'property.component.html',
    styleUrls: ['property.component.css'],
})

export class PropertyComponent {

    genProps = new Model().generalProperties;

    @Input()
    prop: any;

    @Input()
    activeMode: string;

    modesCollapsed: boolean = true;

    @Input()
    activeValue: string;

    valuesCollapsed: boolean = true;

    @Output()
    propChangeRequested: EventEmitter<string> = new EventEmitter<string>();

    onClick(e: Event): void {

        console.log("clicked");

        let type = e.srcElement.dataset.propType;
        let active = e.srcElement.className.includes("active");

        //console.log("clicked2" + "|" + type);

        //Toggle Mode/Value
        if (type == "mode") {
            this.modesCollapsed = !this.modesCollapsed;
            if (!this.modesCollapsed) this.valuesCollapsed = true;
        } else if (type == "value") {
            this.valuesCollapsed = !this.valuesCollapsed;
            if (!this.valuesCollapsed) this.modesCollapsed = true;
        } else if (type == "valueBtn") {
            this.valuesCollapsed = !this.valuesCollapsed;
            //console.log(this.valuesCollapsed + "|" + type);
        }

        //Send Property change request
        if (!active) {
            let key = e.srcElement.dataset.key;
            let value = e.srcElement.dataset.value;

            if (type == "mode") {
                this.propChangeRequested.emit(`${this.prop.path}?${key}=${value}`);
                //Get camera-intern value for the new mode
                this.propChangeRequested.emit(`${this.genProps.queryPropState}${key.slice(0, -1)}v`);
            } else if (type == "value") {
                this.propChangeRequested.emit(`${this.prop.path}?${key}=${value}`);
            }
        }
    }

}
