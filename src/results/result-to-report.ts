import { SyncResult } from "../sync";

export function syncResultToReport(result: SyncResult): string {
	const repositories = result.repositories.map(
		({ url, branch }) => `- <${url}> at branch \`${branch}\``,
	);

	return `## The following repositories were used for sync:

${repositories.join("\n")}`;
}
