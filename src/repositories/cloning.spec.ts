import {
	GitHubRepositorySourcer,
	GitRepositorySourcer,
	RepositorySourcer,
} from "./sourcing";
import { jest } from "@jest/globals";
import { tmpdir } from "os";
import { SimpleGit } from "simple-git";

describe("git repository cloner", () => {
	it("clones repository into a temporary folder", async () => {
		const tmpDir = tmpdir();
		const cloneFunc = jest.fn<SimpleGit["clone"]>().mockResolvedValue("");

		const root = await new GitRepositorySourcer(tmpDir, {
			clone: cloneFunc,
		} as unknown as SimpleGit).source(
			"https://github.com/tenantcloud/template-sync",
			"alpha",
		);

		expect(cloneFunc).toHaveBeenCalledWith(
			"https://github.com/tenantcloud/template-sync",
			expect.stringContaining(tmpDir),
			["--branch", "alpha"],
		);

		expect(root).toContain(tmpDir);
	});
});

describe("github repository cloner", () => {
	it("adds token when specified and host is github.com", async () => {
		const sourceFunc = jest
			.fn<RepositorySourcer["source"]>()
			.mockResolvedValue("");

		await new GitHubRepositorySourcer("token", {
			source: sourceFunc,
		}).source("https://github.com/repo", "branch");

		expect(sourceFunc).toHaveBeenCalledWith(
			"https://github_actions:token@github.com/repo",
			"branch",
		);
	});

	it("ignores token when not specified and host is github.com", async () => {
		const sourceFunc = jest
			.fn<RepositorySourcer["source"]>()
			.mockResolvedValue("");

		await new GitHubRepositorySourcer(null, { source: sourceFunc }).source(
			"https://github.com/repo",
			"branch",
		);

		expect(sourceFunc).toHaveBeenCalledWith(
			"https://github.com/repo",
			"branch",
		);
	});

	it("ignores token when specified but host is not github.com", async () => {
		const sourceFunc = jest
			.fn<RepositorySourcer["source"]>()
			.mockResolvedValue("");

		await new GitHubRepositorySourcer("token", {
			source: sourceFunc,
		}).source("https://gitlab.com/repo", "branch");

		expect(sourceFunc).toHaveBeenCalledWith(
			"https://gitlab.com/repo",
			"branch",
		);
	});
});
