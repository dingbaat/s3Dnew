import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {AppComponent} from "./app.component";
import {LoginComponent} from "./login/login.component";
import {CameraComponent} from "./camera/camera.component";
import {ArrayCheckerPipe} from "./utils/array-checker.pipe";
import {DropdownSliderComponent} from "./views/dropdown_slider.component";
import {ButtonsComponent} from "./views/buttons.component";
import {SliderComponent} from "./views/slider.component";
import {ToggleComponent} from "./views/toggle.component";
import {LiveviewComponent} from "./views/liveview.component";
import {RadioButtonModule, RadioButton} from 'primeng/primeng';

import {LoginService} from "./login/login.service";
import {CameraService} from "./camera/camera.service";
import {AppService} from "./app.service";

import {
    DropdownModule,
    SliderModule,
    ButtonModule,
    ToggleButtonModule,
    GrowlModule
} from 'primeng/primeng';

@NgModule({
    declarations: [
        AppComponent,
        ArrayCheckerPipe,
        LoginComponent,
        CameraComponent,
        DropdownSliderComponent,
        ButtonsComponent,
        SliderComponent,
        ToggleComponent,
        LiveviewComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        GrowlModule, ToggleButtonModule, DropdownModule, SliderModule, ButtonModule, RadioButtonModule
    ],
    providers: [
        LoginService,
        CameraService,
        AppService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
