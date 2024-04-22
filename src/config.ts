import { z } from "zod";
import { join } from "path";
import { readJson } from "./utils";

const configSchema = z.strictObject({
	repositories: z
		.array(
			z.strictObject({
				url: z.string().min(1),
				branch: z.string().min(1),
			}),
		)
		.min(1),
});

const pluginsConfigSchema = z.strictObject({
	plugins: z
		.array(
			z.union([
				z.string().min(1),
				z.object({
					name: z.string().min(1),
				}),
			]),
		)
		.min(1),
});

export async function loadConfig(root: string): Promise<Config> {
	const rawConfig = await readJson(join(root, "template-sync.json"));

	return configSchema.parse(rawConfig);
}

export async function loadPluginsConfig(root: string): Promise<PluginsConfig> {
	const rawConfig = await readJson(join(root, "template-sync.plugins.json"));

	return pluginsConfigSchema.parse(rawConfig);
}

export type Config = z.infer<typeof configSchema>;
export type PluginsConfig = z.infer<typeof pluginsConfigSchema>;
export type PluginConfig = z.infer<typeof pluginsConfigSchema>["plugins"][0];
