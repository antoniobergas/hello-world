import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketComment,
} from '../models/ticket.model';

const SEED_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Cannot login to my account',
    description: 'I get an error when trying to login with my email and password.',
    status: 'open',
    priority: 'high',
    category: 'account',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
    tags: ['login', 'authentication'],
  },
  {
    id: 'TKT-002',
    subject: 'Invoice shows wrong amount',
    description: 'My latest invoice shows $500 but I should be on the $200 plan.',
    status: 'in_progress',
    priority: 'high',
    category: 'billing',
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-13'),
    assignedTo: 'billing-team',
    tags: ['invoice', 'billing'],
  },
  {
    id: 'TKT-003',
    subject: 'Feature request: dark mode',
    description: 'Please add a dark mode option to the dashboard.',
    status: 'open',
    priority: 'low',
    category: 'feature_request',
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14'),
    tags: ['ui', 'dark-mode'],
  },
  {
    id: 'TKT-004',
    subject: 'API rate limit exceeded unexpectedly',
    description: 'Our integration is hitting 429 errors even though we are within our quota.',
    status: 'resolved',
    priority: 'critical',
    category: 'technical',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-09'),
    resolvedAt: new Date('2025-01-09'),
    assignedTo: 'api-team',
    tags: ['api', 'rate-limit'],
  },
];

const SEED_COMMENTS: TicketComment[] = [
  {
    id: 'c1',
    ticketId: 'TKT-001',
    author: 'Support Agent',
    body: 'Thank you for reaching out. Can you share the exact error message you see?',
    createdAt: new Date('2025-01-10T14:00:00'),
    isStaff: true,
  },
  {
    id: 'c2',
    ticketId: 'TKT-002',
    author: 'Billing Team',
    body: 'We are reviewing your account. Expect an update within 24 hours.',
    createdAt: new Date('2025-01-13T09:30:00'),
    isStaff: true,
  },
];

@Injectable({ providedIn: 'root' })
export class TicketService {
  private ticketsSubject = new BehaviorSubject<Ticket[]>([...SEED_TICKETS]);
  private commentsSubject = new BehaviorSubject<TicketComment[]>([...SEED_COMMENTS]);

  readonly tickets$ = this.ticketsSubject.asObservable();
  readonly openTickets$ = this.tickets$.pipe(
    map((ts) => ts.filter((t) => t.status === 'open' || t.status === 'in_progress')),
  );
  readonly resolvedTickets$ = this.tickets$.pipe(
    map((ts) => ts.filter((t) => t.status === 'resolved' || t.status === 'closed')),
  );
  readonly comments$ = this.commentsSubject.asObservable();

  get tickets(): Ticket[] {
    return this.ticketsSubject.value;
  }

  getById(id: string): Ticket | undefined {
    return this.ticketsSubject.value.find((t) => t.id === id);
  }

  commentsFor(ticketId: string): TicketComment[] {
    return this.commentsSubject.value.filter((c) => c.ticketId === ticketId);
  }

  submit(
    subject: string,
    description: string,
    category: TicketCategory,
    priority: TicketPriority = 'medium',
  ): Ticket {
    const id = `TKT-${String(this.ticketsSubject.value.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const ticket: Ticket = {
      id,
      subject,
      description,
      status: 'open',
      priority,
      category,
      createdAt: now,
      updatedAt: now,
      tags: [],
    };
    this.ticketsSubject.next([ticket, ...this.ticketsSubject.value]);
    return ticket;
  }

  updateStatus(id: string, status: TicketStatus): void {
    const tickets = this.ticketsSubject.value.map((t) =>
      t.id === id
        ? {
            ...t,
            status,
            updatedAt: new Date(),
            resolvedAt: status === 'resolved' ? new Date() : t.resolvedAt,
          }
        : t,
    );
    this.ticketsSubject.next(tickets);
  }

  addComment(ticketId: string, author: string, body: string, isStaff = false): void {
    const comment: TicketComment = {
      id: `c${Date.now()}`,
      ticketId,
      author,
      body,
      createdAt: new Date(),
      isStaff,
    };
    this.commentsSubject.next([...this.commentsSubject.value, comment]);
  }
}
