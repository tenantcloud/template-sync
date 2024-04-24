import { pathExists } from "fs-extra";
import { mkdtemp, readFile, rm } from "fs/promises";
import { join, resolve, dirname } from "path";
import { RepositorySourcer } from "../src/repositories/sourcing";
import { Syncer } from "../src/sync";
import { tmpdir } from "os";
import { fileURLToPath } from "node:url";
import { cp } from "node:fs/promises";
import { glob } from "../src/glob";

class FixtureRepositorySourcer implements RepositorySourcer {
	constructor(private readonly root: string) {}

	async source(url: string): Promise<string> {
		return join(this.root, url);
	}
}

describe("syncs from template", () => {
	let copyRoot: string;
	beforeEach(async () => {
		copyRoot = await mkdtemp(process.env.RUNNER_TEMP ?? tmpdir());
	});
	afterEach(async () => {
		await rm(copyRoot, {
			force: true,
			recursive: true,
		});
	});

	const parseFile = (contents: string, fileName: string): any => {
		if (fileName.endsWith(".json")) {
			return JSON.parse(contents);
		}

		return contents.trim();
	};

	it.each(["case1"])("syncs from template", async (path) => {
		const __dirname = dirname(fileURLToPath(import.meta.url));
		const caseRoot = resolve(__dirname, "fixtures", path);
		const expectedRoot = join(caseRoot, "expected");

		await cp(join(caseRoot, "source"), copyRoot, { recursive: true });

		await new Syncer(new FixtureRepositorySourcer(caseRoot)).sync(copyRoot);

		const expectedFiles = await glob("**/*", expectedRoot);
		const copyFiles = await glob("**/*", copyRoot);

		expect(copyFiles.sort()).toEqual(expectedFiles.sort());

		for (const file of expectedFiles) {
			const copyFilePath = join(copyRoot, file);

			expect(await pathExists(copyFilePath)).toBeTruthy();
			expect(
				parseFile((await readFile(copyFilePath)).toString(), file),
			).toEqual(
				parseFile(
					(await readFile(join(expectedRoot, file))).toString(),
					file,
				),
			);
		}
	});
});
