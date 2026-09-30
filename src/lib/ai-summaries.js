import { useUser } from '@clerk/expo';
import { useState } from 'react';

/**
 * Consent for AI weekly summaries, stored on the Clerk user so it follows the
 * account. `enabled` is null until they've chosen — the Insights card asks
 * then, and nothing is sent to a model before a yes.
 *
 * TODO: the summaries API must check this flag server-side too.
 */
export function useAiSummaries() {
	const { user } = useUser();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	const stored = user?.unsafeMetadata?.aiSummaries;
	const enabled = typeof stored === 'boolean' ? stored : null;

	async function set(value) {
		if (!user) return;
		setSaving(true);
		setError(null);
		try {
			// Deep-merges, so onboarding answers and other flags are left alone.
			await user.updateMetadata({ unsafeMetadata: { aiSummaries: value } });
		} catch {
			setError("Couldn't save that. Check your connection and try again.");
		} finally {
			setSaving(false);
		}
	}

	return { enabled, set, saving, error };
}
