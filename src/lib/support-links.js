import { MINDLINE } from '@/data/support';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking } from 'react-native';

/**
 * Leaving Steady for a call, WhatsApp or mindline.sg. A failure always shows
 * the number, so someone who needs it is never left with a dead button.
 */

export async function call(number) {
	try {
		await Linking.openURL(`tel:${number.replace(/[^\d+]/g, '')}`);
	} catch {
		// iPads, simulators and some tablets can't place calls.
		Alert.alert("This device can't make calls", `Call ${number} from a phone.`);
	}
}

export async function openWhatsApp(number) {
	try {
		// wa.me opens the app, or WhatsApp's web page if it isn't installed.
		await Linking.openURL(`https://wa.me/${number}`);
	} catch {
		Alert.alert("Couldn't open WhatsApp", `Message +${number} on WhatsApp.`);
	}
}

/** T3: mindline.sg in the in-app browser, which has its own Done button. */
export async function openMindline() {
	try {
		await WebBrowser.openBrowserAsync(MINDLINE.url);
	} catch {
		Alert.alert("Couldn't open mindline.sg", `Go to ${MINDLINE.url} or call ${MINDLINE.phone}.`);
	}
}
