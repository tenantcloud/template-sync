import { z } from "zod";
import { PluginFactory } from "../plugin";
import { readJson, writeJson } from "../../utils";
import * as R from "remeda";

const optionsSchema = z.strictObject({});

export default ((rawOptions) => {
	optionsSchema.parse(rawOptions);

	return async function (template, source) {
		const templateComposerJson = await readJson(
			template.path("composer.json"),
		);
		const sourceComposerJson = await readJson(source.path("composer.json"));

		const prepareRequire = (require: Record<string, string>) => {
			if (!sourceComposerJson.name) {
				return require;
			}

			return R.omit(require, [sourceComposerJson.name]);
		};

		await writeJson(source.path("composer.json"), {
			...sourceComposerJson,
			require: prepareRequire({
				...sourceComposerJson["require"],
				...templateComposerJson["require"],
			}),
			"require-dev": prepareRequire({
				...sourceComposerJson["require-dev"],
				...templateComposerJson["require-dev"],
			}),
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
