import ToolIcon from '@/components/ToolIcon';
import { TOOL_SECTIONS } from '@/data/tools';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GUTTER = 20;

/** One tool card (node 216:5). */
function ToolCard({ tool, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${tool.name}, ${tool.duration}`}
			// The description is how people pick by situation, so VoiceOver reads it too.
			accessibilityHint={tool.body}
			onPress={onPress}
			className="w-full flex-row items-start gap-3.25 overflow-hidden rounded-control border border-hairline bg-white px-3.25 py-3.5 active:opacity-80"
		>
			<ToolIcon tool={tool} />
			<View className="flex-1 gap-1">
				<View className="w-full flex-row items-center gap-2">
					<Text className="flex-1 font-inter-semibold text-[15px] leading-[19.8px] text-ink">
						{tool.name}
					</Text>
					<Text className="font-inter-medium text-[12px] text-ink-faint">
						{tool.duration}
					</Text>
				</View>
				<Text className="w-full font-inter text-[13px] leading-[18.59px] text-ink-muted">
					{tool.body}
				</Text>
			</View>
		</Pressable>
	);
}

/** Tools — "N1 Tools library" (node 31:2). */
export default function ToolsScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<View className="flex-1 bg-aura-outer">
			<View
				className="w-full"
				style={{
					paddingTop: Math.max(56, insets.top + 12),
					paddingHorizontal: GUTTER,
					paddingBottom: 12,
				}}
			>
				<Text accessibilityRole="header" className="w-full font-inter-bold text-[26px] text-ink">
					Tools
				</Text>
				<Text className="w-full font-inter text-[13px] leading-[18.85px] text-ink-muted">
					Pick by what&rsquo;s happening, not by name. Everything works in a bunk, in
					boots, without sound.
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 12 }}
			>
				{TOOL_SECTIONS.map((section, s) => (
					<Fragment key={section.title}>
						{s > 0 ? <View className="h-6" /> : null}

						<Text
							accessibilityRole="header"
							className="w-full font-inter-semibold text-[14px] text-ink"
						>
							{section.title}
						</Text>
						{section.hint ? (
							<Text className="w-full font-inter text-[11px] leading-[15.4px] text-ink-faint">
								{section.hint}
							</Text>
						) : null}

						<View className="h-2.75" />

						<View className="w-full gap-2.25">
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

				{/* TODO: the Support tab is still a placeholder — build O1/T1 (nodes
				    34:2, 181:2) so this link reaches real people. */}
				<Text className="w-full font-inter text-[11px] leading-[15.95px] text-ink-faint">
					These are self-help techniques, not treatment. If something isn&rsquo;t
					shifting, there are people you can talk to.
				</Text>

				<View className="h-2" />

				<Pressable
					accessibilityRole="link"
					onPress={() => router.push('/support')}
					// 13pt text is ~16pt tall; 14 either side reaches 44pt.
					hitSlop={14}
					className="self-start active:opacity-60"
				>
					<Text className="font-inter-semibold text-[13px] text-accent-text">
						Go to Support
					</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}
