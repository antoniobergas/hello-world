import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CounterService {
  private countSubject = new BehaviorSubject<number>(0);
  readonly count$: Observable<number> = this.countSubject.asObservable();

  increment(): void {
    this.countSubject.next(this.countSubject.value + 1);
  }

  decrement(): void {
    this.countSubject.next(this.countSubject.value - 1);
  }

  reset(): void {
    this.countSubject.next(0);
  }

  get current(): number {
    return this.countSubject.value;
  }
}
