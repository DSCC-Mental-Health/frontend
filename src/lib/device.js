/**
 * Keep-awake and haptics for the tool players.
 *
 * Both are native modules, required lazily so a dev build made before they
 * were added just goes without (screen may dim, no vibration) instead of
 * crashing at import.
 */
const cache = {};

function load(name) {
	if (!(name in cache)) {
		try {
			cache[name] =
				name === 'keep-awake' ? require('expo-keep-awake') : require('expo-haptics');
		} catch {
			cache[name] = null;
		}
	}
	return cache[name];
}

/** Stops the screen dimming while an exercise runs. */
export function keepAwake(tag) {
	load('keep-awake')?.activateKeepAwakeAsync(tag).catch(() => {});
}

export function releaseAwake(tag) {
	load('keep-awake')?.deactivateKeepAwake(tag).catch(() => {});
}

/** One light tap — used to mark a breathing phase change. */
export function lightTap() {
	const Haptics = load('haptics');
	Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
