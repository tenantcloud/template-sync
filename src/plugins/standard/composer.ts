import { z } from "zod";
import { PluginFactory } from "../plugin";
import { readJson, writeJson } from "../../utils";

const optionsSchema = z.strictObject({});

export default ((rawOptions) => {
	optionsSchema.parse(rawOptions);

	return async function (template, source) {
		const templateComposerJson = await readJson(
			template.path("composer.json"),
		);
		const sourceComposerJson = await readJson(source.path("composer.json"));

		await writeJson(source.path("composer.json"), {
			...sourceComposerJson,
			require: {
				...sourceComposerJson["require"],
				...templateComposerJson["require"],
			},
			"require-dev": {
				...sourceComposerJson["require-dev"],
				...templateComposerJson["require-dev"],
			},
			scripts: {
				...sourceComposerJson["scripts"],
				...templateComposerJson["scripts"],
			},
		});

		return {
			reserved: ["composer.json"],
		};
	};
}) satisfies PluginFactory;
