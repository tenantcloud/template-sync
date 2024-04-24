import { SimpleGit } from "simple-git";
import { resolve } from "path";
import { randomUUID } from "node:crypto";

export interface RepositorySourcer {
	source(url: string, branch: string): Promise<string>;
}

export class GitRepositorySourcer implements RepositorySourcer {
	constructor(
		private readonly tmpDir: string,
		private readonly git: SimpleGit,
	) {}

	async source(url: string, branch: string): Promise<string> {
		const destination = resolve(this.tmpDir, randomUUID());

		await this.git.clone(url, destination, ["--branch", branch]);

		return destination;
	}
}

export class GitHubRepositorySourcer implements RepositorySourcer {
	constructor(
		private readonly token: string | null,
		private readonly delegate: RepositorySourcer,
	) {}

	async source(url: string, branch: string): Promise<string> {
		if (this.token && url.includes("https://github.com")) {
			const authToken = `github_actions:${this.token}@`;

			url = url.replace(
				"https://github.com",
				`https://${authToken}github.com`,
			);
		}

		return await this.delegate.source(url, branch);
	}
}
