import {Injectable} from '@angular/core';

@Injectable()
export class AppService {

  private mirror: boolean;

  constructor() {
    this.mirror = false;
  }

  public IsMirrored(): boolean {
    return this.mirror;
  }

  public ToggleMirror(): void {
    this.mirror = !this.mirror;
  }

}
