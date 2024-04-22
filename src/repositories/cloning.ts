import { SimpleGit } from "simple-git";
import { resolve } from "path";
import { randomUUID } from "node:crypto";
import { Repository } from "./repository";

export interface RepositoryCloner {
	clone(url: string, branch: string): Promise<Repository>;
}

export class GitRepositoryCloner implements RepositoryCloner {
	constructor(
		private readonly tmpDir: string,
		private readonly git: SimpleGit,
	) {}

	async clone(url: string, branch: string): Promise<Repository> {
		const destination = resolve(this.tmpDir, randomUUID());

		await this.git.clone(url, destination, ["--branch", branch]);

		return new Repository(destination);
	}
}

export class GitHubRepositoryCloner implements RepositoryCloner {
	constructor(
		private readonly token: string | null = null,
		private readonly delegate: RepositoryCloner,
	) {}

	async clone(url: string, branch: string): Promise<Repository> {
		if (this.token && url.includes("https://github.com")) {
			const authToken = `github_actions:${this.token}@`;

			url = url.replace(
				"https://github.com",
				`https://${authToken}github.com`,
			);
		}

		return await this.delegate.clone(url, branch);
	}
}
