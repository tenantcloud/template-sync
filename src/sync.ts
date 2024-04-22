import { Repository} from "./repositories/repository";
import {tmpdir} from "os";
import {loadConfig} from "./config";
import {loadPlugin} from "./plugins/load-plugin";
import {GitHubRepositoryCloner, GitRepositoryCloner, RepositoryCloner} from "./repositories/cloning";
import simpleGit from "simple-git";

export async function sync(options: {
	cwd?: string;
	tmpDir?: string;
	repositoryCloner: RepositoryCloner;
}): Promise<void> {
	const cwd = options.cwd || process.cwd();
	const tmpDir = options.tmpDir || tmpdir();
	const repositoryCloner = options.repositoryCloner;
	const config = await loadConfig(cwd);

	const source = new Repository(cwd);

	for (const repositoryConfig of config.repositories) {
		const template = await repositoryCloner.clone(
			repositoryConfig.url,
			repositoryConfig.branch,
		);
		let reserved: string[] = [];

		for (const pluginConfig of repositoryConfig.plugins) {
			const plugin = await loadPlugin(pluginConfig, template.root);

			const { reserved: pluginReserved } = await plugin(template, source, reserved);

			reserved = reserved.concat(...pluginReserved);
		}
	}
}
