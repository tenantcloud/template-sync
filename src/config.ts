import { z } from "zod";
import { join } from "path";
import { readJson } from "./utils";
import { pathExists } from "fs-extra";

const sourceConfigSchema = z.strictObject({
	repositories: z
		.array(
			z.strictObject({
				url: z.string().min(1),
				branch: z.string().min(1),
			}),
		)
		.min(1),
});

const templateConfigSchema = z.strictObject({
	plugins: z
		.array(
			z.union([
				z.string().min(1),
				z
					.object({
						name: z.string().min(1),
					})
					.passthrough(),
			]),
		)
		.min(1),
});

const SOURCE_CONFIG_FILE_NAME = "template-sync.json";
const POSSIBLE_SOURCE_CONFIG_FILE_NAMES = [
	SOURCE_CONFIG_FILE_NAME,
	".github/" + SOURCE_CONFIG_FILE_NAME,
];
export async function loadSourceConfig(root: string): Promise<SourceConfig> {
	const rawConfig = await loadConfigFromPossible(
		root,
		POSSIBLE_SOURCE_CONFIG_FILE_NAMES,
	);

	return sourceConfigSchema.parse(rawConfig);
}

const TEMPLATE_CONFIG_FILE_NAME = "template-sync.template.json";
export const POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES = [
	TEMPLATE_CONFIG_FILE_NAME,
	".github/" + TEMPLATE_CONFIG_FILE_NAME,
];
export async function loadTemplateConfig(
	root: string,
): Promise<TemplateConfig> {
	const rawConfig = await loadConfigFromPossible(
		root,
		POSSIBLE_TEMPLATE_CONFIG_FILE_NAMES,
	);

	return templateConfigSchema.parse(rawConfig);
}

async function loadConfigFromPossible(
	root: string,
	possibleFileNames: string[],
): Promise<any> {
	for (const fileName of possibleFileNames) {
		const path = join(root, fileName);

		if (!(await pathExists(path))) {
			continue;
		}

		return await readJson(path);
	}

	throw new Error("Could not find config");
}

export type SourceConfig = z.infer<typeof sourceConfigSchema>;
export type TemplateConfig = z.infer<typeof templateConfigSchema>;
export type PluginConfig = z.infer<typeof templateConfigSchema>["plugins"][0];
