import { loadSourceConfig, loadTemplateConfig, PluginConfig } from "./config";
import { loadPlugin } from "./plugins/load-plugin";
import { RepositorySourcer } from "./repositories/sourcing";
import { Repository } from "./repositories/repository";

export interface SyncResult {
	repositories: {
		url: string;
		branch: string;
	}[];
}

export class Syncer {
	constructor(private readonly repositorySourcer: RepositorySourcer) {}

	async sync(sourceRoot: string): Promise<SyncResult> {
		const source = new Repository(sourceRoot);
		const sourceConfig = await loadSourceConfig(
			source.path(await source.sourceConfigFileName()),
		);

		for (const repositoryConfig of sourceConfig.repositories) {
			console.debug(
				`Cloning template repository from ${repositoryConfig.url} at branch ${repositoryConfig.branch}`,
			);
			const templateRoot = await this.repositorySourcer.source(
				repositoryConfig.url,
				repositoryConfig.branch,
			);

			console.debug("Loading template config");
			const template = new Repository(templateRoot);
			const templateConfig = await loadTemplateConfig(
				template.path(await template.templateConfigFileName()),
			);

			console.debug("Running template plugins");
			await this.runPlugins(
				template,
				source,
				template.root,
				templateConfig.plugins,
			);

			console.debug("Running source plugins");
			await this.runPlugins(
				template,
				source,
				source.root,
				repositoryConfig.after.plugins,
			);
		}

		return {
			repositories: sourceConfig.repositories,
		};
	}

	private async runPlugins(
		template: Repository,
		source: Repository,
		root: string,
		pluginConfigs: PluginConfig[],
	) {
		let reserved: string[] = [];

		for (const pluginConfig of pluginConfigs) {
			const plugin = await loadPlugin(pluginConfig, root);

			console.debug(`Executing plugin ${pluginConfig.name}`);

			const { reserved: pluginReserved } = await plugin(
				template,
				source,
				reserved,
			);

			reserved = reserved.concat(...pluginReserved);
		}
	}
}
