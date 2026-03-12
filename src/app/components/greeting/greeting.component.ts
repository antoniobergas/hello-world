import { Component, Input } from '@angular/core';
import { capitalize } from '../../utils/format';

@Component({
  selector: 'app-greeting',
  imports: [],
  template: `
    <div class="greeting">
      <p>Hello, {{ displayName }}!</p>
    </div>
  `,
  styles: [
    `
      .greeting {
        font-size: 1.2rem;
        margin: 1rem 0;
      }
    `,
  ],
})
export class GreetingComponent {
  @Input() name: string = 'World';

  get displayName(): string {
    return capitalize(this.name);
  }
}
