import { TestBed } from '@angular/core/testing';
import { SubmitComponent } from './submit.component';
import { provideRouter } from '@angular/router';

describe('SubmitComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SubmitComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show h1 "Submit Request"', () => {
    const fixture = TestBed.createComponent(SubmitComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Submit Request');
  });

  it('should have form fields present', () => {
    const fixture = TestBed.createComponent(SubmitComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select[name="type"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="title"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('textarea[name="description"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('select[name="priority"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="requestedBy"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.submit-request-btn')).toBeTruthy();
  });
});
