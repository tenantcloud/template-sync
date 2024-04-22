import { loadConfig, loadPluginsConfig } from "./config";
import { loadPlugin } from "./plugins/load-plugin";
import { RepositoryCloner } from "./repositories/cloning";
import { Repository } from "./repositories/repository";

export async function sync(
	sourceRoot: string,
	{
		repositoryCloner,
	}: {
		repositoryCloner: RepositoryCloner;
	},
): Promise<void> {
	const sourceConfig = await loadConfig(sourceRoot);
	const source = new Repository(sourceRoot);
	let reserved: string[] = ["template-sync.plugins.json"];

	for (const repositoryConfig of sourceConfig.repositories) {
		const template = await repositoryCloner.clone(
			repositoryConfig.url,
			repositoryConfig.branch,
		);

		const pluginsConfig = await loadPluginsConfig(template.root);

		for (const pluginConfig of pluginsConfig.plugins) {
			const plugin = await loadPlugin(pluginConfig, template.root);

			const { reserved: pluginReserved } = await plugin(
				template,
				source,
				reserved,
			);

			reserved = reserved.concat(...pluginReserved);
		}
	}
}
