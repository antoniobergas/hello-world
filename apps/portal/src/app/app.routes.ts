import { Routes } from '@angular/router';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './components/ticket-detail/ticket-detail.component';
import { KbComponent } from './components/kb/kb.component';
import { StatusComponent } from './components/status/status.component';

export const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'tickets', component: TicketListComponent },
  { path: 'tickets/:id', component: TicketDetailComponent },
  { path: 'kb', component: KbComponent },
  { path: 'status', component: StatusComponent },
  { path: '**', redirectTo: 'tickets' },
];
