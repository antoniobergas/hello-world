import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ApprovalsComponent } from './approvals.component';
import { ApprovalService } from '../../services/approval.service';

describe('ApprovalsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalsComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject ApprovalService', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    expect(fixture.componentInstance.approvalService).toBeTruthy();
  });

  it('should submit a sample request when submitSampleRequest is called', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    const service = TestBed.inject(ApprovalService);
    fixture.componentInstance.submitSampleRequest();
    expect(service.getPendingRequests().length).toBe(1);
  });

  it('should approve a request via approve()', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    const service = TestBed.inject(ApprovalService);
    fixture.componentInstance.submitSampleRequest();
    const req = service.getPendingRequests()[0];
    fixture.componentInstance.approve(req.id);
    expect(service.getByStatus('approved').length).toBe(1);
    expect(service.getPendingRequests().length).toBe(0);
  });

  it('should reject a request via reject()', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    const service = TestBed.inject(ApprovalService);
    fixture.componentInstance.submitSampleRequest();
    const req = service.getPendingRequests()[0];
    fixture.componentInstance.reject(req.id);
    expect(service.getByStatus('rejected').length).toBe(1);
  });

  it('should report historyEmpty as true when no history', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    expect(fixture.componentInstance.historyEmpty()).toBe(true);
  });

  it('should report historyEmpty as false after an approval', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    const service = TestBed.inject(ApprovalService);
    fixture.componentInstance.submitSampleRequest();
    const req = service.getPendingRequests()[0];
    fixture.componentInstance.approve(req.id);
    expect(fixture.componentInstance.historyEmpty()).toBe(false);
  });

  it('should render empty state for pending when no requests', () => {
    const fixture = TestBed.createComponent(ApprovalsComponent);
    fixture.detectChanges();
    const emptyItems = fixture.nativeElement.querySelectorAll('.empty-state');
    expect(emptyItems.length).toBeGreaterThan(0);
  });
});
