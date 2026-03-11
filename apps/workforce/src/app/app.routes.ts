import { Routes } from '@angular/router';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { LeaveComponent } from './components/leave/leave.component';
import { TimesheetComponent } from './components/timesheet/timesheet.component';

export const routes: Routes = [
  { path: '', component: ScheduleComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'leave', component: LeaveComponent },
  { path: 'timesheet', component: TimesheetComponent },
  { path: '**', redirectTo: 'schedule' },
];
