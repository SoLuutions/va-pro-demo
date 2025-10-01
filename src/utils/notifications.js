import { DateTime } from 'luxon';

export class NotificationsManager {
  constructor() {
    this.permission = 'default';
    this.scheduledTimeouts = new Map();
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    this.permission = Notification.permission;
    return this.permission === 'granted';
  }

  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
    
    return {
      title,
      body: options.body,
      type: options.type || 'info',
      timestamp: Date.now()
    };
  }

  showInAppToast(message, type = 'info') {
    return {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };
  }

  scheduleClientSlotNotification(client, nextSlotStart, callback) {
    const now = Date.now();
    const delay = nextSlotStart - now;
    
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      const timeoutId = setTimeout(() => {
        this.showNotification(
          `Time to work on ${client.name}`,
          { body: `Your scheduled time slot has started.`, type: 'slot-start' }
        );
        callback?.();
      }, delay);
      
      this.scheduledTimeouts.set(`client-${client.id}`, timeoutId);
    }
  }

  scheduleTaskCompletionNotification(task, remainingSeconds, callback) {
    if (remainingSeconds > 0 && remainingSeconds < 24 * 60 * 60) {
      const timeoutId = setTimeout(() => {
        this.showNotification(
          `Task time limit reached`,
          { body: `"${task.title}" has reached its estimated time.`, type: 'task-complete' }
        );
        callback?.();
      }, remainingSeconds * 1000);
      
      this.scheduledTimeouts.set(`task-${task.id}`, timeoutId);
    }
  }

  clearScheduled(key) {
    const timeoutId = this.scheduledTimeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledTimeouts.delete(key);
    }
  }

  clearAll() {
    this.scheduledTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.scheduledTimeouts.clear();
  }
}

export const notificationsManager = new NotificationsManager();
