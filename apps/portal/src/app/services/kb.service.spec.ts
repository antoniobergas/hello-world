import { TestBed } from '@angular/core/testing';
import { KbService } from './kb.service';

describe('KbService (Portal)', () => {
  let service: KbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 4 articles', () => {
    expect(service.articles.length).toBe(4);
  });

  it('should find an article by id', () => {
    const article = service.getById('kb-001');
    expect(article).toBeTruthy();
    expect(article?.title).toBe('How to reset your password');
  });

  it('should return undefined for unknown article id', () => {
    expect(service.getById('unknown')).toBeUndefined();
  });

  it('should search articles by title keyword', () => {
    const results = service.search('password');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('password');
  });

  it('should search articles by tag', () => {
    const results = service.search('api');
    expect(results.some((a) => a.tags.includes('api'))).toBe(true);
  });

  it('should return empty array when search has no matches', () => {
    const results = service.search('zzz-nonexistent-zzz');
    expect(results).toHaveLength(0);
  });

  it('should increment helpful count', () => {
    const article = service.getById('kb-001')!;
    const before = article.helpful;
    service.markHelpful('kb-001', true);
    expect(service.getById('kb-001')!.helpful).toBe(before + 1);
  });

  it('should increment notHelpful count', () => {
    const article = service.getById('kb-001')!;
    const before = article.notHelpful;
    service.markHelpful('kb-001', false);
    expect(service.getById('kb-001')!.notHelpful).toBe(before + 1);
  });
});
