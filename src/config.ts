import { z } from "zod";
import { readJson } from "./utils";

const pluginsSchema = z.array(
	z
		.union([
			z.string().min(1),
			z
				.object({
					name: z.string().min(1),
				})
				.passthrough(),
		])
		.transform((value) => {
			if (typeof value === "string") {
				value = {
					name: value,
				};
			}

			return value;
		}),
);

const sourceConfigSchema = z.strictObject({
	repositories: z
		.array(
			z.strictObject({
				url: z.string().min(1),
				branch: z.string().min(1),

				after: z
					.strictObject({
						plugins: pluginsSchema,
					})
					.default({
						plugins: [],
					}),
			}),
		)
		.min(1),
});

const templateConfigSchema = z.strictObject({
	plugins: pluginsSchema.min(1),
});

export async function loadSourceConfig(path: string): Promise<SourceConfig> {
	console.debug(`Loading source config from ${path}`);

	return sourceConfigSchema.parse(await readJson(path));
}

export async function loadTemplateConfig(
	path: string,
): Promise<TemplateConfig> {
	console.debug(`Loading template config from ${path}`);

	return templateConfigSchema.parse(await readJson(path));
}

export type SourceConfig = z.infer<typeof sourceConfigSchema>;
export type TemplateConfig = z.infer<typeof templateConfigSchema>;
export type PluginConfig = z.infer<typeof templateConfigSchema>["plugins"][0];
