import Sheet from '@/components/Sheet';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Callout from '@/components/ui/Callout';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { MINDLINE, SAF_HOTLINE, SOS } from '@/data/support';
import { call, openMindline, openWhatsApp } from '@/lib/support-links';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

function LineCard({ name, body, phone, urgent, children }) {
	return (
		<View
			className={`w-full gap-3 overflow-hidden rounded-lg px-4 py-4 ${
				urgent ? 'bg-danger-surface' : 'border border-hairline bg-white'
			}`}
		>
			<View className="w-full gap-1">
				<Text accessibilityRole="header" className="w-full font-inter-semibold text-body-lg text-ink">
					{name}
				</Text>
				<Text className="w-full font-inter text-subhead text-ink-muted">{body}</Text>
			</View>
			<Button label={`Call ${phone}`} tone={urgent ? 'danger' : 'calm'} onPress={() => call(phone)} />
			{children}
		</View>
	);
}

/** One line of what leaving Steady reveals: warn = revealed, calm = not. */
function Point({ tone, children }) {
	return (
		<View className="w-full flex-row items-start gap-3">
			<View className={`mt-0.5 size-4 rounded-full ${tone === 'warn' ? 'bg-warn' : 'bg-calm'}`} />
			<Text className="flex-1 font-inter text-subhead text-ink">{children}</Text>
		</View>
	);
}

/** "T2 Handoff — before you leave" (node 182:2), before SOS CareText. */
function HandoffSheet({ visible, onClose }) {
	function go(open) {
		onClose();
		// iOS won't present the in-app browser while this sheet is still sliding away.
		setTimeout(open, 400);
	}

	return (
		<Sheet visible={visible} onClose={onClose}>
			<Text accessibilityRole="header" className="w-full font-inter-bold text-title-sm text-ink">
				This opens WhatsApp
			</Text>
			<View className="h-2" />
			<Text className="w-full font-inter text-callout text-ink-muted">
				SOS CareText is run outside Steady. Worth knowing before you tap through:
			</Text>
			<View className="h-4" />
			<View className="w-full gap-3 overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4">
				<Point tone="warn">They&rsquo;ll see your phone number.</Point>
				<Point tone="warn">
					The chat stays in your WhatsApp list, where someone glancing at your phone could see it.
				</Point>
				<Point tone="calm">
					Nothing from Steady goes with you — not your check-ins, journal, or insights.
				</Point>
				<Point tone="calm">Nothing is shared with your unit either way.</Point>
			</View>
			<View className="h-4" />
			<Callout
				title="Want to stay anonymous?"
				body="mindline.sg opens inside Steady and asks for nothing."
			/>
			<View className="h-5" />
			<Button label="Open WhatsApp" onPress={() => go(() => openWhatsApp(SOS.whatsapp))} />
			<View className="h-3" />
			<Button label="Use mindline.sg instead" tone="secondary" onPress={() => go(openMindline)} />
			<View className="h-3" />
			<Button label="Go back" tone="secondary" onPress={onClose} />
		</Sheet>
	);
}

/**
 * "O3 Urgent help" (node 35:2). No sign-in check: nothing here is personal,
 * and these numbers should be reachable whatever state the app is in.
 */
export default function UrgentHelpScreen() {
	const padding = useScreenPadding();
	const [handoff, setHandoff] = useState(false);

	return (
		<View className="flex-1 bg-canvas">
			<View className="w-full" style={{ ...padding, paddingHorizontal: GUTTER, paddingBottom: 12 }}>
				<BackButton fallback="/support" />
				<View className="h-4" />
				<Text accessibilityRole="header" className="w-full font-inter-bold text-large-title text-ink">
					Help right now
				</Text>
				<Text className="w-full font-inter text-subhead text-ink-muted">
					These lines are staffed by people trained for this. You don&rsquo;t have to be in
					crisis to call.
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 20 }}
			>
				<View className="w-full gap-3">
					<LineCard
						urgent
						name={SOS.name}
						phone={SOS.phone}
						body="24 hours, every day. Free and confidential. You can call without giving your name."
					>
						<TextButton
							label="Text on WhatsApp instead"
							variant="linkStrong"
							onPress={() => setHandoff(true)}
							className="self-center"
						/>
					</LineCard>
					<LineCard
						urgent
						name={MINDLINE.name}
						phone={MINDLINE.phone}
						body="24 hours. Trained counsellors, by phone, WhatsApp or webchat."
					/>
					<LineCard
						name={SAF_HOTLINE.name}
						phone={SAF_HOTLINE.phone}
						body="For servicemen. Trained counsellors familiar with NS."
					/>
				</View>

				<View className="h-5" />
				<View className="w-full gap-2 overflow-hidden rounded-lg bg-surface-muted px-4 py-4">
					<Text className="w-full font-inter-semibold text-callout text-ink">
						If you can&rsquo;t make a call
					</Text>
					<Text className="w-full font-inter text-subhead text-ink-muted">
						Tell your buddy, your section IC, or any medic on duty. You don&rsquo;t need to
						explain everything — saying &ldquo;I&rsquo;m not okay&rdquo; is enough to start.
					</Text>
				</View>

				<View className="h-4" />
				<Text className="w-full text-center font-inter text-footnote text-ink-faint">
					Steady is not an emergency service. No one monitors this app in real time.
				</Text>
			</ScrollView>

			<HandoffSheet visible={handoff} onClose={() => setHandoff(false)} />
		</View>
	);
}
