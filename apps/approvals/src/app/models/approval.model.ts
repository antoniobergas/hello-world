export type ApprovalType = 'expense' | 'leave' | 'purchase' | 'travel' | 'access';
export type ApprovalStatus =
  | 'draft'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'cancelled';
export type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: string;
  assignedTo?: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  amount?: number;
  currency?: string;
  submittedAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  comments: ApprovalComment[];
}

export interface ApprovalComment {
  id: string;
  requestId: string;
  author: string;
  body: string;
  createdAt: Date;
  isDecision: boolean;
}

export interface WorkflowStep {
  id: string;
  requestId: string;
  stepNumber: number;
  stepName: string;
  assignedTo: string;
  status: 'waiting' | 'active' | 'approved' | 'rejected' | 'skipped';
  completedAt?: Date;
}
