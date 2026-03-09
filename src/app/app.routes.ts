import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { AdminComponent } from './components/admin/admin.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { ApprovalsComponent } from './components/approvals/approvals.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'items', component: ItemListComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'approvals', component: ApprovalsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: '**', redirectTo: '' },
];
