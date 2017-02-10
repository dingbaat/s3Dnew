import {Injectable} from '@angular/core';
import {Message} from 'primeng/primeng';

@Injectable()
export class AppService {

    private mirror: boolean;
    private growls: Message[] = [];

    constructor() {
        this.mirror = false;
    }

    public IsMirrored(): boolean {
        return this.mirror;
    }

    public ToggleMirror(): void {
        this.mirror = !this.mirror;
    }

    public showGrowl(severity: string, summary: string, detail: string) {
        this.growls.push(
            {severity: severity, summary: summary, detail: detail}
        );
    }

    public getGrowls(): Message[] {
        return this.growls;
    }

}
