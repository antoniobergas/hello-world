import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-container" [attr.aria-label]="label || 'Progress'">
      @if (label) {
        <div class="progress-label">
          <span>{{ label }}</span>
          <span class="progress-pct">{{ clampedValue }}%</span>
        </div>
      }
      <div
        class="progress-track"
        role="progressbar"
        [attr.aria-valuenow]="clampedValue"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="progress-fill" [style.width.%]="clampedValue"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .progress-container {
        width: 100%;
      }
      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }
      .progress-pct {
        font-weight: 600;
        color: #1e293b;
      }
      .progress-track {
        height: 10px;
        background: #e2e8f0;
        border-radius: 9999px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: #22c55e;
        border-radius: 9999px;
        transition: width 0.3s ease;
      }
    `,
  ],
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() label?: string;

  get clampedValue(): number {
    return Math.min(100, Math.max(0, Math.round(this.value)));
  }
}
