import { Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ExportsComponent } from './components/exports/exports.component';

export const routes: Routes = [
  { path: '', component: OverviewComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'exports', component: ExportsComponent },
  { path: '**', redirectTo: 'overview' },
];
