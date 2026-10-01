import { INK_FAINT } from '@/constants/colors';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

const eyeIcon = require('@/assets/images/eye-toggle.svg');

/**
 * Labelled text field from W1 (nodes 248:43, 248:60, 248:90).
 *
 * 1px hairline at rest, 1.6px accent while focused, 1.6px danger with the
 * error shown right under the field it belongs to. `secure` adds the
 * show/hide eye. Everything else passes straight through to TextInput.
 */
export default function Field({
	label,
	error,
	secure = false,
	ref,
	...inputProps
}) {
	const [focused, setFocused] = useState(false);
	const [shown, setShown] = useState(false);

	let border = 'border border-hairline';
	if (error) border = 'border-2 border-danger';
	else if (focused) border = 'border-2 border-accent';

	return (
		<View className="w-full gap-2">
			<Text className="w-full font-inter-semibold text-subhead text-ink">
				{label}
			</Text>
			<View
				className={`w-full flex-row items-center gap-3 rounded-md bg-white p-4 ${border}`}
			>
				<TextInput
					ref={ref}
					accessibilityLabel={label}
					accessibilityHint={error ?? undefined}
					placeholderTextColor={INK_FAINT}
					secureTextEntry={secure && !shown}
					autoCapitalize="none"
					autoCorrect={false}
					{...inputProps}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					className="flex-1 p-0 font-inter text-body text-ink"
				/>
				{secure ? (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={shown ? 'Hide password' : 'Show password'}
						onPress={() => setShown((s) => !s)}
						// 22pt icon + 11 each side = 44pt.
						hitSlop={11}
						className="active:opacity-60"
					>
						<Image
							source={eyeIcon}
							style={{ width: 22, height: 22, opacity: shown ? 1 : 0.55 }}
							contentFit="contain"
							accessibilityIgnoresInvertColors
						/>
					</Pressable>
				) : null}
			</View>
			{error ? (
				<Text className="w-full font-inter-semibold text-footnote text-danger">
					{error}
				</Text>
			) : null}
		</View>
	);
}
