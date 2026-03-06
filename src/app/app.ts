import { Component } from '@angular/core';
import { CounterComponent } from './components/counter/counter.component';
import { GreetingComponent } from './components/greeting/greeting.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent, GreetingComponent],
  template: `
    <h1>Hello World from Angular + GitHub + PR CI test</h1>
    <app-greeting name="angular" />
    <app-counter />
  `,
  styles: [],
})
export class App {}
