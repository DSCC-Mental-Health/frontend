import { Text, View } from 'react-native';

/**
 * The calm two-line panel: a reflection's result (U2, U4), "From your own
 * logs" (U5), "Want to stay anonymous?" (T2). `body` is optional.
 */
export default function Callout({ title, body }) {
	return (
		<View className="w-full gap-1 overflow-hidden rounded-md bg-calm-surface px-4 py-3">
			<Text className="w-full font-inter-semibold text-body text-calm-strong">{title}</Text>
			{body ? <Text className="w-full font-inter text-footnote text-ink">{body}</Text> : null}
		</View>
	);
}
