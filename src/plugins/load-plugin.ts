import { resolve } from "path";
import { pathExists } from "fs-extra";
import { Plugin, PluginFactory } from "./plugin";
import { standardPlugins } from "./standard/plugins";
import { PluginConfig } from "../config";

export async function loadPlugin(
	pluginConfig: PluginConfig,
	repositoryRoot: string,
): Promise<Plugin> {
	const { name, ...config } = pluginConfig;

	console.debug(
		`Loading plugin ${name} with configuration ${JSON.stringify(config)}`,
	);

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

	return (
		(await import(importPath)) as unknown as {
			default: PluginFactory;
		}
	).default;
}
