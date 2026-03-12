import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookService } from './webhook.service';
import { SchedulerService } from './scheduler.service';
import { FileUploadService } from './file-upload.service';

describe('Webhook + Scheduler + FileUpload Integration', () => {
  let webhook: WebhookService;
  let scheduler: SchedulerService;
  let fileUpload: FileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebhookService, SchedulerService, FileUploadService],
    });
    webhook = TestBed.inject(WebhookService);
    scheduler = TestBed.inject(SchedulerService);
    fileUpload = TestBed.inject(FileUploadService);
  });

  it('should add a webhook and retrieve it', () => {
    webhook.addWebhook({
      id: 'wh-1',
      url: 'https://example.com/hook',
      events: ['item.created', 'item.deleted'],
      secret: 'secret123',
      active: true,
      failureCount: 0,
    });

    expect(webhook.webhooks).toHaveLength(1);
    expect(webhook.webhooks[0].id).toBe('wh-1');
    expect(webhook.webhooks[0].url).toBe('https://example.com/hook');
    expect(webhook.getActiveWebhooks()).toHaveLength(1);
  });

  it('should track webhook delivery correctly after trigger', () => {
    webhook.addWebhook({
      id: 'wh-2',
      url: 'https://api.example.com/events',
      events: ['order.placed'],
      secret: 'abc',
      active: true,
      failureCount: 0,
    });

    const delivery = webhook.triggerWebhook('wh-2', 'order.placed', { orderId: '999' });
    expect(delivery.webhookId).toBe('wh-2');
    expect(delivery.event).toBe('order.placed');
    expect(delivery.status).toBe('success');
    expect(delivery.responseCode).toBe(200);

    const deliveries = webhook.getDeliveries('wh-2');
    expect(deliveries).toHaveLength(1);
    expect(deliveries[0].id).toBe(delivery.id);
  });

  it('should enable and disable scheduler jobs', () => {
    scheduler.addJob({
      id: 'job-1',
      name: 'Cleanup Job',
      expression: '0 0 * * *',
      description: 'Daily cleanup',
      enabled: true,
      nextRun: new Date(),
      status: 'idle',
      runCount: 0,
    });

    expect(scheduler.jobs[0].enabled).toBe(true);
    scheduler.disableJob('job-1');
    expect(scheduler.jobs[0].enabled).toBe(false);

    scheduler.enableJob('job-1');
    expect(scheduler.jobs[0].enabled).toBe(true);
    expect(scheduler.getEnabledJobs()).toHaveLength(1);
  });

  it('should increment run count when runJobNow is called', () => {
    scheduler.addJob({
      id: 'job-2',
      name: 'Export Job',
      expression: '0 6 * * *',
      description: 'Daily export',
      enabled: true,
      nextRun: new Date(),
      status: 'idle',
      runCount: 0,
    });

    scheduler.runJobNow('job-2');
    expect(scheduler.jobs[0].runCount).toBe(1);

    scheduler.runJobNow('job-2');
    scheduler.runJobNow('job-2');
    expect(scheduler.jobs[0].runCount).toBe(3);

    const history = scheduler.getJobHistory('job-2');
    expect(history).toHaveLength(3);
  });

  it('should add file upload records and tag them', () => {
    fileUpload.addFile({
      id: 'f1',
      name: 'report.pdf',
      size: 204800,
      type: 'application/pdf',
      uploadedAt: new Date(),
      uploadedBy: 'user1',
      url: '/files/report.pdf',
      status: 'complete',
      tags: [],
    });

    fileUpload.addTag('f1', 'reports');
    fileUpload.addTag('f1', 'finance');

    expect(fileUpload.files[0].tags).toContain('reports');
    expect(fileUpload.files[0].tags).toContain('finance');
  });

  it('should filter files by tag correctly', () => {
    fileUpload.addFile({
      id: 'f2',
      name: 'logo.png',
      size: 10240,
      type: 'image/png',
      uploadedAt: new Date(),
      uploadedBy: 'user2',
      url: '/files/logo.png',
      status: 'complete',
      tags: ['images', 'brand'],
    });
    fileUpload.addFile({
      id: 'f3',
      name: 'data.csv',
      size: 51200,
      type: 'text/csv',
      uploadedAt: new Date(),
      uploadedBy: 'user2',
      url: '/files/data.csv',
      status: 'complete',
      tags: ['data', 'export'],
    });

    const imageFiles = fileUpload.getFilesWithTag('images');
    expect(imageFiles).toHaveLength(1);
    expect(imageFiles[0].id).toBe('f2');

    const exportFiles = fileUpload.getFilesWithTag('export');
    expect(exportFiles).toHaveLength(1);
    expect(exportFiles[0].id).toBe('f3');
  });

  it('should sum total file sizes correctly', () => {
    fileUpload.addFile({
      id: 'f4',
      name: 'small.txt',
      size: 1024,
      type: 'text/plain',
      uploadedAt: new Date(),
      uploadedBy: 'u1',
      url: '/files/small.txt',
      status: 'complete',
      tags: [],
    });
    fileUpload.addFile({
      id: 'f5',
      name: 'large.zip',
      size: 1048576,
      type: 'application/zip',
      uploadedAt: new Date(),
      uploadedBy: 'u1',
      url: '/files/large.zip',
      status: 'complete',
      tags: [],
    });

    expect(fileUpload.getTotalSize()).toBe(1024 + 1048576);
  });

  it('should remove a file correctly', () => {
    fileUpload.addFile({
      id: 'f6',
      name: 'temp.log',
      size: 512,
      type: 'text/plain',
      uploadedAt: new Date(),
      uploadedBy: 'system',
      url: '/files/temp.log',
      status: 'complete',
      tags: [],
    });
    fileUpload.addFile({
      id: 'f7',
      name: 'keep.log',
      size: 1024,
      type: 'text/plain',
      uploadedAt: new Date(),
      uploadedBy: 'system',
      url: '/files/keep.log',
      status: 'complete',
      tags: [],
    });

    expect(fileUpload.files).toHaveLength(2);
    fileUpload.removeFile('f6');
    expect(fileUpload.files).toHaveLength(1);
    expect(fileUpload.files[0].id).toBe('f7');
  });

  it('should remove webhook and its deliveries together', () => {
    webhook.addWebhook({
      id: 'wh-3',
      url: 'https://example.com/wh3',
      events: ['ping'],
      secret: 'x',
      active: true,
      failureCount: 0,
    });
    webhook.triggerWebhook('wh-3', 'ping', {});
    webhook.triggerWebhook('wh-3', 'ping', {});
    expect(webhook.getDeliveries('wh-3')).toHaveLength(2);

    webhook.removeWebhook('wh-3');
    expect(webhook.webhooks).toHaveLength(0);
    expect(webhook.getDeliveries('wh-3')).toHaveLength(0);
  });

  it('should toggle webhook active state', () => {
    webhook.addWebhook({
      id: 'wh-4',
      url: 'https://example.com/wh4',
      events: ['user.signup'],
      secret: 'secret',
      active: true,
      failureCount: 0,
    });

    expect(webhook.webhooks[0].active).toBe(true);
    webhook.toggleWebhook('wh-4');
    expect(webhook.webhooks[0].active).toBe(false);
    expect(webhook.getActiveWebhooks()).toHaveLength(0);

    webhook.toggleWebhook('wh-4');
    expect(webhook.webhooks[0].active).toBe(true);
  });
});
