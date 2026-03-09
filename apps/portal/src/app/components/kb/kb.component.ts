import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { KbService } from '../../services/kb.service';
import { KbArticle } from '../../models/kb-article.model';

@Component({
  selector: 'app-kb',
  imports: [FormsModule, DatePipe],
  template: `
    <section class="kb-page" aria-label="Knowledge base">
      <h1>Knowledge Base</h1>

      <div class="search-bar">
        <input
          class="kb-search"
          [(ngModel)]="query"
          (ngModelChange)="onSearch($event)"
          placeholder="Search articles…"
          aria-label="Search knowledge base"
        />
      </div>

      @if (selectedArticle()) {
        <div class="article-detail" aria-label="Article detail">
          <button
            class="back-btn"
            (click)="selectedArticle.set(null)"
            aria-label="Back to article list"
          >
            ← Back to results
          </button>
          <h2 class="article-title">{{ selectedArticle()!.title }}</h2>
          <p class="article-summary">{{ selectedArticle()!.summary }}</p>
          <div class="article-body">{{ selectedArticle()!.body }}</div>
          <div class="article-meta">
            <span class="article-views">{{ selectedArticle()!.views }} views</span>
            <span class="article-date"
              >Published {{ selectedArticle()!.publishedAt | date: 'mediumDate' }}</span
            >
          </div>
          <div class="helpful-row" aria-label="Was this helpful?">
            <span>Was this helpful?</span>
            <button
              class="helpful-btn"
              (click)="markHelpful(selectedArticle()!.id, true)"
              aria-label="Mark article as helpful"
            >
              👍 Yes ({{ selectedArticle()!.helpful }})
            </button>
            <button
              class="not-helpful-btn"
              (click)="markHelpful(selectedArticle()!.id, false)"
              aria-label="Mark article as not helpful"
            >
              👎 No ({{ selectedArticle()!.notHelpful }})
            </button>
          </div>
        </div>
      } @else {
        <ul class="article-list" aria-label="Article list">
          @for (article of displayedArticles(); track article.id) {
            <li class="article-card" [attr.aria-label]="'Article: ' + article.title">
              <button class="article-card-btn" (click)="openArticle(article)">
                <h3 class="article-card-title">{{ article.title }}</h3>
                <p class="article-card-summary">{{ article.summary }}</p>
                <div class="article-card-tags">
                  @for (tag of article.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              </button>
            </li>
          }
          @if (displayedArticles().length === 0) {
            <li class="empty-state">No articles match your search.</li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .kb-page {
        max-width: 800px;
        margin: 0 auto;
      }
      h1 {
        margin-bottom: 1rem;
      }
      .search-bar {
        margin-bottom: 1.5rem;
      }
      .kb-search {
        width: 100%;
        padding: 0.6rem 1rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
      }
      .article-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .article-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .article-card-btn {
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 1rem;
        cursor: pointer;
      }
      .article-card-btn:hover {
        background: #f8fafc;
      }
      .article-card-title {
        margin: 0 0 0.25rem;
        font-size: 1rem;
        color: #1e293b;
      }
      .article-card-summary {
        margin: 0 0 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
      }
      .article-card-tags {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }
      .tag {
        background: #f1f5f9;
        color: #475569;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .article-detail {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
      }
      .back-btn {
        background: none;
        border: none;
        color: #3b82f6;
        cursor: pointer;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        padding: 0;
      }
      .article-title {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
      }
      .article-summary {
        color: #64748b;
        margin-bottom: 1rem;
      }
      .article-body {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #374151;
        margin-bottom: 1rem;
      }
      .article-meta {
        display: flex;
        gap: 1.5rem;
        font-size: 0.8rem;
        color: #94a3b8;
        margin-bottom: 1rem;
      }
      .helpful-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .helpful-btn,
      .not-helpful-btn {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.4rem 0.75rem;
        font-size: 0.85rem;
        cursor: pointer;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
      }
    `,
  ],
})
export class KbComponent {
  private kbService = inject(KbService);

  query = '';
  selectedArticle = signal<KbArticle | null>(null);

  displayedArticles = signal(this.kbService.articles);

  onSearch(q: string): void {
    this.displayedArticles.set(q.trim() ? this.kbService.search(q) : this.kbService.articles);
  }

  openArticle(article: KbArticle): void {
    this.selectedArticle.set(article);
  }

  markHelpful(id: string, helpful: boolean): void {
    this.kbService.markHelpful(id, helpful);
    // Refresh the displayed article to reflect updated counts.
    const updated = this.kbService.getById(id);
    if (updated) this.selectedArticle.set(updated);
  }
}
