import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CounterService } from '../../services/counter.service';

@Component({
  selector: 'app-counter',
  imports: [AsyncPipe],
  template: `
    <div class="counter">
      <h2>Counter</h2>
      <p class="count">{{ count$ | async }}</p>
      <div class="actions">
        <button (click)="decrement()">-</button>
        <button (click)="reset()">Reset</button>
        <button (click)="increment()">+</button>
      </div>
    </div>
  `,
  styles: [
    `
      .counter {
        text-align: center;
        padding: 1rem;
      }
      .count {
        font-size: 2rem;
        font-weight: bold;
      }
      .actions button {
        margin: 0 0.25rem;
        padding: 0.5rem 1rem;
      }
    `,
  ],
})
export class CounterComponent {
  private counterService = inject(CounterService);
  readonly count$ = this.counterService.count$;

  increment(): void {
    this.counterService.increment();
  }

  decrement(): void {
    this.counterService.decrement();
  }

  reset(): void {
    this.counterService.reset();
  }
}
