import ToolIcon from '@/components/ToolIcon';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { TOOL_SECTIONS } from '@/data/tools';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

function ToolCard({ tool, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${tool.name}, ${tool.duration}`}
			// The description is how people pick by situation, so VoiceOver reads it too.
			accessibilityHint={tool.body}
			onPress={onPress}
			className="w-full flex-row items-start gap-3 overflow-hidden rounded-lg border border-hairline bg-white px-3 py-4 active:opacity-80"
		>
			<ToolIcon tool={tool} />
			<View className="flex-1 gap-1">
				<View className="w-full flex-row items-center gap-2">
					<Text className="flex-1 font-inter-semibold text-body text-ink">
						{tool.name}
					</Text>
					<Text className="font-inter-medium text-footnote text-ink-faint">
						{tool.duration}
					</Text>
				</View>
				<Text className="w-full font-inter text-subhead text-ink-muted">
					{tool.body}
				</Text>
			</View>
		</Pressable>
	);
}

export default function ToolsScreen() {
	const padding = useScreenPadding();
	const router = useRouter();

	return (
		<View className="flex-1 bg-canvas">
			<View
				className="w-full"
				style={{ ...padding, paddingHorizontal: GUTTER, paddingBottom: 12 }}
			>
				<Text
					accessibilityRole="header"
					className="w-full font-inter-bold text-large-title text-ink"
				>
					Tools
				</Text>
				<Text className="w-full font-inter text-subhead text-ink-muted">
					Pick by what&rsquo;s happening, not by name. Everything works in a
					bunk, in boots, without sound.
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: GUTTER,
					paddingTop: 8,
					paddingBottom: 12,
				}}
			>
				{TOOL_SECTIONS.map((section, s) => (
					<Fragment key={section.title}>
						{s > 0 ? <View className="h-6" /> : null}

						<Text
							accessibilityRole="header"
							className="w-full font-inter-semibold text-callout text-ink"
						>
							{section.title}
						</Text>
						{section.hint ? (
							<Text className="w-full font-inter text-caption text-ink-faint">
								{section.hint}
							</Text>
						) : null}

						<View className="h-3" />

						<View className="w-full gap-2">
							{section.tools.map((tool) => (
								<ToolCard
									key={tool.id}
									tool={tool}
									onPress={() => router.push(tool.href)}
								/>
							))}
						</View>
					</Fragment>
				))}

				<View className="h-5" />

				<Text className="w-full font-inter text-caption text-ink-faint">
					These are self-help techniques, not treatment. If something
					isn&rsquo;t shifting, there are people you can talk to.
				</Text>

				<View className="h-2" />

				<TextButton
					label="Go to Support"
					variant="linkStrong"
					role="link"
					onPress={() => router.push('/support')}
					className="self-start"
				/>
			</ScrollView>
		</View>
	);
}
