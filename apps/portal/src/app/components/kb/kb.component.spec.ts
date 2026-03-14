import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { KbComponent } from './kb.component';
import { KbService } from '../../services/kb.service';

describe('KbComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(KbComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "Knowledge Base"', () => {
    const fixture = TestBed.createComponent(KbComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('Knowledge Base');
  });

  it('should render article rows for seeded data', () => {
    const fixture = TestBed.createComponent(KbComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.article-card');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should render the search input', () => {
    const fixture = TestBed.createComponent(KbComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.kb-search') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute('aria-label')).toBe('Search knowledge base');
  });

  it('should show no article detail when none is selected', () => {
    const fixture = TestBed.createComponent(KbComponent);
    fixture.detectChanges();
    const detail = fixture.nativeElement.querySelector('.article-detail');
    expect(detail).toBeFalsy();
  });

  it('openArticle() should set the selectedArticle signal', () => {
    const fixture = TestBed.createComponent(KbComponent);
    const service = TestBed.inject(KbService);
    const article = service.articles[0];
    fixture.componentInstance.openArticle(article);
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedArticle()).toBe(article);
    const detail = fixture.nativeElement.querySelector('.article-detail');
    expect(detail).toBeTruthy();
  });

  it('onSearch() should filter articles by query', () => {
    const fixture = TestBed.createComponent(KbComponent);
    fixture.detectChanges();
    const all = fixture.componentInstance.displayedArticles().length;
    fixture.componentInstance.onSearch('zzz_no_match_xyz');
    fixture.detectChanges();
    expect(fixture.componentInstance.displayedArticles().length).toBe(0);
    fixture.componentInstance.onSearch('');
    fixture.detectChanges();
    expect(fixture.componentInstance.displayedArticles().length).toBe(all);
  });
});
