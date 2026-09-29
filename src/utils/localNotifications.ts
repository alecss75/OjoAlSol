/**
 * Local Notifications Utility
 * Schedule sunset reminders and other local notifications
 * Uses Capacitor LocalNotifications on native, browser Notification API on web
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<'granted' | 'denied'> {
  if (isNative()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted' ? 'granted' : 'denied';
  }

  // Web fallback
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted' ? 'granted' : 'denied';
  }

  return 'denied';
}

/**
 * Schedule a sunset reminder notification
 * @param minutesBefore - Minutes before sunset to notify
 * @param sunsetTime - Sunset time as ISO string or Date
 * @param spotName - Name of the spot
 */
export async function scheduleSunsetReminder(
  minutesBefore: number,
  sunsetTime: string | Date,
  spotName: string
): Promise<void> {
  const sunset = new Date(sunsetTime);
  const reminderTime = new Date(sunset.getTime() - minutesBefore * 60 * 1000);

  if (reminderTime <= new Date()) {
    console.warn('Reminder time is in the past, not scheduling');
    return;
  }

  const notification: LocalNotificationSchema = {
    title: '🌅 Sunset Soon!',
    body: `Golden hour starts in ${minutesBefore} minutes at ${spotName}`,
    id: Math.floor(Math.random() * 1000000),
    schedule: { at: reminderTime },
    sound: 'beep.wav',
    attachments: undefined,
    actionTypeId: '',
    extra: { type: 'sunset_reminder', spotName },
  };

  if (isNative()) {
    await LocalNotifications.schedule({ notifications: [notification] });
  } else {
    scheduleWebNotification(notification);
  }
}

/**
 * Schedule a custom notification
 */
export async function scheduleNotification(options: {
  title: string;
  body: string;
  at: Date;
  id?: number;
  extra?: Record<string, unknown>;
}): Promise<void> {
  const notification: LocalNotificationSchema = {
    title: options.title,
    body: options.body,
    id: options.id ?? Math.floor(Math.random() * 1000000),
    schedule: { at: options.at },
    sound: 'beep.wav',
    extra: options.extra,
  };

  if (isNative()) {
    await LocalNotifications.schedule({ notifications: [notification] });
  } else {
    scheduleWebNotification(notification);
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: number): Promise<void> {
  if (isNative()) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } else {
    // Web notifications can't be easily cancelled by ID
    console.warn('Web notification cancellation not implemented');
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (isNative()) {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  }
}

/**
 * Get all pending notifications
 */
export async function getPendingNotifications(): Promise<LocalNotificationSchema[]> {
  if (isNative()) {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  }
  return [];
}

/**
 * Schedule web notification using setTimeout (fallback)
 */
function scheduleWebNotification(notification: LocalNotificationSchema): void {
  if (!('Notification' in window)) return;

  const delay = new Date(notification.schedule?.at as Date).getTime() - Date.now();
  if (delay <= 0) return;

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.svg',
        tag: String(notification.id),
      });
    }
  }, delay);
}

/**
 * Schedule sunset reminders for favorite spots
 */
export async function scheduleSunsetRemindersForFavorites(
  spots: Array<{ name: string; sunsetTime: string; latitude: number; longitude: number }>
): Promise<void> {
  await cancelAllNotifications();

  for (const spot of spots) {
    await scheduleSunsetReminder(30, spot.sunsetTime, spot.name);
    // Also schedule 1-hour reminder
    await scheduleSunsetReminder(60, spot.sunsetTime, spot.name);
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  if (isNative()) {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  }
  return Notification.permission === 'granted';
}