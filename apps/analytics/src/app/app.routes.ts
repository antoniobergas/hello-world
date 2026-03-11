import { Routes } from '@angular/router';
import { KpiDashboardComponent } from './components/kpi-dashboard/kpi-dashboard.component';
import { TrendsComponent } from './components/trends/trends.component';
import { AlertsComponent } from './components/alerts/alerts.component';

export const routes: Routes = [
  { path: '', component: KpiDashboardComponent },
  { path: 'dashboard', component: KpiDashboardComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: '**', redirectTo: 'dashboard' },
];
