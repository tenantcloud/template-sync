import { resolve } from "path";
import { pathExists } from "fs-extra";
import { Plugin, PluginFactory } from "./plugin";
import { standardPlugins } from "./standard/plugins";
import { PluginConfig } from "../config";

export async function loadPlugin(
	pluginConfig: PluginConfig,
	repositoryRoot: string,
): Promise<Plugin> {
	if (typeof pluginConfig === "string") {
		pluginConfig = {
			name: pluginConfig,
		};
	}

	const { name, ...config } = pluginConfig;

	const pluginFactory = await loadPluginFactory(name, repositoryRoot);

	return pluginFactory(config);
}

async function loadPluginFactory(
	name: string,
	repositoryRoot: string,
): Promise<PluginFactory> {
	const standardPlugin = standardPlugins[name] || null;

	if (standardPlugin) {
		return standardPlugin;
	}

	// First check if this is a local .js file
	const localPath = resolve(repositoryRoot, name);
	const importPath = (await pathExists(localPath)) ? localPath : name;

	// Sad workaround for testing since dynamic import segfaults
	if (process.env.JEST_WORKER_ID !== undefined) {
		/* eslint-disable @typescript-eslint/no-var-requires */
		return (
			require(importPath) as unknown as {
				default: PluginFactory;
			}
		).default;
		/* eslint-enable @typescript-eslint/no-var-requires */
	} else {
		return (
			(await import(importPath)) as unknown as {
				default: PluginFactory;
			}
		).default;
	}
}
