import Sheet from '@/components/Sheet';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { SAF_HOTLINE } from '@/data/support';
import { call, openMindline } from '@/lib/support-links';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

/** What each option reveals about you comes first, so it's what's noticed. */
const OPTIONS = [
	{
		id: 'mindline',
		title: 'mindline.sg',
		body: 'Opens inside Steady. Anonymous self-help tools and an AI chat. No sign-up, no phone number.',
		tags: [['Nothing revealed', 'calm'], ['In-app'], ['24/7'], ['Free']],
		role: 'link',
		highlight: true,
	},
	{
		id: 'saf',
		title: SAF_HOTLINE.name,
		body: 'Phone. Counsellors who know NS. You choose how much to say about who you are.',
		tags: [['Shows your number', 'warn'], ['Phone'], ['NS-specific']],
		hint: `Calls ${SAF_HOTLINE.phone}`,
	},
	{
		id: 'para',
		title: 'Your unit paraCounsellor',
		body: "A trained peer inside your unit. Steady shows you who they are and how to approach them — it doesn't message them for you.",
		tags: [["They'll know it's you", 'warn'], ['In person'], ['Free']],
	},
];

function OptionCard({ option, onPress }) {
	return (
		<Pressable
			accessibilityRole={option.role ?? 'button'}
			accessibilityLabel={`${option.title}. ${option.tags.map(([t]) => t).join(', ')}`}
			accessibilityHint={option.hint ?? option.body}
			onPress={onPress}
			className={`w-full gap-2 overflow-hidden rounded-lg px-4 py-4 active:opacity-80 ${
				option.highlight ? 'border-2 border-calm bg-calm-surface' : 'border border-hairline bg-white'
			}`}
		>
			<Text className="w-full font-inter-semibold text-body-lg text-ink">{option.title}</Text>
			<Text className="w-full font-inter text-subhead text-ink-muted">{option.body}</Text>
			<View className="w-full flex-row flex-wrap gap-2 pt-1">
				{option.tags.map(([label, tone]) => (
					<Tag key={label} label={label} tone={tone} />
				))}
			</View>
		</Pressable>
	);
}

/** No frame for this; the copy needs review before release. */
function ParaCounsellorSheet({ visible, onClose }) {
	return (
		<Sheet visible={visible} onClose={onClose}>
			<Text accessibilityRole="header" className="w-full font-inter-bold text-title-sm text-ink">
				Finding your paraCounsellor
			</Text>
			<View className="h-3" />
			<Text className="w-full font-inter text-callout text-ink-muted">
				Every unit has trained peers you can talk to in person. Ask your section IC or PC who
				yours is — you don&rsquo;t have to say why.
			</Text>
			<View className="h-3" />
			<Text className="w-full font-inter text-callout text-ink-muted">
				When you find them, &ldquo;Can I talk to you for a bit?&rdquo; is enough. Steady
				doesn&rsquo;t contact them or tell anyone you asked.
			</Text>
			<View className="h-5" />
			<Button label="Got it" onPress={onClose} />
		</Sheet>
	);
}

/** "T1 Support hub (handoff)" (node 181:2). */
export default function SupportScreen() {
	const padding = useScreenPadding();
	const router = useRouter();
	const [showPara, setShowPara] = useState(false);

	const actions = {
		mindline: openMindline,
		saf: () => call(SAF_HOTLINE.phone),
		para: () => setShowPara(true),
	};

	return (
		<View className="flex-1 bg-canvas">
			<View className="w-full" style={{ ...padding, paddingHorizontal: GUTTER, paddingBottom: 12 }}>
				<Text accessibilityRole="header" className="w-full font-inter-bold text-large-title text-ink">
					Support
				</Text>
				<Text className="w-full font-inter text-subhead text-ink-muted">
					Steady doesn&rsquo;t counsel you — it points you to people who do. Each option says
					what it reveals about you.
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 4, paddingBottom: 16 }}
			>
				<View className="w-full gap-3">
					{OPTIONS.map((option) => (
						<OptionCard key={option.id} option={option} onPress={actions[option.id]} />
					))}

					<View className="w-full gap-2 overflow-hidden rounded-lg bg-danger-surface px-4 py-4">
						<Text
							accessibilityRole="header"
							className="w-full font-inter-semibold text-body text-danger"
						>
							If you need help right now
						</Text>
						<Text className="w-full font-inter text-footnote text-ink">
							Steady is not an emergency service and nobody monitors it in real time.
						</Text>
						<View className="h-1" />
						<Button
							label="See urgent help options"
							tone="danger"
							role="link"
							onPress={() => router.push('/urgent-help')}
						/>
					</View>
				</View>
			</ScrollView>

			<ParaCounsellorSheet visible={showPara} onClose={() => setShowPara(false)} />
		</View>
	);
}
