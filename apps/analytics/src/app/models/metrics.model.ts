export type MetricCategory = 'revenue' | 'users' | 'performance' | 'quality' | 'operations';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface Metric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  unit: string;
  previousValue: number;
  trend: TrendDirection;
  changePercent: number;
  lastUpdated: Date;
  target?: number;
}

export interface DataPoint {
  label: string;
  value: number;
  date: Date;
}

export interface TrendSeries {
  id: string;
  name: string;
  category: MetricCategory;
  unit: string;
  points: DataPoint[];
  color: string;
}

export interface AnalyticsAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  metricId?: string;
  threshold?: number;
  currentValue?: number;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedBy?: string;
}
