import { z } from "zod";
import { PluginFactory } from "../plugin";
import { copyFile, unlink } from "fs/promises";
import * as R from "remeda";
import { ensureDir } from "fs-extra";
import { dirname } from "path";

const optionsSchema = z.strictObject({
	filter: z.array(z.string()).default(["**/*"]),
	deleteExtra: z.boolean().default(true),
});

export default ((rawOptions) => {
	const options = optionsSchema.parse(rawOptions);

	return async function (template, source, reserved) {
		const templateFiles = await template.files(options.filter, reserved);

		console.debug(`Files from the template: ${templateFiles.join(", ")}`);

		for (const file of templateFiles) {
			await ensureDir(dirname(source.path(file)));
			await copyFile(template.path(file), source.path(file));
		}

		if (options.deleteExtra) {
			const sourceFiles = await source.files(options.filter, reserved);

			console.debug(`Files from the source: ${sourceFiles.join(", ")}`);

			const extraFiles = R.difference.multiset(
				sourceFiles,
				templateFiles,
			);

			console.debug(
				`Deleting extra non-matching files: ${extraFiles.join(", ")}`,
			);

			for (const file of extraFiles) {
				await unlink(source.path(file));
			}
		}

		return {
			reserved: [],
		};
	};
}) satisfies PluginFactory;
