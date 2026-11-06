import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Fire-and-forget haptics. Silent on web and wherever the device has no haptic engine. */
function run(action: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  action().catch(() => {});
}

export const haptic = {
  /** Small acknowledgement: a duplicate, an armed confirm. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Choosing an option from a list. */
  select: () => run(() => Haptics.selectionAsync()),
  /** A takeoff was added or updated. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Something was removed or cleared. */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
