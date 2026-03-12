export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'billing' | 'technical' | 'account' | 'feature_request' | 'other';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  tags: string[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: string;
  body: string;
  createdAt: Date;
  isStaff: boolean;
}
