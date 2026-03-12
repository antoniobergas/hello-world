import { validateItemCreate, ItemCreateSchema } from './validation';

describe('ItemCreateSchema', () => {
  it('should accept a valid minimal item', () => {
    const result = ItemCreateSchema.safeParse({ title: 'My task' });
    expect(result.success).toBe(true);
  });

  it('should reject an empty title', () => {
    const result = ItemCreateSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('should reject a title longer than 200 characters', () => {
    const result = ItemCreateSchema.safeParse({ title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should apply default priority of medium', () => {
    const result = ItemCreateSchema.safeParse({ title: 'Task' });
    expect(result.success && result.data.priority).toBe('medium');
  });

  it('should apply default category of general', () => {
    const result = ItemCreateSchema.safeParse({ title: 'Task' });
    expect(result.success && result.data.category).toBe('general');
  });

  it('should apply default completed of false', () => {
    const result = ItemCreateSchema.safeParse({ title: 'Task' });
    expect(result.success && result.data.completed).toBe(false);
  });

  it('should accept a valid priority', () => {
    for (const p of ['low', 'medium', 'high'] as const) {
      const result = ItemCreateSchema.safeParse({ title: 'T', priority: p });
      expect(result.success).toBe(true);
    }
  });

  it('should reject an invalid priority', () => {
    const result = ItemCreateSchema.safeParse({ title: 'T', priority: 'critical' });
    expect(result.success).toBe(false);
  });

  it('should reject more than 10 tags', () => {
    const result = ItemCreateSchema.safeParse({
      title: 'T',
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });

  it('should accept a valid dueDate', () => {
    const result = ItemCreateSchema.safeParse({
      title: 'T',
      dueDate: new Date('2025-12-01'),
    });
    expect(result.success).toBe(true);
  });
});

describe('validateItemCreate', () => {
  it('should return success:true for valid data', () => {
    const result = validateItemCreate({ title: 'Good task', priority: 'high' });
    expect(result.success).toBe(true);
  });

  it('should return success:false with errors for invalid data', () => {
    const result = validateItemCreate({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('should list all validation error messages', () => {
    const result = validateItemCreate({ title: 'X', priority: 'bad' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Array.isArray(result.errors)).toBe(true);
    }
  });
});
