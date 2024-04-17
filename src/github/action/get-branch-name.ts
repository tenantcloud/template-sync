import { createHash } from "crypto";
import { access, readFile } from "fs/promises";
import { resolve } from "path";
import { TEMPLATE_SYNC_LOCAL_CONFIG } from "../../template-sync";
import simpleGit from "simple-git";
import { pathExists } from "fs-extra";

interface GetBranchNameOptions {
	templateBranch: string;
	repoUrl: string;
	repoRoot: string;
	branchPrefix: string;
}

export async function getBranchName(options: GetBranchNameOptions) {
	const { branchPrefix, repoRoot, repoUrl, templateBranch } = options;
	const shaLine = (
		await simpleGit().listRemote([repoUrl, templateBranch])
	).split(" ")[0];
	const match = /^(?<hash>[^\s]+)\s/.exec(shaLine);
	const templateSha = match?.groups?.hash;
	if (!templateSha) {
		throw new Error(
			`Could not get the current sha of ${repoUrl} for ${templateBranch}`,
		);
	}

	let configHash: string;
	if (await pathExists(resolve(repoRoot, TEMPLATE_SYNC_LOCAL_CONFIG))) {
		configHash = createHash("sha256")
			.update(
				await readFile(resolve(repoRoot, TEMPLATE_SYNC_LOCAL_CONFIG)),
			)
			.digest("hex")
			.slice(0, 8);
	} else {
		configHash = "noLocalConfig";
	}

	return `${branchPrefix}${templateSha.slice(0, 8)}-${configHash}`;
}
