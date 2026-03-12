import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'support' | 'incident';
  assigneeId: string | null;
  reporterId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  slaDeadline?: Date;
  escalated: boolean;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tk1',
    title: 'Login page broken',
    description: 'Cannot log in',
    status: 'open',
    priority: 'critical',
    type: 'bug',
    assigneeId: 'u1',
    reporterId: 'u5',
    tenantId: 't1',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    tags: ['auth', 'urgent'],
    slaDeadline: daysAgo(1),
    escalated: true,
  },
  {
    id: 'tk2',
    title: 'Dark mode request',
    description: 'Add dark mode',
    status: 'open',
    priority: 'low',
    type: 'feature',
    assigneeId: null,
    reporterId: 'u6',
    tenantId: 't1',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    tags: ['ui'],
    slaDeadline: daysFromNow(10),
    escalated: false,
  },
  {
    id: 'tk3',
    title: 'Payment gateway error',
    description: 'Stripe failing',
    status: 'in_progress',
    priority: 'high',
    type: 'bug',
    assigneeId: 'u2',
    reporterId: 'u7',
    tenantId: 't2',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(4),
    tags: ['payments'],
    slaDeadline: daysAgo(0),
    escalated: true,
  },
  {
    id: 'tk4',
    title: 'Export CSV feature',
    description: 'Need CSV export',
    status: 'open',
    priority: 'medium',
    type: 'feature',
    assigneeId: 'u3',
    reporterId: 'u8',
    tenantId: 't2',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    tags: ['reporting'],
    slaDeadline: daysFromNow(5),
    escalated: false,
  },
  {
    id: 'tk5',
    title: 'Server down',
    description: 'Production server unreachable',
    status: 'resolved',
    priority: 'critical',
    type: 'incident',
    assigneeId: 'u1',
    reporterId: 'u9',
    tenantId: 't1',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
    resolvedAt: daysAgo(6),
    tags: ['infrastructure'],
    escalated: true,
  },
  {
    id: 'tk6',
    title: 'Billing invoice wrong',
    description: 'Invoice shows wrong amount',
    status: 'in_progress',
    priority: 'high',
    type: 'support',
    assigneeId: 'u4',
    reporterId: 'u10',
    tenantId: 't3',
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(8),
    tags: ['billing'],
    slaDeadline: daysFromNow(1),
    escalated: false,
  },
  {
    id: 'tk7',
    title: 'Password reset email',
    description: 'Not receiving reset email',
    status: 'open',
    priority: 'medium',
    type: 'support',
    assigneeId: null,
    reporterId: 'u11',
    tenantId: 't3',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    tags: ['auth', 'email'],
    slaDeadline: daysFromNow(2),
    escalated: false,
  },
  {
    id: 'tk8',
    title: 'API rate limit too low',
    description: 'Need higher rate limit',
    status: 'open',
    priority: 'medium',
    type: 'feature',
    assigneeId: 'u2',
    reporterId: 'u12',
    tenantId: 't4',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    tags: ['api'],
    escalated: false,
  },
  {
    id: 'tk9',
    title: 'SSO integration broken',
    description: 'SAML not working',
    status: 'in_progress',
    priority: 'critical',
    type: 'bug',
    assigneeId: 'u1',
    reporterId: 'u13',
    tenantId: 't1',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(2),
    tags: ['auth', 'sso'],
    slaDeadline: daysAgo(0),
    escalated: true,
  },
  {
    id: 'tk10',
    title: 'Slow dashboard load',
    description: 'Dashboard takes 10+ seconds',
    status: 'open',
    priority: 'high',
    type: 'bug',
    assigneeId: null,
    reporterId: 'u14',
    tenantId: 't2',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    tags: ['performance'],
    slaDeadline: daysFromNow(3),
    escalated: false,
  },
  {
    id: 'tk11',
    title: 'Webhook failure',
    description: 'Webhooks not firing',
    status: 'resolved',
    priority: 'high',
    type: 'bug',
    assigneeId: 'u3',
    reporterId: 'u15',
    tenantId: 't4',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
    resolvedAt: daysAgo(8),
    tags: ['integrations'],
    escalated: false,
  },
  {
    id: 'tk12',
    title: 'Add 2FA support',
    description: 'Implement TOTP',
    status: 'open',
    priority: 'high',
    type: 'feature',
    assigneeId: 'u2',
    reporterId: 'u16',
    tenantId: 't1',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    tags: ['security', 'auth'],
    slaDeadline: daysFromNow(14),
    escalated: false,
  },
  {
    id: 'tk13',
    title: 'Data export fails on large sets',
    description: '>10k rows fails',
    status: 'in_progress',
    priority: 'medium',
    type: 'bug',
    assigneeId: 'u4',
    reporterId: 'u17',
    tenantId: 't3',
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(6),
    tags: ['export'],
    slaDeadline: daysFromNow(4),
    escalated: false,
  },
  {
    id: 'tk14',
    title: 'Mobile app crashes',
    description: 'iOS crash on startup',
    status: 'open',
    priority: 'critical',
    type: 'bug',
    assigneeId: 'u1',
    reporterId: 'u18',
    tenantId: 't2',
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(12),
    tags: ['mobile', 'ios'],
    slaDeadline: daysAgo(0),
    escalated: true,
  },
  {
    id: 'tk15',
    title: 'Need bulk user import',
    description: 'CSV import for users',
    status: 'open',
    priority: 'low',
    type: 'feature',
    assigneeId: null,
    reporterId: 'u19',
    tenantId: 't5',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    tags: ['users'],
    escalated: false,
  },
  {
    id: 'tk16',
    title: 'Report generation timeout',
    description: 'Complex reports time out',
    status: 'in_progress',
    priority: 'high',
    type: 'bug',
    assigneeId: 'u3',
    reporterId: 'u20',
    tenantId: 't5',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    tags: ['reporting', 'performance'],
    slaDeadline: daysFromNow(2),
    escalated: false,
  },
  {
    id: 'tk17',
    title: 'Wrong locale for date display',
    description: 'Dates show US format in EU',
    status: 'open',
    priority: 'low',
    type: 'bug',
    assigneeId: 'u4',
    reporterId: 'u21',
    tenantId: 't4',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    tags: ['i18n'],
    escalated: false,
  },
  {
    id: 'tk18',
    title: 'Notification preferences missing',
    description: 'No way to set preferences',
    status: 'closed',
    priority: 'medium',
    type: 'feature',
    assigneeId: 'u2',
    reporterId: 'u22',
    tenantId: 't3',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(15),
    tags: ['notifications'],
    escalated: false,
  },
  {
    id: 'tk19',
    title: 'API docs outdated',
    description: 'V3 endpoints missing from docs',
    status: 'open',
    priority: 'low',
    type: 'support',
    assigneeId: null,
    reporterId: 'u23',
    tenantId: 't1',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
    tags: ['docs', 'api'],
    escalated: false,
  },
  {
    id: 'tk20',
    title: 'Database backup failed',
    description: 'Nightly backup not running',
    status: 'resolved',
    priority: 'critical',
    type: 'incident',
    assigneeId: 'u1',
    reporterId: 'u24',
    tenantId: 't1',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(13),
    resolvedAt: daysAgo(13),
    tags: ['database', 'ops'],
    escalated: true,
  },
  {
    id: 'tk21',
    title: 'User invite email bouncing',
    description: 'Invites not delivered',
    status: 'in_progress',
    priority: 'high',
    type: 'support',
    assigneeId: 'u4',
    reporterId: 'u25',
    tenantId: 't2',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(3),
    tags: ['email', 'users'],
    slaDeadline: daysFromNow(1),
    escalated: false,
  },
  {
    id: 'tk22',
    title: 'Search returns wrong results',
    description: 'Full text search broken',
    status: 'open',
    priority: 'high',
    type: 'bug',
    assigneeId: 'u3',
    reporterId: 'u26',
    tenantId: 't4',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    tags: ['search'],
    slaDeadline: daysFromNow(3),
    escalated: false,
  },
  {
    id: 'tk23',
    title: 'Team member cannot edit',
    description: 'Permission error for editors',
    status: 'open',
    priority: 'medium',
    type: 'bug',
    assigneeId: 'u2',
    reporterId: 'u27',
    tenantId: 't5',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    tags: ['permissions'],
    slaDeadline: daysFromNow(2),
    escalated: false,
  },
  {
    id: 'tk24',
    title: 'Add GraphQL support',
    description: 'Replace REST with GraphQL option',
    status: 'open',
    priority: 'low',
    type: 'feature',
    assigneeId: null,
    reporterId: 'u28',
    tenantId: 't1',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
    tags: ['api', 'graphql'],
    escalated: false,
  },
  {
    id: 'tk25',
    title: 'Compliance report needed',
    description: 'SOC2 audit artifacts',
    status: 'closed',
    priority: 'high',
    type: 'support',
    assigneeId: 'u1',
    reporterId: 'u29',
    tenantId: 't3',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(25),
    tags: ['compliance'],
    escalated: false,
  },
];

@Injectable({ providedIn: 'root' })
export class TicketService {
  private ticketsSubject = new BehaviorSubject<Ticket[]>(INITIAL_TICKETS);

  readonly tickets$: Observable<Ticket[]> = this.ticketsSubject.asObservable();

  readonly openTickets$: Observable<Ticket[]> = this.tickets$.pipe(
    map((tickets) => tickets.filter((t) => t.status === 'open')),
  );

  readonly escalatedTickets$: Observable<Ticket[]> = this.tickets$.pipe(
    map((tickets) => tickets.filter((t) => t.escalated)),
  );

  get tickets(): Ticket[] {
    return this.ticketsSubject.value;
  }

  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Ticket {
    const created = new Date();
    const newTicket: Ticket = {
      ...ticket,
      id: crypto.randomUUID(),
      createdAt: created,
      updatedAt: created,
    };
    this.ticketsSubject.next([...this.ticketsSubject.value, newTicket]);
    return newTicket;
  }

  assign(id: string, assigneeId: string): void {
    this.updateTicket(id, { assigneeId, updatedAt: new Date() });
  }

  updateStatus(id: string, status: Ticket['status']): void {
    this.updateTicket(id, { status, updatedAt: new Date() });
  }

  escalate(id: string): void {
    this.updateTicket(id, { escalated: true, updatedAt: new Date() });
  }

  resolve(id: string): void {
    const resolved = new Date();
    this.updateTicket(id, { status: 'resolved', resolvedAt: resolved, updatedAt: resolved });
  }

  close(id: string): void {
    this.updateTicket(id, { status: 'closed', updatedAt: new Date() });
  }

  getByStatus(status: Ticket['status']): Ticket[] {
    return this.ticketsSubject.value.filter((t) => t.status === status);
  }

  getByAssignee(assigneeId: string): Ticket[] {
    return this.ticketsSubject.value.filter((t) => t.assigneeId === assigneeId);
  }

  getOverdue(): Ticket[] {
    const now = new Date();
    return this.ticketsSubject.value.filter(
      (t) =>
        t.slaDeadline && t.slaDeadline < now && t.status !== 'resolved' && t.status !== 'closed',
    );
  }

  getByPriority(priority: Ticket['priority']): Ticket[] {
    return this.ticketsSubject.value.filter((t) => t.priority === priority);
  }

  search(query: string): Ticket[] {
    const q = query.toLowerCase();
    return this.ticketsSubject.value.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  private updateTicket(id: string, updates: Partial<Ticket>): void {
    this.ticketsSubject.next(
      this.ticketsSubject.value.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }
}
