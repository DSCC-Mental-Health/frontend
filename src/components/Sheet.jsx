import { Modal, Pressable } from 'react-native';
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
				className="bg-scrim"
				// Layout inline so the sheet stays bottom-anchored regardless of
				// whether the utility classes have compiled.
				style={{
					flex: 1,
					justifyContent: 'flex-end',
					paddingHorizontal: 20,
					paddingBottom: Math.max(20, insets.bottom + 8),
				}}
				onPress={close}
			>
				{/* Swallow taps on the sheet itself so they don't dismiss it. */}
				<Pressable
					onPress={() => {}}
					className="w-full overflow-hidden rounded-sheet bg-aura-outer px-5.5 pb-5.5 pt-6.5"
				>
					{children}
				</Pressable>
			</Pressable>
		</Modal>
	);
}
