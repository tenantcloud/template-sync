import * as core from "@actions/core";
import { tmpdir } from "os";
import {
	GitHubRepositorySourcer,
	GitRepositorySourcer,
} from "./repositories/sourcing";
import simpleGit from "simple-git";
import { Syncer } from "./sync";
import { syncResultToReport } from "./results/result-to-report";

async function main() {
	const tmpDir = process.env["RUNNER_TEMP"] || tmpdir();
	const syncer = new Syncer(
		new GitHubRepositorySourcer(
			core.getInput("token") || null,
			new GitRepositorySourcer(tmpDir, simpleGit().env(process.env)),
		),
	);

	const result = await syncer.sync(process.cwd());

	core.setOutput("report", syncResultToReport(result));
}

void main();
