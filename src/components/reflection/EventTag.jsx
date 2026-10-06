import Eyebrow from '@/components/ui/Eyebrow';
import { View } from 'react-native';

/** Dot colour: `accent` for the day itself, `calm` once logged, `warn` ahead. */
const DOT = {
	accent: 'bg-accent',
	calm: 'bg-calm',
	warn: 'bg-warn',
};

/** The "● LIVE FIRING · WEEK 4" tag at the top of each reflection screen. */
export default function EventTag({ label, tone = 'accent' }) {
	return (
		<View className="flex-row items-center gap-2 self-start overflow-hidden rounded-sm bg-surface-muted px-3 py-2">
			<View className={`size-2 rounded-full ${DOT[tone]}`} />
			<Eyebrow className="text-ink-muted">{label}</Eyebrow>
		</View>
	);
}
