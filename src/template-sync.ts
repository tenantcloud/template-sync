import { join, resolve } from "path";
import { readFile, writeFile } from "fs/promises";
import { getAllFilesInDir } from "./match";
import { Config, LocalConfig } from "./types";
import { mergeFile } from "./merge-file";
import { Change } from "diff";
import { inferJSONIndent } from "./formatting";
import * as commentJSON from "comment-json";
import simpleGit, { SimpleGitFactory } from "simple-git";
import { pathExists } from "fs-extra";

export interface TemplateSyncOptions {
	repoUrl: string;

	/**
	 * The directory for cloning our template repo into via the cloneDriver
	 */
	tmpCloneDir: string;

	/**
	 * The repo directory path that we are going to merge toward
	 */
	repoDir: string;

	/**
	 * If set to true, template sync will apply the current ref
	 * of the template repo to afterRef
	 */
	updateAfterRef?: boolean;

	gitFactory?: SimpleGitFactory;
}

export interface TemplateSyncReturn {
	/**
	 * An array of files that were skipped outright due to a templatesync.local ignore glob
	 */
	localSkipFiles: string[];
	/**
	 * An object mapping all file paths to any merge rules that would've overridden the merge rules
	 * of the template sync file.
	 *
	 * Note: right now, this shows non-changed diffs as well so you have to look for added or removed
	 */
	localFileChanges: {
		[filePath: string]: Change[];
	};
}

export const TEMPLATE_SYNC_CONFIG = "templatesync";
export const TEMPLATE_SYNC_LOCAL_CONFIG = "templatesync.local";

export async function templateSync(
	options: TemplateSyncOptions,
): Promise<TemplateSyncReturn> {
	const gitFactory = options.gitFactory || simpleGit;

	const tempCloneDir = resolve(options.tmpCloneDir, "cloned_repo");
	await gitFactory().env(process.env).clone(options.repoUrl, tempCloneDir);
	const cloneGit = gitFactory(tempCloneDir);

	// Get the clone Config
	const cloneConfigPath = join(tempCloneDir, `${TEMPLATE_SYNC_CONFIG}.json`);
	const templateSyncConfig: Config = (await pathExists(cloneConfigPath))
		? (commentJSON.parse(
				(await readFile(cloneConfigPath)).toString(),
			) as unknown as Config)
		: { ignore: [] };

	const localConfigPath = join(
		options.repoDir,
		`${TEMPLATE_SYNC_LOCAL_CONFIG}.json`,
	);
	const localTemplateSyncConfig: LocalConfig = (await pathExists(
		localConfigPath,
	))
		? (commentJSON.parse(
				(await readFile(localConfigPath)).toString(),
			) as unknown as LocalConfig)
		: { ignore: [] };

	let filesToSync: string[];
	if (localTemplateSyncConfig.afterRef) {
		filesToSync = (
			await cloneGit.diffSummary([
				`${localTemplateSyncConfig.afterRef}..`,
				"--name-only",
			])
		).files.map((file) => file.file);
	} else {
		filesToSync = await getAllFilesInDir(tempCloneDir, [
			...templateSyncConfig.ignore,
			".git/**",
		]);
	}

	const localSkipFiles: string[] = [];
	const localFileChanges: {
		[filePath: string]: Change[];
	} = {};

	await Promise.all(
		filesToSync.map(async (f) => {
			const result = await mergeFile(f, {
				localTemplateSyncConfig,
				templateSyncConfig,
				tempCloneDir,
				cwd: options.repoDir,
			});
			if (result.ignoredDueToLocal) {
				localSkipFiles.push(f);
			} else if (result?.localChanges && result.localChanges.length > 0) {
				localFileChanges[f] = result.localChanges;
			}
		}),
	);

	// apply after ref
	if (options.updateAfterRef) {
		const ref = await cloneGit.revparse("HEAD");

		if (await pathExists(localConfigPath)) {
			const configStr = (await readFile(localConfigPath)).toString();
			const config = commentJSON.parse(
				configStr,
			) as unknown as LocalConfig;
			config.afterRef = ref;
			await writeFile(
				localConfigPath,
				commentJSON.stringify(config, null, inferJSONIndent(configStr)),
			);
		} else {
			await writeFile(
				localConfigPath,
				commentJSON.stringify({ afterRef: ref }, null, 4),
			);
		}
	}

	return {
		localSkipFiles,
		localFileChanges,
	};
}
