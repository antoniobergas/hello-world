import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApprovalRequest {
  id: string;
  type: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  comments: string;
}

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private requestsSubject = new BehaviorSubject<ApprovalRequest[]>([]);

  readonly requests$: Observable<ApprovalRequest[]> = this.requestsSubject.asObservable();

  readonly pendingRequests$: Observable<ApprovalRequest[]> = this.requests$.pipe(
    map((reqs) => reqs.filter((r) => r.status === 'pending')),
  );

  get requests(): ApprovalRequest[] {
    return this.requestsSubject.value;
  }

  submitRequest(
    type: string,
    title: string,
    description: string,
    requestedBy: string,
  ): ApprovalRequest {
    const req: ApprovalRequest = {
      id: crypto.randomUUID(),
      type,
      title,
      description,
      requestedBy,
      requestedAt: new Date(),
      status: 'pending',
      comments: '',
    };
    this.requestsSubject.next([...this.requestsSubject.value, req]);
    return req;
  }

  approve(id: string, reviewedBy: string, comments: string): void {
    this.updateRequest(id, { status: 'approved', reviewedBy, reviewedAt: new Date(), comments });
  }

  reject(id: string, reviewedBy: string, comments: string): void {
    this.updateRequest(id, { status: 'rejected', reviewedBy, reviewedAt: new Date(), comments });
  }

  getPendingRequests(): ApprovalRequest[] {
    return this.requestsSubject.value.filter((r) => r.status === 'pending');
  }

  getByStatus(status: ApprovalRequest['status']): ApprovalRequest[] {
    return this.requestsSubject.value.filter((r) => r.status === status);
  }

  getRequestsByUser(username: string): ApprovalRequest[] {
    return this.requestsSubject.value.filter((r) => r.requestedBy === username);
  }

  private updateRequest(id: string, updates: Partial<ApprovalRequest>): void {
    this.requestsSubject.next(
      this.requestsSubject.value.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  }
}
