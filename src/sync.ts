import {
	loadSourceConfig,
	loadTemplateConfig,
	POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES,
	SourceConfig,
} from "./config";
import { loadPlugin } from "./plugins/load-plugin";
import { RepositoryCloner } from "./repositories/cloning";
import { Repository } from "./repositories/repository";

export interface SyncResult {
	repositories: SourceConfig["repositories"];
}

export async function sync(
	sourceRoot: string,
	{
		repositoryCloner,
	}: {
		repositoryCloner: RepositoryCloner;
	},
): Promise<SyncResult> {
	const sourceConfig = await loadSourceConfig(sourceRoot);
	const source = new Repository(sourceRoot);
	let reserved: string[] = [...POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES];

	for (const repositoryConfig of sourceConfig.repositories) {
		console.debug(
			`Cloning template repository from ${repositoryConfig.url} at branch ${repositoryConfig.branch}`,
		);

		const template = await repositoryCloner.clone(
			repositoryConfig.url,
			repositoryConfig.branch,
		);

		console.debug("Loading template config");

		const templateConfig = await loadTemplateConfig(template.root);

		for (const pluginConfig of templateConfig.plugins) {
			const plugin = await loadPlugin(pluginConfig, template.root);

			console.debug(`Executing plugin ${pluginConfig.name}`);

			const { reserved: pluginReserved } = await plugin(
				template,
				source,
				reserved,
			);

			reserved = reserved.concat(...pluginReserved);
		}
	}

	return {
		repositories: sourceConfig.repositories,
	};
}
