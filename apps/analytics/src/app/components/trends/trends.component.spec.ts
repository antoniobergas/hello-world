import { TestBed } from '@angular/core/testing';
import { TrendsComponent } from './trends.component';
import { provideRouter } from '@angular/router';

describe('TrendsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TrendsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show h1 "Trend Analysis"', () => {
    const fixture = TestBed.createComponent(TrendsComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Trend Analysis');
  });

  it('should show series selector', () => {
    const fixture = TestBed.createComponent(TrendsComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('.series-select');
    expect(select).toBeTruthy();
  });

  it('should show .data-point-row elements when series is selected', () => {
    const fixture = TestBed.createComponent(TrendsComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.data-point-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show .trend-summary', () => {
    const fixture = TestBed.createComponent(TrendsComponent);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('.trend-summary');
    expect(summary).toBeTruthy();
  });
});
