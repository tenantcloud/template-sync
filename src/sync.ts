import {
	loadSourceConfig,
	loadTemplateConfig,
	POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES,
} from "./config";
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
	const sourceConfig = await loadSourceConfig(sourceRoot);
	const source = new Repository(sourceRoot);
	let reserved: string[] = [...POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES];

	for (const repositoryConfig of sourceConfig.repositories) {
		const template = await repositoryCloner.clone(
			repositoryConfig.url,
			repositoryConfig.branch,
		);

		const templateConfig = await loadTemplateConfig(template.root);

		for (const pluginConfig of templateConfig.plugins) {
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
