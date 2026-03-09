import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    service = new TicketService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 25 seed tickets', () => {
    expect(service.tickets.length).toBe(25);
  });

  it('should create a ticket with UUID', () => {
    const t = service.create({ title: 'T', description: '', status: 'open', priority: 'low', type: 'support', assigneeId: null, reporterId: 'u1', tenantId: 't1', tags: [], escalated: false });
    expect(t.id).toBeTruthy();
  });

  it('should create adds to tickets list', () => {
    const before = service.tickets.length;
    service.create({ title: 'T', description: '', status: 'open', priority: 'low', type: 'support', assigneeId: null, reporterId: 'u1', tenantId: 't1', tags: [], escalated: false });
    expect(service.tickets.length).toBe(before + 1);
  });

  it('should create sets createdAt and updatedAt', () => {
    const t = service.create({ title: 'T', description: '', status: 'open', priority: 'low', type: 'support', assigneeId: null, reporterId: 'u1', tenantId: 't1', tags: [], escalated: false });
    expect(t.createdAt).toBeInstanceOf(Date);
    expect(t.updatedAt).toBeInstanceOf(Date);
  });

  it('should assign sets assigneeId', () => {
    service.assign('tk2', 'u99');
    expect(service.tickets.find((t) => t.id === 'tk2')?.assigneeId).toBe('u99');
  });

  it('should updateStatus changes status', () => {
    service.updateStatus('tk2', 'in_progress');
    expect(service.tickets.find((t) => t.id === 'tk2')?.status).toBe('in_progress');
  });

  it('should escalate sets escalated true', () => {
    service.escalate('tk2');
    expect(service.tickets.find((t) => t.id === 'tk2')?.escalated).toBe(true);
  });

  it('should resolve sets status to resolved and resolvedAt', () => {
    service.resolve('tk2');
    const t = service.tickets.find((t) => t.id === 'tk2')!;
    expect(t.status).toBe('resolved');
    expect(t.resolvedAt).toBeInstanceOf(Date);
  });

  it('should close sets status to closed', () => {
    service.close('tk2');
    expect(service.tickets.find((t) => t.id === 'tk2')?.status).toBe('closed');
  });

  it('should getByStatus: open', () => {
    const open = service.getByStatus('open');
    expect(open.every((t) => t.status === 'open')).toBe(true);
    expect(open.length).toBeGreaterThan(0);
  });

  it('should getByStatus: resolved', () => {
    const resolved = service.getByStatus('resolved');
    expect(resolved.every((t) => t.status === 'resolved')).toBe(true);
  });

  it('should getByAssignee returns tickets for assignee', () => {
    const tickets = service.getByAssignee('u1');
    expect(tickets.every((t) => t.assigneeId === 'u1')).toBe(true);
    expect(tickets.length).toBeGreaterThan(0);
  });

  it('should getByAssignee returns empty for unknown', () => {
    expect(service.getByAssignee('nobody')).toHaveLength(0);
  });

  it('should getOverdue returns tickets past SLA not resolved/closed', () => {
    const overdue = service.getOverdue();
    expect(overdue.length).toBeGreaterThan(0);
    const now = new Date();
    overdue.forEach((t) => {
      expect(t.slaDeadline!.getTime()).toBeLessThan(now.getTime());
      expect(['resolved', 'closed']).not.toContain(t.status);
    });
  });

  it('should getByPriority: critical', () => {
    const critical = service.getByPriority('critical');
    expect(critical.every((t) => t.priority === 'critical')).toBe(true);
    expect(critical.length).toBeGreaterThan(0);
  });

  it('should search by title', () => {
    const results = service.search('login');
    expect(results.some((t) => t.id === 'tk1')).toBe(true);
  });

  it('should search by tag', () => {
    const results = service.search('auth');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should search returns empty for no match', () => {
    expect(service.search('zzznomatch999xyz')).toHaveLength(0);
  });

  it('should emit open tickets via openTickets$', async () => {
    const open = await firstValueFrom(service.openTickets$);
    expect(open.every((t) => t.status === 'open')).toBe(true);
  });

  it('should emit escalated tickets via escalatedTickets$', async () => {
    const escalated = await firstValueFrom(service.escalatedTickets$);
    expect(escalated.every((t) => t.escalated)).toBe(true);
    expect(escalated.length).toBeGreaterThan(0);
  });

  it('should getByPriority: low', () => {
    const low = service.getByPriority('low');
    expect(low.every((t) => t.priority === 'low')).toBe(true);
  });
});
