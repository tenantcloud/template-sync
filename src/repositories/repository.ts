import {globby} from "globby";
import {join} from "path";
import * as R from "remeda";

export class Repository {
	constructor(
		public readonly root: string,
	) {
	}

	path(relative: string): string {
		return join(this.root, relative);
	}

	async files(patterns: string[] = ['**/*'], ignore: string[] = []): Promise<string[]> {
		return R.difference.multiset(
			await globby(patterns, { cwd: this.root }),
			ignore,
		);
	}
}
