import { readFile, writeFile } from "fs/promises";
import { PathLike } from "node:fs";
import { join } from "path";
import { pathExists } from "fs-extra";

export async function readJson(path: PathLike): Promise<any> {
	return JSON.parse((await readFile(path)).toString());
}

export async function writeJson(path: PathLike, obj: any): Promise<void> {
	await writeFile(path, JSON.stringify(obj));
}

export async function firstExistingPath(
	root: string,
	possibleFileNames: string[],
): Promise<string> {
	for (const fileName of possibleFileNames) {
		const path = join(root, fileName);

		if (!(await pathExists(path))) {
			continue;
		}

		return fileName;
	}

	throw new Error(
		"Could not find file in these paths: " + possibleFileNames.join(", "),
	);
}
