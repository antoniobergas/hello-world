export type MetricPeriod = 'daily' | 'weekly' | 'monthly';

export interface KpiMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change vs previous period
  trend: 'up' | 'down' | 'flat';
}

export interface TimeSeriesPoint {
  date: string; // ISO date string
  value: number;
}

export interface TimeSeries {
  id: string;
  name: string;
  period: MetricPeriod;
  data: TimeSeriesPoint[];
}

export type ReportStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';

export interface Report {
  id: string;
  name: string;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  lastRunAt?: Date;
  schedule?: string;
  rowCount?: number;
}

export type ExportFormat = 'csv' | 'json' | 'xlsx';
export type ExportStatus = 'pending' | 'generating' | 'ready' | 'expired';

export interface ExportJob {
  id: string;
  reportId: string;
  reportName: string;
  format: ExportFormat;
  status: ExportStatus;
  createdAt: Date;
  readyAt?: Date;
  fileSizeKb?: number;
}
