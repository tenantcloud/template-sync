import { pathExists } from "fs-extra";
import { mkdtemp, readFile, rm } from "fs/promises";
import { join, resolve, dirname } from "path";
import { RepositoryCloner } from "../src/repositories/cloning";
import { sync } from "../src/sync";
import { tmpdir } from "os";
import { fileURLToPath } from "node:url";
import { cp } from "node:fs/promises";
import { Repository } from "../src/repositories/repository";
import { glob } from "../src/glob";

class FixtureRepositoryCloner implements RepositoryCloner {
	constructor(private readonly root: string) {}

	async clone(url: string): Promise<Repository> {
		return new Repository(join(this.root, url));
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

	it.each(["case1"])("syncs from template", async (path) => {
		const __dirname = dirname(fileURLToPath(import.meta.url));
		const caseRoot = resolve(__dirname, "fixtures", path);
		const expectedRoot = join(caseRoot, "expected");

		await cp(join(caseRoot, "source"), copyRoot, { recursive: true });

		await sync(copyRoot, {
			repositoryCloner: new FixtureRepositoryCloner(caseRoot),
		});

		const expectedFiles = await glob("**/*", expectedRoot);

		expect(await glob("**/*", copyRoot)).toEqual(expectedFiles);

		for (const file of expectedFiles) {
			const copyFilePath = join(copyRoot, file);

			expect(await pathExists(copyFilePath)).toBeTruthy();
			expect((await readFile(copyFilePath)).toString().trim()).toEqual(
				(await readFile(join(expectedRoot, file))).toString().trim(),
			);
		}
	});
});
