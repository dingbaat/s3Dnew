import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from "./app.component";
import {LoginComponent} from "./login/login.component";
import {CameraComponent} from "./camera/camera.component";
import {ArrayCheckerPipe} from "./utils/array-checker.pipe";
import {PropertyComponent} from "./views/property.component";

import {LoginService} from "./login/login.service";
import {NetworkService} from "./utils/network.service";
import {CameraService} from "./camera/camera.service";
import {AppService} from "./app.service";

@NgModule({
  declarations: [
    AppComponent,
    ArrayCheckerPipe,
    LoginComponent,
    CameraComponent,
    PropertyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  providers: [
    LoginService,
    CameraService,
    NetworkService,
    AppService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
