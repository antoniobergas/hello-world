import { formatDate, timeAgo, capitalize } from './format';

describe('capitalize', () => {
  it('should capitalize first letter and lowercase the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('tYPEScript')).toBe('Typescript');
  });

  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle a single character', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('Z')).toBe('Z');
  });
});

describe('formatDate', () => {
  it('should return a non-empty string for a valid date', () => {
    const result = formatDate(new Date('2024-01-15'));
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should include the year in the formatted output', () => {
    expect(formatDate(new Date('2024-06-20'))).toContain('2024');
  });

  it('should produce different strings for different dates', () => {
    const d1 = formatDate(new Date('2024-01-01'));
    const d2 = formatDate(new Date('2024-12-31'));
    expect(d1).not.toBe(d2);
  });
});

describe('timeAgo', () => {
  it('should return a non-empty string', () => {
    const result = timeAgo(new Date(Date.now() - 60_000));
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should append "ago" for a past date', () => {
    expect(timeAgo(new Date(Date.now() - 3_600_000))).toContain('ago');
  });

  it('should produce "in" for a future date', () => {
    expect(timeAgo(new Date(Date.now() + 3_600_000))).toContain('in');
  });
});
