/**
 * Reading Clerk's signal-API errors (`errors` from useSignIn / useSignUp).
 *
 * `longMessage` is the copy Clerk marks as safe to show people; `message` is
 * developer-facing, so it's only the fallback.
 */

/** The message for one field (`identifier`, `password`, `emailAddress`, `code`…). */
export function fieldError(errors, name) {
	const error = errors?.fields?.[name];
	return error ? (error.longMessage ?? error.message) : null;
}

/**
 * The banner message for a failed attempt, or null when every problem was
 * already shown under a field.
 */
export function formError(errors, fields, returned, fallback) {
	if (fields.some((name) => fieldError(errors, name))) return null;
	const global = errors?.global?.[0];
	return global?.longMessage ?? returned?.longMessage ?? fallback;
}
