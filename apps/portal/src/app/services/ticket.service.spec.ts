import { TestBed } from '@angular/core/testing';
import { TicketService } from './ticket.service';
import { firstValueFrom } from 'rxjs';

describe('TicketService (Portal)', () => {
  let service: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 4 initial tickets', () => {
    expect(service.tickets.length).toBe(4);
  });

  it('should submit a new ticket and add it to the front of the list', () => {
    const before = service.tickets.length;
    const ticket = service.submit('Test issue', 'Details here', 'technical', 'medium');
    expect(service.tickets.length).toBe(before + 1);
    expect(service.tickets[0].id).toBe(ticket.id);
    expect(service.tickets[0].subject).toBe('Test issue');
    expect(service.tickets[0].status).toBe('open');
  });

  it('should resolve a ticket by id', () => {
    const id = service.tickets[0].id;
    service.updateStatus(id, 'resolved');
    expect(service.getById(id)?.status).toBe('resolved');
    expect(service.getById(id)?.resolvedAt).toBeTruthy();
  });

  it('should close a ticket by id', () => {
    const id = service.tickets[0].id;
    service.updateStatus(id, 'closed');
    expect(service.getById(id)?.status).toBe('closed');
  });

  it('open tickets$ should not include resolved tickets', async () => {
    const id = service.tickets.find((t) => t.status === 'resolved')?.id;
    if (id) {
      const open = await firstValueFrom(service.openTickets$);
      expect(open.find((t) => t.id === id)).toBeUndefined();
    }
  });

  it('resolved tickets$ should include resolved and closed', async () => {
    service.updateStatus(service.tickets[0].id, 'resolved');
    const resolved = await firstValueFrom(service.resolvedTickets$);
    expect(resolved.length).toBeGreaterThanOrEqual(1);
    expect(resolved.every((t) => t.status === 'resolved' || t.status === 'closed')).toBe(true);
  });

  it('should add a comment to a ticket', () => {
    const ticketId = service.tickets[0].id;
    service.addComment(ticketId, 'User', 'This is my follow-up.');
    const comments = service.commentsFor(ticketId);
    expect(comments.some((c) => c.body === 'This is my follow-up.')).toBe(true);
  });

  it('commentsFor should only return comments for the given ticket', () => {
    const id1 = service.tickets[0].id;
    const id2 = service.tickets[1].id;
    service.addComment(id1, 'User', 'Comment for ticket 1');
    const comments = service.commentsFor(id1);
    expect(comments.every((c) => c.ticketId === id1)).toBe(true);
    expect(comments.some((c) => c.ticketId === id2)).toBe(false);
  });

  it('should return undefined for a non-existent ticket id', () => {
    expect(service.getById('NON-EXISTENT')).toBeUndefined();
  });
});
