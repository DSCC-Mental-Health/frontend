import { useState } from 'react';
import { fieldError, formError } from './errors';

/**
 * The error plumbing shared by log in and password reset.
 *
 * Clerk's `errors` signal keeps the last failure until the next call, so a
 * failed attempt is recorded here and cleared as soon as someone edits a
 * field. Report one with `fail({ clerk })` for a Clerk error, or
 * `fail({ message })` for one of ours.
 */
export default function useAuthErrors(errors, fallback) {
	const [failure, setFailure] = useState(null);
	const shown = failure?.clerk ? errors : null;

	return {
		fail: (next) => setFailure(next),
		clear: () => setFailure(null),
		/** The message under one field ('identifier', 'password', 'code'…). */
		field: (name) => fieldError(shown, name),
		/** The banner message, or null when every problem sits under a field. */
		banner: (fields) =>
			failure ? (failure.message ?? formError(shown, fields, failure.clerk, fallback)) : null,
		/** Wraps a setState so typing clears the last failure. */
		edit: (setter) => (value) => {
			setter(value);
			setFailure(null);
		},
	};
}
