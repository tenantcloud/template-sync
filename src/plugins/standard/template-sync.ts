import { z } from "zod";
import { PluginFactory } from "../plugin";
import { readJson, writeJson } from "../../utils";
import { SourceConfig } from "../../config";
import * as R from "remeda";

const optionsSchema = z.strictObject({});

export default ((rawOptions) => {
	optionsSchema.parse(rawOptions);

	const buildRepositories = (
		templateRepositories: SourceConfig["repositories"],
		sourceRepositories: SourceConfig["repositories"],
	): SourceConfig["repositories"] => {
		const result = R.mapToObj(templateRepositories, (r) => [r.url, r]);

		for (const sourceRepository of sourceRepositories) {
			const templateRepository = R.pick(
				result[sourceRepository.url] ?? {},
				["branch"],
			);

			// Add all the repositories from source, but make sure to use the branch from the template.
			result[sourceRepository.url] = {
				...sourceRepository,
				...templateRepository,
			};
		}

		return Object.values(result);
	};

	return async function (template, source) {
		const sourceConfigFileName = await source.sourceConfigFileName();

		if (sourceConfigFileName !== (await template.sourceConfigFileName())) {
			throw new Error(
				`Config file locations must match between source and template. Expected config at: ${sourceConfigFileName}`,
			);
		}

		const templateSourceConfigJson: SourceConfig = await readJson(
			template.path(sourceConfigFileName),
		);
		const sourceConfigJson: SourceConfig = await readJson(
			source.path(sourceConfigFileName),
		);

		await writeJson(source.path(sourceConfigFileName), {
			...sourceConfigJson,
			repositories: buildRepositories(
				templateSourceConfigJson.repositories,
				sourceConfigJson.repositories,
			),
		});

		return {
			reserved: [sourceConfigFileName],
		};
	};
}) satisfies PluginFactory;
