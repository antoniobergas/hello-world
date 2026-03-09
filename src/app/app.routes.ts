import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ItemListComponent } from './components/item-list/item-list.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'items', component: ItemListComponent },
  { path: '**', redirectTo: '' },
];
