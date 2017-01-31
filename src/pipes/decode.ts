import { Pipe } from '@angular/core';

@Pipe({name: 'decode'})

export class Decode {
  transform(inputString: string): string {
    inputString = inputString.replace('&amp;', '&');
    return inputString;
  }
}