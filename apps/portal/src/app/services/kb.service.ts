import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KbArticle } from '../models/kb-article.model';

const SEED_ARTICLES: KbArticle[] = [
  {
    id: 'kb-001',
    title: 'How to reset your password',
    summary: 'Step-by-step guide for resetting your account password.',
    body: 'Go to the login page and click "Forgot password". Enter your email address and follow the instructions in the email you receive.',
    category: 'account',
    tags: ['password', 'login', 'account'],
    views: 1240,
    helpful: 98,
    notHelpful: 4,
    publishedAt: new Date('2024-09-01'),
  },
  {
    id: 'kb-002',
    title: 'Understanding your invoice',
    summary: 'A breakdown of all line items on your monthly invoice.',
    body: 'Your invoice includes your base plan, any add-on features, and usage charges. Discounts and credits are applied before tax.',
    category: 'billing',
    tags: ['invoice', 'billing', 'charges'],
    views: 876,
    helpful: 74,
    notHelpful: 8,
    publishedAt: new Date('2024-10-15'),
  },
  {
    id: 'kb-003',
    title: 'API rate limits explained',
    summary: 'Learn about our API rate limits and how to handle 429 responses.',
    body: 'Each plan has a per-minute and per-day rate limit. When you exceed either limit you receive a 429 status code with a Retry-After header.',
    category: 'technical',
    tags: ['api', 'rate-limit', 'integration'],
    views: 2105,
    helpful: 189,
    notHelpful: 12,
    publishedAt: new Date('2024-11-01'),
  },
  {
    id: 'kb-004',
    title: 'Getting started with the dashboard',
    summary: 'A quick tour of the AppBench customer dashboard.',
    body: 'The dashboard shows your active tickets, recent activity, and quick links to submit a new ticket or browse the knowledge base.',
    category: 'general',
    tags: ['dashboard', 'onboarding', 'getting-started'],
    views: 3500,
    helpful: 310,
    notHelpful: 5,
    publishedAt: new Date('2024-08-01'),
  },
];

@Injectable({ providedIn: 'root' })
export class KbService {
  private articlesSubject = new BehaviorSubject<KbArticle[]>([...SEED_ARTICLES]);
  readonly articles$ = this.articlesSubject.asObservable();

  get articles(): KbArticle[] {
    return this.articlesSubject.value;
  }

  getById(id: string): KbArticle | undefined {
    return this.articlesSubject.value.find((a) => a.id === id);
  }

  search(query: string): KbArticle[] {
    const q = query.toLowerCase();
    return this.articlesSubject.value.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)),
    );
  }

  markHelpful(id: string, helpful: boolean): void {
    const articles = this.articlesSubject.value.map((a) =>
      a.id === id
        ? {
            ...a,
            helpful: helpful ? a.helpful + 1 : a.helpful,
            notHelpful: helpful ? a.notHelpful : a.notHelpful + 1,
          }
        : a,
    );
    this.articlesSubject.next(articles);
  }
}
