import * as github from "@actions/github";
import * as core from "@actions/core";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtemp, writeFile } from "fs/promises";
import { DEFAULT_BRANCH_PREFIX, DEFAULT_COMMIT_MSG } from "./constants";
import { getBranchName } from "./get-branch-name";
import { TEMPLATE_SYNC_LOCAL_CONFIG, templateSync } from "../../template-sync";
import { syncResultsToMd } from "../../formatting";
import simpleGit from "simple-git";

export interface GithubOptions {
	/**
	 * The owner/repo path of the repo on github
	 */
	repoPath: string;

	/** A github token with access to write pull requests */
	githubToken: string;

	/** A separate github token with permissions to clone from the other repo.  Only needed for private repos */
	remoteRepoToken?: string;

	/**
	 * Normally, this should be the working directory of a github action, but this
	 * could also be an internal file depending on things like monorepo structures
	 */
	repoRoot?: string;

	/**
	 * The branch on the template that we want to sync to
	 */
	templateBranch: string;

	/** A short branch prefix for the branch that will be created in order to store the changes */
	branchPrefix?: string;

	/**
	 * The commit message to supply when making the merge commits
	 */
	commitMsg?: string;

	/**
	 * The title of the pull request
	 */
	titleMsg?: string;

	/**
	 * This is the branch to open the pull request to.  If not set, we will use the
	 * repo's default branch.
	 */
	prToBranch?: string;

	/**
	 * Updates the afterRef in a templatesync.local.json to be the last sha value of the
	 * template if true
	 */
	updateAfterRef: boolean;

	/**
	 * For testing, this is a templatesync.config.json for mocking
	 */
	mockLocalConfig?: string;
}

function getTempDir() {
	return process.env["RUNNER_TEMP"] || tmpdir();
}

export async function syncGithubRepo(options: GithubOptions) {
	const octokit = github.getOctokit(options.githubToken);

	const repoRoot = options.repoRoot ?? process.cwd();
	const branchPrefix = options.branchPrefix ?? DEFAULT_BRANCH_PREFIX;
	const commitMsg = options.commitMsg
		? options.commitMsg
		: DEFAULT_COMMIT_MSG;

	// Note, we use git here so that we can change this around for other git providers more easily
	const baseRepoUrl = `github.com/${options.repoPath}.git`;
	const authedRepoUrl = `https://${options.remoteRepoToken ? `github_actions:${options.remoteRepoToken}@` : ""}${baseRepoUrl}`;

	const git = simpleGit();

	const branchName = await getBranchName({
		branchPrefix,
		templateBranch: options.templateBranch,
		repoUrl: `https://${baseRepoUrl}`,
		repoRoot,
	});

	// Check if the branch exists already and skip
	const output = await git.listRemote(["--heads", "origin", branchName]);

	// Non-empty output means the branch exists
	if (output) {
		core.warning(
			`The exact same combination of ${TEMPLATE_SYNC_LOCAL_CONFIG} and remote ${options.templateBranch} has been run before`,
		);
		core.warning(
			`If you would like to re-run due to plugins, etc.  Please delete branch: ${branchName}`,
		);
		// Error this
		process.exit(1);
	}

	let prToBranch = options.prToBranch;
	if (!prToBranch) {
		const resp = await octokit.rest.repos.get({
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
		});
		prToBranch = resp.data.default_branch;
	}

	console.log(`Checking out ${branchName}`);

	await git.checkoutLocalBranch(branchName);
	if (options.mockLocalConfig) {
		await writeFile(
			join(repoRoot, `${TEMPLATE_SYNC_LOCAL_CONFIG}.json`),
			options.mockLocalConfig,
		);
	}

	// Clone and merge on this branch
	const tempAppDir = await mkdtemp(join(getTempDir(), "template_sync_"));

	console.log("Calling template sync...");
	const result = await templateSync({
		tmpCloneDir: tempAppDir,
		repoDir: options.repoRoot ?? process.cwd(),
		repoUrl: authedRepoUrl,
		updateAfterRef: options.updateAfterRef,
	});

	console.log("Committing all files...");
	// commit everything
	await git.add(".");
	await git.commit(commitMsg);
	await git.push(["-u", "origin", branchName]);

	const syncResultsAsText = `
Template Synchronization Operation of ${baseRepoUrl} ${options.templateBranch}

${syncResultsToMd(result)}
`;

	console.log(`Creating Pull Request...: ${syncResultsAsText}`);
	// const resp = await octokit.rest.pulls.create({
	// 	owner: github.context.repo.owner,
	// 	repo: github.context.repo.repo,
	// 	head: branchName,
	// 	base: prToBranch,
	// 	title: DEFAULT_TITLE_MSG,
	// 	body: syncResultsAsText,
	// });
	//
	// core.setOutput("prNumber", resp.data.number);
}
