/**
 * Date helpers shared by the journal, the check-in store and Home.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * A time `days` ago today. A seeded "today" time that hasn't happened yet would
 * sort above anything the user does now, so it's clamped into the past.
 */
export function daysAgoAt(days, hours, minutes) {
	const d = startOfDay(new Date());
	d.setDate(d.getDate() - days);
	d.setHours(hours, minutes, 0, 0);
	const latest = Date.now() - 60 * 1000;
	return d.getTime() > latest ? new Date(latest) : d;
}

/** "2026-09-19" in local time — used in URLs, so no timezone surprises. */
export function dayKey(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function isSameDay(a, b) {
	return dayKey(a) === dayKey(b);
}

/**
 * Day 1 of BMT, placed so that today reads "Day 23".
 * TODO: take this from the enlistment date once setup collects it.
 */
export const BMT_START = (() => {
	const d = startOfDay(new Date());
	d.setDate(d.getDate() - 22);
	return d;
})();

export const BMT_WEEKS = 9;

export function bmtDay(date) {
	return Math.round((startOfDay(date) - BMT_START) / DAY_MS) + 1;
}

export function bmtWeek(date) {
	return Math.ceil(bmtDay(date) / 7);
}

/** "Morning" / "Afternoon" / "Evening" for greetings and the check-in title. */
export function partOfDay(date) {
	const h = date.getHours();
	if (h >= 5 && h < 12) return 'Morning';
	if (h >= 12 && h < 18) return 'Afternoon';
	return 'Evening';
}

// Fixed tables rather than toLocaleDateString: its output varies by engine
// (Node's en-GB gives "Sept"; Hermes' Intl support differs again), and the
// frames use exactly three letters.
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_NAMES = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Today" / "Yesterday" / "Sun 12 Oct" — the day headings in M1 (node 28:19). */
export function dayLabel(date) {
	const diff = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);
	if (diff === 0) return 'Today';
	if (diff === 1) return 'Yesterday';
	return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** 24-hour "22:14", as M1 and M3 show it. */
export function timeLabel(date) {
	const h = String(date.getHours()).padStart(2, '0');
	const m = String(date.getMinutes()).padStart(2, '0');
	return `${h}:${m}`;
}
