import * as core from "@actions/core";
import {tmpdir} from "os";
import {GitHubRepositoryCloner, GitRepositoryCloner} from "./repositories/cloning";
import simpleGit from "simple-git";
import {sync} from "./sync";

async function main() {
	const tmpDir = process.env["RUNNER_TEMP"] || tmpdir();
	const repositoryCloner = new GitHubRepositoryCloner(
		core.getInput("token") || null,
		new GitRepositoryCloner(tmpDir, simpleGit().env(process.env)),
	);

	await sync({
		tmpDir,
		repositoryCloner,
	});
}

void main();
