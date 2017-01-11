import {Pipe, PipeTransform, Injectable} from '@angular/core';

@Pipe({
  name: 'ArrayChecker'
})

@Injectable()
export class ArrayCheckerPipe implements PipeTransform {

  public transform(value: any, arg: string): boolean {

    return arg == "is" ? value instanceof Array : !(value instanceof Array);
  }
}
