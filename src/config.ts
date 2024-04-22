import { z } from "zod";
import { join } from "path";
import { readJson } from "./utils";

const configSchema = z.strictObject({
	repositories: z
		.array(
			z.strictObject({
				url: z.string().min(1),
				branch: z.string().min(1),

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
			}),
		)
		.min(1),
});

export async function loadConfig(root: string): Promise<Config> {
	const rawConfig = await readJson(join(root, "template-sync.json"));

	return configSchema.parse(rawConfig);
}

export type Config = z.infer<typeof configSchema>;
export type PluginConfig =
	| string
	| {
			name: string;
			[option: string]: any;
	  };
