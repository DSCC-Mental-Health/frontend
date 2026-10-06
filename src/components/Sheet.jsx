import { GUTTER } from '@/constants/layout';
import { Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Bottom sheet over a scrim — the shell shared by the log-out confirm (node
 * 274:44) and the journal delete confirm (29:54). Both frames use the same scrim,
 * 20px gutter, 20px-radius sheet and 26/22/22 padding.
 *
 * Tapping the scrim or Android back calls `onClose`, unless `dismissable` is
 * false (e.g. while a destructive action is in flight).
 */
export default function Sheet({ visible, onClose, dismissable = true, children }) {
	const insets = useSafeAreaInsets();
	const close = dismissable ? onClose : undefined;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={close ?? (() => {})}
		>
			<Pressable
				className="bg-ink/45"
				// Layout inline so the sheet stays bottom-anchored regardless of
				// whether the utility classes have compiled.
				style={{
					flex: 1,
					justifyContent: 'flex-end',
					paddingHorizontal: GUTTER,
					paddingTop: insets.top + 8,
					paddingBottom: Math.max(20, insets.bottom + 8),
				}}
				onPress={close}
			>
				{/* Swallow taps on the sheet itself so they don't dismiss it. */}
				<Pressable
					onPress={() => {}}
					className="w-full overflow-hidden rounded-xl bg-canvas"
					style={{ maxHeight: '100%' }}
				>
					{/* Scrolls only when a long sheet (T2) meets a small phone or large text. */}
					<ScrollView
						bounces={false}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 }}
					>
						{children}
					</ScrollView>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
