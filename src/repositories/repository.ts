import { join } from "path";
import { glob } from "../glob";

export class Repository {
	constructor(public readonly root: string) {}

	path(relative: string): string {
		return join(this.root, relative);
	}

	async files(
		patterns: string[] = ["**/*"],
		ignore: string[] = [],
	): Promise<string[]> {
		return await glob(patterns, this.root, ignore);
	}
}
