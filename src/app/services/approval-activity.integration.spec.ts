import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ApprovalService } from './approval.service';
import { ActivityService } from './activity.service';
import { AuditLogService } from './audit-log.service';

describe('Approval + Activity + AuditLog Integration', () => {
  let approval: ApprovalService;
  let activity: ActivityService;
  let auditLog: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApprovalService, ActivityService, AuditLogService],
    });
    approval = TestBed.inject(ApprovalService);
    activity = TestBed.inject(ActivityService);
    auditLog = TestBed.inject(AuditLogService);
  });

  it('should log an activity entry when an approval request is submitted', () => {
    const req = approval.submitRequest('deploy', 'Deploy v2', 'Deploy version 2', 'alice');
    activity.logActivity('u1', 'alice', 'SUBMIT_APPROVAL', 'approval', req.id, { type: req.type });

    const entries = activity.getActivitiesForEntity('approval', req.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('SUBMIT_APPROVAL');
    expect(entries[0].username).toBe('alice');
  });

  it('should log an audit entry when a request is approved', () => {
    const req = approval.submitRequest('config', 'Update Config', 'Change env vars', 'bob');
    approval.approve(req.id, 'admin', 'Looks good');
    auditLog.log('u0', 'admin', 'UPDATE', 'approval', `Approved request ${req.id}`, {
      resourceId: req.id,
      severity: 'medium',
    });

    const adminEntries = auditLog.getByUser('u0');
    expect(adminEntries).toHaveLength(1);
    expect(adminEntries[0].action).toBe('UPDATE');
    expect(adminEntries[0].details).toContain(req.id);

    const approved = approval.getByStatus('approved');
    expect(approved).toHaveLength(1);
    expect(approved[0].reviewedBy).toBe('admin');
  });

  it('should log an audit entry when a request is rejected', () => {
    const req = approval.submitRequest('access', 'Admin Access', 'Need admin rights', 'charlie');
    approval.reject(req.id, 'admin', 'Not approved');
    auditLog.log('u0', 'admin', 'UPDATE', 'approval', `Rejected request ${req.id}`, {
      resourceId: req.id,
      severity: 'medium',
    });

    const rejected = approval.getByStatus('rejected');
    expect(rejected).toHaveLength(1);
    expect(rejected[0].comments).toBe('Not approved');

    const auditEntries = auditLog.getByResource('approval');
    expect(auditEntries).toHaveLength(1);
  });

  it('should show all approval-related actions in the activity feed', () => {
    const req1 = approval.submitRequest('deploy', 'Deploy A', 'Deploy service A', 'alice');
    const req2 = approval.submitRequest('config', 'Config B', 'Config service B', 'bob');

    activity.logActivity('u1', 'alice', 'SUBMIT', 'approval', req1.id);
    activity.logActivity('u2', 'bob', 'SUBMIT', 'approval', req2.id);
    activity.logActivity('u0', 'admin', 'APPROVE', 'approval', req1.id);

    const allActivities = activity.activities;
    expect(allActivities).toHaveLength(3);
    const actions = allActivities.map((a) => a.action);
    expect(actions).toContain('SUBMIT');
    expect(actions).toContain('APPROVE');
  });

  it('should show approved requests in the activity timeline', () => {
    const req = approval.submitRequest('release', 'Release 3.0', 'Major release', 'dev');
    approval.approve(req.id, 'manager', 'Approved for release');
    activity.logActivity('mgr', 'manager', 'APPROVE', 'approval', req.id, {
      comments: 'Approved for release',
    });

    const timeline = activity.getActivitiesForEntity('approval', req.id);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].action).toBe('APPROVE');

    const approved = approval.getByStatus('approved');
    expect(approved[0].id).toBe(req.id);
  });

  it('should handle multiple concurrent approval workflows independently', () => {
    const req1 = approval.submitRequest('deploy', 'Deploy X', 'Deploy X service', 'user1');
    const req2 = approval.submitRequest('deploy', 'Deploy Y', 'Deploy Y service', 'user2');
    const req3 = approval.submitRequest('access', 'Grant Access', 'Grant admin access', 'user3');

    approval.approve(req1.id, 'admin', 'OK');
    approval.reject(req2.id, 'admin', 'Not now');

    expect(approval.getByStatus('approved')).toHaveLength(1);
    expect(approval.getByStatus('rejected')).toHaveLength(1);
    expect(approval.getPendingRequests()).toHaveLength(1);
    expect(approval.getPendingRequests()[0].id).toBe(req3.id);
  });

  it('should not affect approval state when audit log is cleared', () => {
    const req = approval.submitRequest('config', 'Config Change', 'Update settings', 'user1');
    auditLog.log('u1', 'user1', 'CREATE', 'approval', 'Created approval request');
    auditLog.clear();

    expect(auditLog.entries).toHaveLength(0);
    const pendingReqs = approval.getPendingRequests();
    expect(pendingReqs).toHaveLength(1);
    expect(pendingReqs[0].id).toBe(req.id);
  });

  it('should return only pending items when calling getPendingRequests', () => {
    const req1 = approval.submitRequest('type1', 'Title 1', 'Desc 1', 'u1');
    const req2 = approval.submitRequest('type2', 'Title 2', 'Desc 2', 'u2');
    const req3 = approval.submitRequest('type3', 'Title 3', 'Desc 3', 'u3');

    approval.approve(req1.id, 'admin', 'OK');
    approval.reject(req2.id, 'admin', 'No');

    const pending = approval.getPendingRequests();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe(req3.id);
    expect(pending[0].status).toBe('pending');
  });

  it('should retrieve requests by user', () => {
    approval.submitRequest('deploy', 'Deploy A', 'Desc', 'alice');
    approval.submitRequest('deploy', 'Deploy B', 'Desc', 'alice');
    approval.submitRequest('config', 'Config', 'Desc', 'bob');

    const aliceReqs = approval.getRequestsByUser('alice');
    expect(aliceReqs).toHaveLength(2);
    const bobReqs = approval.getRequestsByUser('bob');
    expect(bobReqs).toHaveLength(1);
  });

  it('should log audit entry stats correctly after multiple operations', () => {
    const req1 = approval.submitRequest('d', 'T1', 'D1', 'u1');
    const req2 = approval.submitRequest('d', 'T2', 'D2', 'u2');
    approval.approve(req1.id, 'admin', 'OK');
    approval.reject(req2.id, 'admin', 'No');

    auditLog.log('u0', 'admin', 'UPDATE', 'approval', 'Approved req1');
    auditLog.log('u0', 'admin', 'UPDATE', 'approval', 'Rejected req2');

    const stats = auditLog.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byAction['UPDATE']).toBe(2);
  });
});
