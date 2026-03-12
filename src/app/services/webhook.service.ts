import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastTriggered?: Date;
  failureCount: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failure' | 'pending';
  timestamp: Date;
  responseCode?: number;
}

@Injectable({ providedIn: 'root' })
export class WebhookService {
  private webhooksSubject = new BehaviorSubject<Webhook[]>([]);
  private deliveriesSubject = new BehaviorSubject<WebhookDelivery[]>([]);

  readonly webhooks$: Observable<Webhook[]> = this.webhooksSubject.asObservable();
  readonly deliveries$: Observable<WebhookDelivery[]> = this.deliveriesSubject.asObservable();

  get webhooks(): Webhook[] {
    return this.webhooksSubject.value;
  }

  get deliveries(): WebhookDelivery[] {
    return this.deliveriesSubject.value;
  }

  addWebhook(webhook: Webhook): void {
    this.webhooksSubject.next([...this.webhooksSubject.value, webhook]);
  }

  removeWebhook(id: string): void {
    this.webhooksSubject.next(this.webhooksSubject.value.filter((w) => w.id !== id));
    this.deliveriesSubject.next(this.deliveriesSubject.value.filter((d) => d.webhookId !== id));
  }

  toggleWebhook(id: string): void {
    this.webhooksSubject.next(
      this.webhooksSubject.value.map((w) => (w.id === id ? { ...w, active: !w.active } : w)),
    );
  }

  triggerWebhook(webhookId: string, event: string, _payload: unknown): WebhookDelivery {
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(),
      webhookId,
      event,
      status: 'success',
      timestamp: new Date(),
      responseCode: 200,
    };
    this.deliveriesSubject.next([...this.deliveriesSubject.value, delivery]);
    this.webhooksSubject.next(
      this.webhooksSubject.value.map((w) =>
        w.id === webhookId ? { ...w, lastTriggered: new Date() } : w,
      ),
    );
    return delivery;
  }

  getDeliveries(webhookId: string): WebhookDelivery[] {
    return this.deliveriesSubject.value.filter((d) => d.webhookId === webhookId);
  }

  retryDelivery(deliveryId: string): WebhookDelivery | undefined {
    const original = this.deliveriesSubject.value.find((d) => d.id === deliveryId);
    if (!original) return undefined;
    const retry: WebhookDelivery = {
      ...original,
      id: crypto.randomUUID(),
      status: 'success',
      timestamp: new Date(),
      responseCode: 200,
    };
    this.deliveriesSubject.next([...this.deliveriesSubject.value, retry]);
    return retry;
  }

  clearDeliveries(): void {
    this.deliveriesSubject.next([]);
  }

  getActiveWebhooks(): Webhook[] {
    return this.webhooksSubject.value.filter((w) => w.active);
  }
}
