import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SavedSearch {
  id: string;
  name: string;
  userId: string;
  entity: 'items' | 'tickets' | 'customers' | 'invoices';
  filters: Record<string, unknown>;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  createdAt: Date;
  lastUsedAt?: Date;
  useCount: number;
}

const SEED_SEARCHES: SavedSearch[] = [
  { id: 'ss1', name: 'Open Tickets', userId: 'u1', entity: 'tickets', filters: { status: 'open' }, sortBy: 'createdAt', sortDir: 'desc', createdAt: new Date('2024-01-01'), useCount: 25 },
  { id: 'ss2', name: 'High Value Customers', userId: 'u1', entity: 'customers', filters: { value: { gt: 10000 } }, sortBy: 'value', sortDir: 'desc', createdAt: new Date('2024-02-01'), useCount: 12 },
  { id: 'ss3', name: 'Overdue Invoices', userId: 'u2', entity: 'invoices', filters: { overdue: true }, sortBy: 'dueDate', sortDir: 'asc', createdAt: new Date('2024-03-01'), useCount: 18 },
  { id: 'ss4', name: 'New Items', userId: 'u2', entity: 'items', filters: { createdAt: { gt: '2024-01-01' } }, sortBy: 'createdAt', sortDir: 'desc', createdAt: new Date('2024-04-01'), useCount: 5 },
  { id: 'ss5', name: 'Pending Tickets', userId: 'u3', entity: 'tickets', filters: { status: 'pending' }, sortBy: 'priority', sortDir: 'desc', createdAt: new Date('2024-05-01'), useCount: 0 },
  { id: 'ss6', name: 'Enterprise Customers', userId: 'u1', entity: 'customers', filters: { tier: 'enterprise' }, sortBy: 'name', sortDir: 'asc', createdAt: new Date('2024-06-01'), useCount: 8 },
  { id: 'ss7', name: 'Paid Invoices', userId: 'u3', entity: 'invoices', filters: { status: 'paid' }, sortBy: 'paidAt', sortDir: 'desc', createdAt: new Date('2024-07-01'), useCount: 3 },
  { id: 'ss8', name: 'Low Stock Items', userId: 'u2', entity: 'items', filters: { stock: { lt: 10 } }, sortBy: 'stock', sortDir: 'asc', createdAt: new Date('2024-08-01'), useCount: 15 },
  { id: 'ss9', name: 'Closed Tickets', userId: 'u3', entity: 'tickets', filters: { status: 'closed' }, sortBy: 'closedAt', sortDir: 'desc', createdAt: new Date('2024-09-01'), useCount: 7 },
  { id: 'ss10', name: 'Draft Invoices', userId: 'u1', entity: 'invoices', filters: { status: 'draft' }, sortBy: 'createdAt', sortDir: 'asc', createdAt: new Date('2024-10-01'), useCount: 2 },
];

@Injectable({ providedIn: 'root' })
export class SavedSearchService {
  private searchesSubject = new BehaviorSubject<SavedSearch[]>(SEED_SEARCHES);

  readonly searches$: Observable<SavedSearch[]> = this.searchesSubject.asObservable();

  get searches(): SavedSearch[] {
    return this.searchesSubject.getValue();
  }

  save(data: Omit<SavedSearch, 'id' | 'createdAt' | 'useCount'>): SavedSearch {
    const search: SavedSearch = { ...data, id: crypto.randomUUID(), createdAt: new Date(), useCount: 0 };
    this.searchesSubject.next([...this.searches, search]);
    return search;
  }

  delete(id: string): void {
    this.searchesSubject.next(this.searches.filter(s => s.id !== id));
  }

  execute(id: string): SavedSearch | undefined {
    const search = this.searches.find(s => s.id === id);
    if (!search) return undefined;
    this.searchesSubject.next(
      this.searches.map(s => s.id === id ? { ...s, useCount: s.useCount + 1, lastUsedAt: new Date() } : s)
    );
    return this.searches.find(s => s.id === id);
  }

  getByUser(userId: string): SavedSearch[] {
    return this.searches.filter(s => s.userId === userId);
  }

  getByEntity(entity: SavedSearch['entity']): SavedSearch[] {
    return this.searches.filter(s => s.entity === entity);
  }

  getMostUsed(limit = 5): SavedSearch[] {
    return [...this.searches].sort((a, b) => b.useCount - a.useCount).slice(0, limit);
  }

  rename(id: string, name: string): void {
    this.searchesSubject.next(this.searches.map(s => s.id === id ? { ...s, name } : s));
  }

  updateFilters(id: string, filters: Record<string, unknown>): void {
    this.searchesSubject.next(this.searches.map(s => s.id === id ? { ...s, filters } : s));
  }
}
