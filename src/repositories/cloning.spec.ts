import {
	GitHubRepositoryCloner,
	GitRepositoryCloner,
	RepositoryCloner,
} from "./cloning";
import { Repository } from "./repository";
import { jest } from "@jest/globals";
import { tmpdir } from "os";
import { SimpleGit } from "simple-git";

describe("git repository cloner", () => {
	it("clones repository into a temporary folder", async () => {
		const tmpDir = tmpdir();
		const cloneFunc = jest.fn<SimpleGit["clone"]>().mockResolvedValue("");

		const repository = await new GitRepositoryCloner(tmpDir, {
			clone: cloneFunc,
		} as unknown as SimpleGit).clone(
			"https://github.com/tenantcloud/template-sync",
			"alpha",
		);

		expect(cloneFunc).toHaveBeenCalledWith(
			"https://github.com/tenantcloud/template-sync",
			expect.stringContaining(tmpDir),
			["--branch", "alpha"],
		);

		expect(repository.root).toContain(tmpDir);
	});
});

describe("github repository cloner", () => {
	it("adds token when specified and host is github.com", async () => {
		const cloneFunc = jest
			.fn<RepositoryCloner["clone"]>()
			.mockResolvedValue(new Repository(""));

		await new GitHubRepositoryCloner("token", { clone: cloneFunc }).clone(
			"https://github.com/repo",
			"branch",
		);

		expect(cloneFunc).toHaveBeenCalledWith(
			"https://github_actions:token@github.com/repo",
			"branch",
		);
	});

	it("ignores token when not specified and host is github.com", async () => {
		const cloneFunc = jest
			.fn<RepositoryCloner["clone"]>()
			.mockResolvedValue(new Repository(""));

		await new GitHubRepositoryCloner(null, { clone: cloneFunc }).clone(
			"https://github.com/repo",
			"branch",
		);

		expect(cloneFunc).toHaveBeenCalledWith(
			"https://github.com/repo",
			"branch",
		);
	});

	it("ignores token when specified but host is not github.com", async () => {
		const cloneFunc = jest
			.fn<RepositoryCloner["clone"]>()
			.mockResolvedValue(new Repository(""));

		await new GitHubRepositoryCloner("token", { clone: cloneFunc }).clone(
			"https://gitlab.com/repo",
			"branch",
		);

		expect(cloneFunc).toHaveBeenCalledWith(
			"https://gitlab.com/repo",
			"branch",
		);
	});
});
