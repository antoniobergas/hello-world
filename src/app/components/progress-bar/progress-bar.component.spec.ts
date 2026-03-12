import { TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should clamp value to 0 when negative', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = -10;
    expect(fixture.componentInstance.clampedValue).toBe(0);
  });

  it('should clamp value to 100 when over 100', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = 150;
    expect(fixture.componentInstance.clampedValue).toBe(100);
  });

  it('should return the value when in range', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = 60;
    expect(fixture.componentInstance.clampedValue).toBe(60);
  });

  it('should round decimal values', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = 66.7;
    expect(fixture.componentInstance.clampedValue).toBe(67);
  });

  it('should render the progress bar track', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = 50;
    fixture.detectChanges();
    const track = fixture.nativeElement.querySelector('.progress-track');
    expect(track).toBeTruthy();
  });

  it('should render the label when provided', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = 40;
    fixture.componentInstance.label = 'Completion';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.progress-label');
    expect(label?.textContent).toContain('Completion');
  });

  it('should not render label element when label is not set', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.progress-label')).toBeFalsy();
  });

  it('should display percentage in label', () => {
    const fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentInstance.value = 75;
    fixture.componentInstance.label = 'Done';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('75%');
  });
});
