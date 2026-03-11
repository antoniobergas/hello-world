import { TestBed } from '@angular/core/testing';
import { LeaveComponent } from './leave.component';
import { provideRouter } from '@angular/router';

describe('LeaveComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "Leave Requests"', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Leave Requests');
  });

  it('should show .leave-row elements for seeded data', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.leave-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show leave filter buttons', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const btns = fixture.nativeElement.querySelectorAll('.leave-filter-btn');
    expect(btns.length).toBeGreaterThanOrEqual(4);
  });
});
