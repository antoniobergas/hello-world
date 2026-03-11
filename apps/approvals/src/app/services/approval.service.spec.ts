import { TestBed } from '@angular/core/testing';
import { ApprovalService } from './approval.service';

describe('ApprovalService', () => {
  let service: ApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 6 initial requests', () => {
    expect(service.requests.length).toBe(6);
  });

  it('should submit() create a pending request and prepend it', () => {
    const before = service.requests.length;
    const req = service.submit({
      type: 'expense',
      title: 'Test Expense',
      description: 'A test expense request',
      requestedBy: 'Test User',
      status: 'pending',
      priority: 'normal',
      tags: [],
    });
    expect(req.id).toBeTruthy();
    expect(req.status).toBe('pending');
    expect(service.requests.length).toBe(before + 1);
    expect(service.requests[0].id).toBe(req.id);
  });

  it('should approve() set status to approved and add a comment', () => {
    const pending = service.requests.find((r) => r.status === 'pending');
    service.approve(pending!.id, 'Reviewer A', 'Looks good');
    const updated = service.getById(pending!.id);
    expect(updated!.status).toBe('approved');
    expect(updated!.comments.some((c) => c.body === 'Looks good' && c.isDecision)).toBe(true);
  });

  it('should reject() set status to rejected and add a comment', () => {
    const pending = service.requests.find((r) => r.status === 'pending' || r.status === 'in_review');
    service.reject(pending!.id, 'Reviewer B', 'Not approved');
    const updated = service.getById(pending!.id);
    expect(updated!.status).toBe('rejected');
    expect(updated!.comments.some((c) => c.isDecision)).toBe(true);
  });

  it('should cancel() set status to cancelled', () => {
    const req = service.requests.find((r) => r.status === 'draft');
    service.cancel(req!.id);
    const updated = service.getById(req!.id);
    expect(updated!.status).toBe('cancelled');
  });

  it('should addComment() add comment to request', () => {
    const req = service.requests[0];
    const before = req.comments.length;
    service.addComment(req.id, 'Alice', 'Please expedite');
    const updated = service.getById(req.id);
    expect(updated!.comments.length).toBe(before + 1);
    expect(updated!.comments.at(-1)!.body).toBe('Please expedite');
  });

  it('should getById() return the correct request', () => {
    const req = service.getById('ar2');
    expect(req).toBeTruthy();
    expect(req!.title).toBe('Software License Renewal - Jira');
  });
});
