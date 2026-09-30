import { Pressable, Text, View } from 'react-native';

/**
 * Wraps a step's options. A set of one-of choices is a radio group; a
 * multi-select (I5) isn't, since each checkbox announces itself.
 */
export function OptionGroup({ multiple = false, gap = 'gap-3', children }) {
	return (
		<View
			accessibilityRole={multiple ? undefined : 'radiogroup'}
			className={`w-full ${gap}`}
		>
			{children}
		</View>
	);
}

/**
 * Row option — I3 mood, I5 coping, I7 reminder (nodes 16:45, 17:13, 17:57).
 *
 * Unselected is a white pill with a 1px hairline and medium label; selected
 * fills with accent and switches the label to bold white (bold so it clears the
 * contrast minimum on the orange). `role` tells screen readers whether it's one
 * of a set (`radio`, I3/I7) or can be combined (`checkbox`, I5).
 */
export function OptionRow({ label, selected, role = 'radio', onPress }) {
	return (
		<Pressable
			accessibilityRole={role}
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			className={`w-full flex-row items-center overflow-hidden rounded-md border px-4 py-4 active:opacity-80 ${
				selected ? 'border-accent bg-accent' : 'border-hairline bg-white'
			}`}
		>
			<Text
				className={`text-body ${
					selected ? 'font-inter-bold text-white' : 'font-inter-medium text-ink'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/** The white card shared by the pickable I6 option and the I8 summary. */
const CARD = 'w-full gap-2 overflow-hidden rounded-lg bg-white px-5 py-4';

function CardContent({ title, body, indicator }) {
	return (
		<>
			<View className="w-full flex-row items-center gap-3">
				<Text className="flex-1 font-inter-semibold text-body-lg text-ink">{title}</Text>
				{indicator}
			</View>
			<Text className="w-full font-inter text-subhead text-ink-muted">
				{body}
			</Text>
		</>
	);
}

/**
 * Card option — I6 reach-out (node 17:37). Selection is a 2px accent border on
 * the same white fill, plus a filled check so it doesn't rest on colour alone.
 */
export function OptionCard({ title, body, selected, onPress }) {
	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			className={`${CARD} active:opacity-80 ${
				selected ? 'border-2 border-accent' : 'border border-hairline'
			}`}
		>
			<CardContent
				title={title}
				body={body}
				indicator={
					selected ? (
						<View className="size-5.5 items-center justify-center rounded-full bg-accent">
							<Text className="font-inter-bold text-footnote text-white">✓</Text>
						</View>
					) : (
						<View className="size-5.5 rounded-full border-1.5 border-hairline" />
					)
				}
			/>
		</Pressable>
	);
}

/** Plain information card — I8 summary (node 17:77). */
export function InfoCard({ title, body }) {
	return (
		<View className={`${CARD} border border-hairline`}>
			<CardContent title={title} body={body} />
		</View>
	);
}
