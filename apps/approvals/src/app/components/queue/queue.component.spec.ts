import { TestBed } from '@angular/core/testing';
import { QueueComponent } from './queue.component';
import { provideRouter } from '@angular/router';

describe('QueueComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QueueComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show h1 "Approval Queue"', () => {
    const fixture = TestBed.createComponent(QueueComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Approval Queue');
  });

  it('should show .approval-row elements', () => {
    const fixture = TestBed.createComponent(QueueComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.approval-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show .queue-summary', () => {
    const fixture = TestBed.createComponent(QueueComponent);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('.queue-summary');
    expect(summary).toBeTruthy();
  });

  it('should show filter tabs', () => {
    const fixture = TestBed.createComponent(QueueComponent);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.queue-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(5);
  });
});
