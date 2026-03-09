import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ApprovalService } from './approval.service';

describe('ApprovalService', () => {
  let service: ApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApprovalService] });
    service = TestBed.inject(ApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no requests', () => {
    expect(service.requests.length).toBe(0);
  });

  it('should submit a request with pending status', () => {
    const req = service.submitRequest('access', 'Admin Access', 'Need admin', 'alice');
    expect(req.status).toBe('pending');
    expect(req.requestedBy).toBe('alice');
    expect(req.title).toBe('Admin Access');
  });

  it('should approve a request', () => {
    const req = service.submitRequest('access', 'Admin Access', 'Need admin', 'alice');
    service.approve(req.id, 'manager', 'Looks good');
    const updated = service.requests.find((r) => r.id === req.id);
    expect(updated?.status).toBe('approved');
    expect(updated?.reviewedBy).toBe('manager');
    expect(updated?.comments).toBe('Looks good');
  });

  it('should reject a request', () => {
    const req = service.submitRequest('access', 'Admin Access', 'Need admin', 'alice');
    service.reject(req.id, 'manager', 'Not justified');
    const updated = service.requests.find((r) => r.id === req.id);
    expect(updated?.status).toBe('rejected');
  });

  it('should get pending requests only', () => {
    const r1 = service.submitRequest('type', 'T1', '', 'alice');
    const r2 = service.submitRequest('type', 'T2', '', 'bob');
    service.approve(r1.id, 'mgr', '');
    expect(service.getPendingRequests().length).toBe(1);
    expect(service.getPendingRequests()[0].id).toBe(r2.id);
  });

  it('should get requests by status', () => {
    const r1 = service.submitRequest('type', 'T1', '', 'alice');
    service.approve(r1.id, 'mgr', '');
    expect(service.getByStatus('approved').length).toBe(1);
    expect(service.getByStatus('rejected').length).toBe(0);
  });

  it('should get requests by user', () => {
    service.submitRequest('type', 'T1', '', 'alice');
    service.submitRequest('type', 'T2', '', 'bob');
    expect(service.getRequestsByUser('alice').length).toBe(1);
    expect(service.getRequestsByUser('charlie').length).toBe(0);
  });

  it('should emit updated requests via requests$', async () => {
    service.submitRequest('type', 'T1', '', 'alice');
    const requests = await firstValueFrom(service.requests$);
    expect(requests.length).toBe(1);
  });

  it('should emit pending requests via pendingRequests$', async () => {
    service.submitRequest('type', 'T1', '', 'alice');
    const pending = await firstValueFrom(service.pendingRequests$);
    expect(pending.length).toBe(1);
  });

  it('should set reviewedAt when approving', () => {
    const req = service.submitRequest('type', 'T1', '', 'alice');
    service.approve(req.id, 'mgr', '');
    const updated = service.requests.find((r) => r.id === req.id);
    expect(updated?.reviewedAt).toBeDefined();
  });
});
