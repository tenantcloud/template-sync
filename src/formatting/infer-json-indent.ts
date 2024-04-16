const spacingRegex = /[{[]\n?(?<spacing>\s+)["tf\d]/;
export function inferJSONIndent(rawJSON: string) {
	const match = spacingRegex.exec(rawJSON);
	if (!match?.groups?.spacing) {
		// eslint-disable-next-line no-console
		// Tab
		return "\t";
	}
	const spacing = match.groups.spacing;
	// Handle the case where there were multiple newlines before a value
	const lastNewLine = spacing.lastIndexOf("\n");
	return match?.groups.spacing.slice(lastNewLine >= 0 ? lastNewLine + 1 : 0);
}
