import { Routes } from '@angular/router';
import { QueueComponent } from './components/queue/queue.component';
import { SubmitComponent } from './components/submit/submit.component';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
  { path: '', component: QueueComponent },
  { path: 'queue', component: QueueComponent },
  { path: 'submit', component: SubmitComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: 'queue' },
];
