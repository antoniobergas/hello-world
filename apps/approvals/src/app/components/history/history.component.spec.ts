import { TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { provideRouter } from '@angular/router';

describe('HistoryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show h1 "Approval History"', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Approval History');
  });

  it('should show .history-row elements', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.history-row');
    expect(rows.length).toBeGreaterThan(0);
  });
});
