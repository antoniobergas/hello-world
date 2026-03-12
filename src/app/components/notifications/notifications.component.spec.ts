import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationService } from '../../services/notification.service';

describe('NotificationsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject NotificationService', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    expect(fixture.componentInstance.notificationService).toBeTruthy();
  });

  it('should show notification count badge when notifications exist', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    const service = TestBed.inject(NotificationService);
    service.show('Test message', 'info', 60000);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('1');
  });

  it('should clear all notifications when clearAll is called', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    const service = TestBed.inject(NotificationService);
    service.show('Msg 1', 'info', 60000);
    service.show('Msg 2', 'success', 60000);
    fixture.detectChanges();
    fixture.componentInstance.clearAll();
    fixture.detectChanges();
    expect(service.current.length).toBe(0);
  });

  it('should add a sample notification via addSample', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    const service = TestBed.inject(NotificationService);
    fixture.componentInstance.addSample('error');
    expect(service.current.length).toBe(1);
    expect(service.current[0].type).toBe('error');
  });

  it('should display empty state when no notifications', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No notifications');
  });

  it('should render notification items in the list', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    const service = TestBed.inject(NotificationService);
    service.show('Hello world', 'warning', 60000);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Hello world');
  });
});
