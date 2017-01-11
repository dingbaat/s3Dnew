import {Component, Input, OnInit} from '@angular/core';

import {CameraService} from "./camera.service";
import {LoginService} from "../login/login.service";

@Component({
  moduleId: module.id,
  selector: 'camera',
  templateUrl: 'camera.component.html'
})

export class CameraComponent implements OnInit {

  myLoginService: LoginService;
  myCameraService: CameraService;

  @Input()
  name: string;
  props: any;
  currProps: any;
  genProps: any;

  constructor(private cameraService: CameraService, private loginService: LoginService) {
    this.myLoginService = loginService;
    this.myCameraService = cameraService;
  }

  ngOnInit() {
    this.props = this.myCameraService.getProps(this.name);
    this.currProps = this.myCameraService.getCurrProps(this.name);
    this.genProps = this.myCameraService.getGenProps(this.name);
  }

  public test() {
    console.log(this.name);
  }

  public changeProperty(query: string): void {
    this.myCameraService.changeProperty(this.name, query);
  }

}

