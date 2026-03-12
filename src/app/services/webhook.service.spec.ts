import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookService, Webhook } from './webhook.service';

const makeWebhook = (id: string, active = true): Webhook => ({
  id,
  url: `https://example.com/hook/${id}`,
  events: ['item.created', 'item.deleted'],
  secret: 'secret123',
  active,
  failureCount: 0,
});

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [WebhookService] });
    service = TestBed.inject(WebhookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty webhooks', () => {
    expect(service.webhooks.length).toBe(0);
  });

  it('should add a webhook', () => {
    service.addWebhook(makeWebhook('w1'));
    expect(service.webhooks.length).toBe(1);
  });

  it('should remove a webhook', () => {
    service.addWebhook(makeWebhook('w1'));
    service.removeWebhook('w1');
    expect(service.webhooks.length).toBe(0);
  });

  it('should toggle webhook active state', () => {
    service.addWebhook(makeWebhook('w1', true));
    service.toggleWebhook('w1');
    expect(service.webhooks[0].active).toBe(false);
    service.toggleWebhook('w1');
    expect(service.webhooks[0].active).toBe(true);
  });

  it('should trigger a webhook and create a delivery', () => {
    service.addWebhook(makeWebhook('w1'));
    const delivery = service.triggerWebhook('w1', 'item.created', { id: '1' });
    expect(delivery.webhookId).toBe('w1');
    expect(delivery.event).toBe('item.created');
    expect(delivery.status).toBe('success');
    expect(service.deliveries.length).toBe(1);
  });

  it('should get deliveries for a specific webhook', () => {
    service.addWebhook(makeWebhook('w1'));
    service.addWebhook(makeWebhook('w2'));
    service.triggerWebhook('w1', 'item.created', {});
    service.triggerWebhook('w2', 'item.deleted', {});
    expect(service.getDeliveries('w1').length).toBe(1);
  });

  it('should retry a delivery', () => {
    service.addWebhook(makeWebhook('w1'));
    const delivery = service.triggerWebhook('w1', 'item.created', {});
    const retry = service.retryDelivery(delivery.id);
    expect(retry).toBeDefined();
    expect(retry?.status).toBe('success');
    expect(service.deliveries.length).toBe(2);
  });

  it('should return undefined when retrying non-existent delivery', () => {
    expect(service.retryDelivery('nonexistent')).toBeUndefined();
  });

  it('should clear all deliveries', () => {
    service.addWebhook(makeWebhook('w1'));
    service.triggerWebhook('w1', 'item.created', {});
    service.clearDeliveries();
    expect(service.deliveries.length).toBe(0);
  });

  it('should remove deliveries when webhook is removed', () => {
    service.addWebhook(makeWebhook('w1'));
    service.triggerWebhook('w1', 'item.created', {});
    service.removeWebhook('w1');
    expect(service.deliveries.length).toBe(0);
  });

  it('should update lastTriggered on trigger', () => {
    service.addWebhook(makeWebhook('w1'));
    service.triggerWebhook('w1', 'item.created', {});
    expect(service.webhooks[0].lastTriggered).toBeDefined();
  });

  it('should emit updated list via webhooks$', async () => {
    service.addWebhook(makeWebhook('w1'));
    const webhooks = await firstValueFrom(service.webhooks$);
    expect(webhooks.length).toBe(1);
  });
});
