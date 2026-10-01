import { PRIVACY_PANELS } from '@/data/onboarding';
import { Text, View } from 'react-native';

const PANEL_BG = {
	sand: 'bg-surface-muted',
	teal: 'bg-calm-surface',
	white: 'bg-white',
};

const PANEL_TITLE = {
	sand: 'text-ink',
	teal: 'text-calm-strong',
	white: 'text-ink',
};

/**
 * The three "who can see what" panels from onboarding I2 (node 16:12). Also the
 * body of the welcome screen's "How Steady handles your data" page.
 */
export default function PrivacyPanels() {
	return (
		<View className="w-full gap-3">
			{PRIVACY_PANELS.map((panel) => (
				<View
					key={panel.title}
					className={`w-full gap-2 overflow-hidden rounded-lg px-4 py-4 ${PANEL_BG[panel.tone]}`}
				>
					<Text
						accessibilityRole="header"
						className={`w-full font-inter-semibold text-callout ${PANEL_TITLE[panel.tone]}`}
					>
						{panel.title}
					</Text>
					{panel.body ? (
						<Text className="w-full font-inter text-callout text-ink-muted">
							{panel.body}
						</Text>
					) : null}
					{panel.lines?.map((line) => (
						<Text
							key={line}
							className="w-full font-inter text-callout text-ink-muted"
						>
							{line}
						</Text>
					))}
					{panel.note ? (
						<Text className="w-full font-inter-medium text-footnote text-ink">
							{panel.note}
						</Text>
					) : null}
				</View>
			))}
		</View>
	);
}
