import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TicketDetailComponent } from './ticket-detail.component';
import { TicketService } from '../../services/ticket.service';

describe('TicketDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show no ticket content when id is missing from route', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.ticket()).toBeUndefined();
  });

  it('should resolve a ticket via resolve()', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    const service = TestBed.inject(TicketService);
    const id = service.tickets[0].id;
    fixture.componentInstance.resolve(id);
    expect(service.getById(id)?.status).toBe('resolved');
  });

  it('should close a ticket via close()', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    const service = TestBed.inject(TicketService);
    const id = service.tickets[0].id;
    fixture.componentInstance.close(id);
    expect(service.getById(id)?.status).toBe('closed');
  });

  it('should not add a comment when newComment is blank', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    const service = TestBed.inject(TicketService);
    const ticket = service.tickets[0];
    const before = service.commentsFor(ticket.id).length;
    fixture.componentInstance.newComment = '   ';
    fixture.componentInstance.addComment(ticket.id);
    expect(service.commentsFor(ticket.id).length).toBe(before);
  });

  it('should add a comment and clear the input', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    const service = TestBed.inject(TicketService);
    const ticket = service.tickets[0];
    const before = service.commentsFor(ticket.id).length;
    fixture.componentInstance.newComment = 'Needs more info';
    fixture.componentInstance.addComment(ticket.id);
    expect(service.commentsFor(ticket.id).length).toBe(before + 1);
    expect(fixture.componentInstance.newComment).toBe('');
  });

  it('should render the back link', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.back-link') as HTMLElement;
    expect(link).toBeTruthy();
  });
});
