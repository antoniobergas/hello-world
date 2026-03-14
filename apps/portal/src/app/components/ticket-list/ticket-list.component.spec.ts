import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TicketListComponent } from './ticket-list.component';
import { TicketService } from '../../services/ticket.service';

describe('TicketListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "My Tickets"', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('My Tickets');
  });

  it('should render ticket rows for seeded data', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.ticket-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show the new ticket button', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.new-ticket-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBe('Submit new ticket');
  });

  it('should toggle showForm when new ticket button is clicked', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.showForm()).toBe(false);
    const btn = fixture.nativeElement.querySelector('.new-ticket-btn') as HTMLButtonElement;
    btn.click();
    expect(fixture.componentInstance.showForm()).toBe(true);
    btn.click();
    expect(fixture.componentInstance.showForm()).toBe(false);
  });

  it('should not submit a ticket when form is empty', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    const service = TestBed.inject(TicketService);
    const before = service.tickets.length;
    fixture.componentInstance.submitTicket();
    expect(service.tickets.length).toBe(before);
  });

  it('filteredTickets() returns all tickets when filter is "all"', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    const service = TestBed.inject(TicketService);
    fixture.componentInstance.statusFilter = 'all';
    expect(fixture.componentInstance.filteredTickets().length).toBe(service.tickets.length);
  });

  it('filteredTickets() returns only open/in_progress when filter is "open"', () => {
    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.componentInstance.statusFilter = 'open';
    const filtered = fixture.componentInstance.filteredTickets();
    expect(filtered.every((t) => t.status === 'open' || t.status === 'in_progress')).toBe(true);
  });
});
