/**
 * Haptics Hook
 * Provides haptic feedback for user interactions
 * Uses Capacitor Haptics on native, no-op on web
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useCallback } from 'react';

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Custom hook for haptic feedback
 */
export function useHaptics() {
  const impact = useCallback(async (style: ImpactStyle = ImpactStyle.Light) => {
    if (isNative()) {
      await Haptics.impact({ style });
    }
  }, []);

  const notification = useCallback(async (type: NotificationType = NotificationType.Success) => {
    if (isNative()) {
      await Haptics.notification({ type });
    }
  }, []);

  const selectionChanged = useCallback(async () => {
    if (isNative()) {
      await Haptics.selectionChanged();
    }
  }, []);

  const vibrate = useCallback(async (duration: number = 50) => {
    if (isNative()) {
      await Haptics.vibrate({ duration });
    }
  }, []);

  return {
    impact,
    notification,
    selectionChanged,
    vibrate,
  };
}

/**
 * Trigger light impact (button press, toggle)
 */
export async function lightImpact(): Promise<void> {
  if (isNative()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
}

/**
 * Trigger medium impact (important action)
 */
export async function mediumImpact(): Promise<void> {
  if (isNative()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
}

/**
 * Trigger heavy impact (destructive action)
 */
export async function heavyImpact(): Promise<void> {
  if (isNative()) {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }
}

/**
 * Trigger success notification
 */
export async function successNotification(): Promise<void> {
  if (isNative()) {
    await Haptics.notification({ type: NotificationType.Success });
  }
}

/**
 * Trigger warning notification
 */
export async function warningNotification(): Promise<void> {
  if (isNative()) {
    await Haptics.notification({ type: NotificationType.Warning });
  }
}

/**
 * Trigger error notification
 */
export async function errorNotification(): Promise<void> {
  if (isNative()) {
    await Haptics.notification({ type: NotificationType.Error });
  }
}

/**
 * Trigger selection changed (slider, picker)
 */
export async function selectionHaptic(): Promise<void> {
  if (isNative()) {
    await Haptics.selectionChanged();
  }
}

/**
 * Vibrate for custom duration
 */
export async function vibrate(duration: number = 50): Promise<void> {
  if (isNative()) {
    await Haptics.vibrate({ duration });
  }
}

export { ImpactStyle, NotificationType };