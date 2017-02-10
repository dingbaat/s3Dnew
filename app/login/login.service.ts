import {Injectable} from '@angular/core';
import {NetworkService} from "../utils/network.service";
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LoginService {

    private ip_left: string;
    private ip_right: string;
    private user_left: string;
    private user_right: string;
    private pass_left: string;
    private pass_right: string;
    public loggedIn: boolean = true;

    private myNetworkService: NetworkService;

    constructor(private networkService: NetworkService, private http: Http) {
        this.myNetworkService = networkService;
    }

    login(ip_left: string, ip_right: string, user_left: string, user_right: string, pass_left: string, pass_right: string): void {

        this.ip_left = ip_left;
        this.ip_right = ip_right;
        this.user_left = user_left;
        this.user_right = user_right;
        this.pass_left = pass_left;
        this.pass_right = pass_right;

        //TODO validate ip's
        //TODO Do http request
        this.loggedIn = true;
    }

    logout(): void {

        this.ip_left = "";
        this.ip_right = "";
        this.user_left = "";
        this.user_right = "";
        this.pass_left = "";
        this.pass_right = "";

        this.loggedIn = false;
    }

    public isLoggedIn(): boolean {
        return this.loggedIn;
    }

    getIp(name: string) {
        return name == "left" ? this.ip_left : this.ip_right;
    }

    public checkConnection(ipAddress: string) {
        return this.http.get(ipAddress).map(this.extractData);
    }

    private extractData(response: Response) {
        return response;
    }

}
