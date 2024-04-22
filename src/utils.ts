import { readFile, writeFile } from "fs/promises";
import { PathLike } from "node:fs";

export async function readJson(path: PathLike): Promise<any> {
	return JSON.parse((await readFile(path)).toString());
}

export async function writeJson(path: PathLike, obj: any): Promise<void> {
	await writeFile(path, JSON.stringify(obj));
}
