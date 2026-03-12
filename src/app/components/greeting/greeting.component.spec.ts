import { TestBed } from '@angular/core/testing';
import { GreetingComponent } from './greeting.component';

describe('GreetingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreetingComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GreetingComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should use "World" as the default name', async () => {
    const fixture = TestBed.createComponent(GreetingComponent);
    await fixture.whenStable();
    expect(fixture.componentInstance.displayName).toBe('World');
  });

  it('should display the provided name capitalized', async () => {
    const fixture = TestBed.createComponent(GreetingComponent);
    fixture.componentInstance.name = 'developer';
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Developer');
  });

  it('should update the displayed name when input changes', async () => {
    const fixture = TestBed.createComponent(GreetingComponent);
    fixture.componentInstance.name = 'alice';
    await fixture.whenStable();
    expect(fixture.componentInstance.displayName).toBe('Alice');

    fixture.componentInstance.name = 'bob';
    await fixture.whenStable();
    expect(fixture.componentInstance.displayName).toBe('Bob');
  });
});
