import { join } from "path";
import { glob } from "../glob";
import { firstExistingPath } from "../utils";

const SOURCE_CONFIG_FILE_NAME = "template-sync.json";
const POSSIBLE_SOURCE_CONFIG_FILE_NAMES = [
	SOURCE_CONFIG_FILE_NAME,
	".github/" + SOURCE_CONFIG_FILE_NAME,
];
const TEMPLATE_CONFIG_FILE_NAME = "template-sync.template.json";
const POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES = [
	TEMPLATE_CONFIG_FILE_NAME,
	".github/" + TEMPLATE_CONFIG_FILE_NAME,
];

export class Repository {
	constructor(public readonly root: string) {}

	path(relative: string): string {
		return join(this.root, relative);
	}

	async files(
		patterns: string[] = ["**/*"],
		ignore: string[] = [],
	): Promise<string[]> {
		return await glob(patterns, this.root, [
			...ignore,
			...POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES,
		]);
	}

	async sourceConfigFileName(): Promise<string> {
		return await firstExistingPath(
			this.root,
			POSSIBLE_SOURCE_CONFIG_FILE_NAMES,
		);
	}

	async templateConfigFileName(): Promise<string> {
		return await firstExistingPath(
			this.root,
			POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES,
		);
	}
}
