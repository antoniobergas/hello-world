import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  show(message: string, type: NotificationType = 'info', durationMs = 3000): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      message,
      type,
    };
    this.notificationsSubject.next([...this.notificationsSubject.value, notification]);
    setTimeout(() => this.dismiss(notification.id), durationMs);
  }

  dismiss(id: string): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter((n) => n.id !== id),
    );
  }

  get current(): Notification[] {
    return this.notificationsSubject.value;
  }
}
