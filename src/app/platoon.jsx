import Sheet from '@/components/Sheet';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ListRow from '@/components/ui/ListRow';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { POP_DATE, leave, platoonName, usePlatoon } from '@/data/platoon-store';
import { useAuth } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

function shortDate(date) {
	return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

/** Not in Figma: leaving changes what commanders' totals include, so it's confirmed. */
function LeaveSheet({ visible, onLeave, onCancel }) {
	return (
		<Sheet visible={visible} onClose={onCancel}>
			<Text accessibilityRole="header" className="w-full font-inter-bold text-title-sm text-ink">
				Leave your platoon?
			</Text>
			<View className="h-3" />
			<Text className="w-full font-inter text-callout text-ink-muted">
				Your check-ins stop counting toward its totals. Nothing you&rsquo;ve written is deleted,
				and you can join again with the code.
			</Text>
			<View className="h-5" />
			<Button label="Leave platoon" tone="dangerOutline" onPress={onLeave} />
			<View className="h-3" />
			<Button label="Cancel" tone="secondary" onPress={onCancel} />
		</Sheet>
	);
}

/** "Q6 Settings — your platoon" (node 315:138). */
export default function PlatoonScreen() {
	const padding = useScreenPadding({ bottom: 20, bottomGap: 8 });
	const router = useRouter();
	const { isLoaded, isSignedIn } = useAuth();
	const platoon = usePlatoon();
	const [confirming, setConfirming] = useState(false);
	// Leaving empties the store while this screen is still animating away;
	// without this it would redirect to Q4 on the way out.
	const leaving = useRef(false);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;
	if (!platoon) return leaving.current ? null : <Redirect href="/join?from=settings" />;

	function handleLeave() {
		setConfirming(false);
		leaving.current = true;
		leave();
		if (router.canGoBack()) router.back();
		else router.replace('/settings');
	}

	return (
		<View className="flex-1 bg-canvas">
			<View
				className="w-full gap-2"
				style={{ paddingTop: padding.paddingTop, paddingHorizontal: GUTTER, paddingBottom: 16 }}
			>
				<BackButton fallback="/settings" />
				<Text accessibilityRole="header" className="w-full font-inter-bold text-large-title text-ink">
					Your platoon
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: GUTTER,
					paddingTop: 4,
					paddingBottom: padding.paddingBottom,
				}}
			>
				<View className="w-full flex-row items-center gap-3 overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4">
					<View
						importantForAccessibility="no-hide-descendants"
						className="size-11 items-center justify-center rounded-md bg-calm"
					>
						<Text className="font-inter-bold text-headline text-white">
							{platoon.company.charAt(0)}
						</Text>
					</View>
					<View className="flex-1 gap-1">
						<Text className="w-full font-inter-semibold text-body text-ink">
							{platoonName(platoon)}
						</Text>
						<Text className="w-full font-inter text-footnote text-ink-muted">
							Linked {shortDate(platoon.linkedAt)} · unlinks at POP ({shortDate(POP_DATE)})
						</Text>
					</View>
				</View>

				<View className="h-3" />
				<View className="w-full gap-1 overflow-hidden rounded-md bg-surface-muted px-4 py-4">
					<Text className="w-full font-inter-semibold text-subhead text-ink">What this adds</Text>
					<Text className="w-full font-inter text-subhead text-ink">
						Your check-ins count toward your platoon&rsquo;s totals. Your commander can&rsquo;t
						see that you&rsquo;re one of them.
					</Text>
				</View>

				<View className="h-6" />
				<View className="w-full gap-2">
					<ListRow
						label="Changed platoon?"
						detail="Enter your new platoon’s code"
						onPress={() => router.push('/join?from=platoon')}
					/>
					<ListRow
						label="Leave platoon"
						tone="accent"
						detail="Stop counting toward platoon totals. Nothing you’ve written is deleted."
						onPress={() => setConfirming(true)}
					/>
				</View>
			</ScrollView>

			<LeaveSheet
				visible={confirming}
				onLeave={handleLeave}
				onCancel={() => setConfirming(false)}
			/>
		</View>
	);
}
