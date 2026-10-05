import { Platform } from 'react-native';

let notifications;

function load() {
	if (notifications === undefined) {
		try {
			notifications = require('expo-notifications');
		} catch {
			notifications = null;
		}
	}
	return notifications;
}

/**
 * Asks for notification permission (only if not yet granted), then replaces
 * any existing reminder with one daily at `hour:minute`.
 *
 * @returns {Promise<'scheduled' | 'denied' | 'unavailable'>}
 */
export async function scheduleDailyReminder({ hour, minute }) {
	const Notifications = load();
	if (!Notifications || Platform.OS === 'web') return 'unavailable';

	try {
		let { status } = await Notifications.getPermissionsAsync();
		if (status !== 'granted') {
			({ status } = await Notifications.requestPermissionsAsync());
		}
		if (status !== 'granted') return 'denied';

		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('check-in', {
				name: 'Daily check-in',
				importance: Notifications.AndroidImportance.DEFAULT,
			});
		}

		// One reminder a day, so any earlier pick is replaced rather than stacked.
		await Notifications.cancelAllScheduledNotificationsAsync();
		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Steady',
				body: "How's today been? One tap is enough.",
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DAILY,
				channelId: 'check-in',
				hour,
				minute,
			},
		});
		return 'scheduled';
	} catch {
		return 'unavailable';
	}
}

/** Removes the daily reminder, e.g. when they go back to I7 and clear the time. */
export async function cancelDailyReminder() {
	const Notifications = load();
	if (!Notifications || Platform.OS === 'web') return;
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
	} catch {
		
	}
}
