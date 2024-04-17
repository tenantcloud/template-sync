import { some } from "micromatch";
import { join } from "path";
import { readdir } from "fs/promises";

export function invertMatchPatterns(patterns: string[]) {
	return patterns.map((pattern) => {
		if (pattern.startsWith("!")) {
			return pattern.slice(1);
		}
		return `!${pattern}`;
	});
}

/**
 * Gets all the files in the directory recursively while avoiding any micromatch patterns
 * that would match for ignoring
 */
export async function getAllFilesInDir(
	dir: string,
	ignorePatterns: string[],
): Promise<string[]> {
	return await recurseDirsForFiles(dir, ignorePatterns);
}

async function recurseDirsForFiles(
	dirpath: string,
	ignorePatterns: string[],
	relativeRoot = "",
): Promise<string[]> {
	let files: string[] = [];

	for (const f of await readdir(dirpath, {
		withFileTypes: true,
	})) {
		const relPath = join(relativeRoot, f.name);

		if (some(relPath, ignorePatterns)) {
			continue;
		}

		// Ensure we aren't ignoring these folders explicitly
		if (f.isDirectory()) {
			files.push(
				...(await recurseDirsForFiles(
					join(dirpath, f.name),
					ignorePatterns,
					relPath,
				)),
			);
		} else {
			files.push(relPath);
		}
	}

	return files;
}
