import {Component, Input, Output, EventEmitter, Type} from "@angular/core";
import {LoginService} from "./login.service";

@Component({
  moduleId: module.id,
  selector: 'login',
  templateUrl: 'login.component.html',
})

export class LoginComponent {

  ip_left: string;
  ip_right: string;
  user_left: string;
  user_right: string;
  pass_left: string;
  pass_right: string;

  private myLoginService: LoginService;

  constructor(private loginService: LoginService) {
    this.myLoginService = loginService;
  }

  login(): void {
    this.myLoginService.login(this.ip_left, this.ip_right, this.user_left, this.user_right, this.pass_left, this.pass_right);
  }

  logout(): void {
    this.myLoginService.logout();
  }
}
