import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  ApprovalRequest,
  ApprovalComment,
  ApprovalStatus,
  WorkflowStep,
} from '../models/approval.model';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private readonly _requests$ = new BehaviorSubject<ApprovalRequest[]>([
    {
      id: 'ar1',
      type: 'expense',
      title: 'Q3 Team Offsite Expenses',
      description: 'Travel and accommodation for Q3 team offsite event.',
      requestedBy: 'Alice Johnson',
      assignedTo: 'Finance Manager',
      status: 'pending',
      priority: 'high',
      amount: 4500,
      currency: 'USD',
      submittedAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-07-01'),
      dueDate: new Date('2025-07-15'),
      tags: ['travel', 'team'],
      comments: [],
    },
    {
      id: 'ar2',
      type: 'purchase',
      title: 'Software License Renewal - Jira',
      description: 'Annual renewal for Jira Software 25-seat license.',
      requestedBy: 'Bob Martinez',
      assignedTo: 'IT Manager',
      status: 'approved',
      priority: 'normal',
      amount: 2400,
      currency: 'USD',
      submittedAt: new Date('2025-06-20'),
      updatedAt: new Date('2025-06-22'),
      tags: ['software', 'it'],
      comments: [
        {
          id: 'c1',
          requestId: 'ar2',
          author: 'IT Manager',
          body: 'Approved — budget available.',
          createdAt: new Date('2025-06-22'),
          isDecision: true,
        },
      ],
    },
    {
      id: 'ar3',
      type: 'leave',
      title: 'Extended Leave Request - Carol White',
      description: 'Requesting 10 days annual leave for family trip.',
      requestedBy: 'Carol White',
      assignedTo: 'HR Manager',
      status: 'in_review',
      priority: 'normal',
      submittedAt: new Date('2025-07-05'),
      updatedAt: new Date('2025-07-06'),
      tags: ['leave', 'hr'],
      comments: [],
    },
    {
      id: 'ar4',
      type: 'travel',
      title: 'Client Visit - New York',
      description: 'Business travel to NYC for client presentation.',
      requestedBy: 'David Lee',
      status: 'pending',
      priority: 'urgent',
      amount: 1200,
      currency: 'USD',
      submittedAt: new Date('2025-07-08'),
      updatedAt: new Date('2025-07-08'),
      dueDate: new Date('2025-07-12'),
      tags: ['travel', 'client'],
      comments: [],
    },
    {
      id: 'ar5',
      type: 'access',
      title: 'Production Database Access Request',
      description: 'Requesting read access to production DB for debugging.',
      requestedBy: 'Eva Brown',
      assignedTo: 'Security Team',
      status: 'rejected',
      priority: 'high',
      submittedAt: new Date('2025-07-03'),
      updatedAt: new Date('2025-07-04'),
      tags: ['access', 'security'],
      comments: [
        {
          id: 'c2',
          requestId: 'ar5',
          author: 'Security Team',
          body: 'Rejected — use staging environment instead.',
          createdAt: new Date('2025-07-04'),
          isDecision: true,
        },
      ],
    },
    {
      id: 'ar6',
      type: 'expense',
      title: 'Office Supplies Restock',
      description: 'Monthly office supplies: paper, pens, printer cartridges.',
      requestedBy: 'Alice Johnson',
      status: 'draft',
      priority: 'low',
      amount: 180,
      currency: 'USD',
      submittedAt: new Date('2025-07-09'),
      updatedAt: new Date('2025-07-09'),
      tags: ['office', 'supplies'],
      comments: [],
    },
  ]);

  private readonly _workflowSteps$ = new BehaviorSubject<WorkflowStep[]>([
    {
      id: 'ws1',
      requestId: 'ar1',
      stepNumber: 1,
      stepName: 'Manager Review',
      assignedTo: 'Bob Martinez',
      status: 'approved',
      completedAt: new Date('2025-07-02'),
    },
    {
      id: 'ws2',
      requestId: 'ar1',
      stepNumber: 2,
      stepName: 'Finance Approval',
      assignedTo: 'Finance Manager',
      status: 'active',
    },
    {
      id: 'ws3',
      requestId: 'ar3',
      stepNumber: 1,
      stepName: 'HR Review',
      assignedTo: 'HR Manager',
      status: 'active',
    },
  ]);

  private nextId = 100;

  readonly requests$: Observable<ApprovalRequest[]> = this._requests$.asObservable();
  readonly pendingRequests$: Observable<ApprovalRequest[]> = this._requests$.pipe(
    map((r) => r.filter((req) => req.status === 'pending')),
  );
  readonly approvedRequests$: Observable<ApprovalRequest[]> = this._requests$.pipe(
    map((r) => r.filter((req) => req.status === 'approved')),
  );
  readonly rejectedRequests$: Observable<ApprovalRequest[]> = this._requests$.pipe(
    map((r) => r.filter((req) => req.status === 'rejected')),
  );

  get requests(): ApprovalRequest[] {
    return this._requests$.getValue();
  }

  submit(
    req: Omit<ApprovalRequest, 'id' | 'submittedAt' | 'updatedAt' | 'comments'>,
  ): ApprovalRequest {
    const newRequest: ApprovalRequest = {
      ...req,
      id: `ar${++this.nextId}`,
      submittedAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    };
    this._requests$.next([newRequest, ...this._requests$.getValue()]);
    return newRequest;
  }

  approve(id: string, reviewer: string, comment: string): void {
    const now = new Date();
    const requests = this._requests$.getValue().map((r) => {
      if (r.id !== id) return r;
      const newComment: ApprovalComment = {
        id: `c${++this.nextId}`,
        requestId: id,
        author: reviewer,
        body: comment,
        createdAt: now,
        isDecision: true,
      };
      return {
        ...r,
        status: 'approved' as ApprovalStatus,
        updatedAt: now,
        comments: [...r.comments, newComment],
      };
    });
    this._requests$.next(requests);
  }

  reject(id: string, reviewer: string, comment: string): void {
    const now = new Date();
    const requests = this._requests$.getValue().map((r) => {
      if (r.id !== id) return r;
      const newComment: ApprovalComment = {
        id: `c${++this.nextId}`,
        requestId: id,
        author: reviewer,
        body: comment,
        createdAt: now,
        isDecision: true,
      };
      return {
        ...r,
        status: 'rejected' as ApprovalStatus,
        updatedAt: now,
        comments: [...r.comments, newComment],
      };
    });
    this._requests$.next(requests);
  }

  cancel(id: string): void {
    const requests = this._requests$
      .getValue()
      .map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as ApprovalStatus, updatedAt: new Date() } : r,
      );
    this._requests$.next(requests);
  }

  addComment(requestId: string, author: string, body: string): void {
    const newComment: ApprovalComment = {
      id: `c${++this.nextId}`,
      requestId,
      author,
      body,
      createdAt: new Date(),
      isDecision: false,
    };
    const requests = this._requests$
      .getValue()
      .map((r) =>
        r.id === requestId
          ? { ...r, comments: [...r.comments, newComment], updatedAt: new Date() }
          : r,
      );
    this._requests$.next(requests);
  }

  getById(id: string): ApprovalRequest | undefined {
    return this._requests$.getValue().find((r) => r.id === id);
  }
}
