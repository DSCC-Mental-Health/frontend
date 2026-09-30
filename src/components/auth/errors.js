export function fieldError(errors, name) {
	const error = errors?.fields?.[name];
	return error ? (error.longMessage ?? error.message) : null;
}

export function formError(errors, fields, returned, fallback) {
	if (fields.some((name) => fieldError(errors, name))) return null;
	const global = errors?.global?.[0];
	return global?.longMessage ?? returned?.longMessage ?? fallback;
}
