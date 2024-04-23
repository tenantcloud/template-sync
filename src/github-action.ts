import * as core from "@actions/core";
import { tmpdir } from "os";
import {
	GitHubRepositoryCloner,
	GitRepositoryCloner,
} from "./repositories/cloning";
import simpleGit from "simple-git";
import { sync } from "./sync";
import { syncResultToReport } from "./results/result-to-report";

async function main() {
	const tmpDir = process.env["RUNNER_TEMP"] || tmpdir();
	const repositoryCloner = new GitHubRepositoryCloner(
		core.getInput("token") || null,
		new GitRepositoryCloner(tmpDir, simpleGit().env(process.env)),
	);

	const result = await sync(process.cwd(), {
		repositoryCloner,
	});

	core.setOutput("report", syncResultToReport(result));
}

void main();
