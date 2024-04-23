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

		for (const file of templateFiles) {
			await ensureDir(dirname(source.path(file)));
			await copyFile(template.path(file), source.path(file));
		}

		if (options.deleteExtra) {
			const sourceFiles = await source.files(options.filter, reserved);

			for (const file of R.difference.multiset(
				sourceFiles,
				templateFiles,
			)) {
				await unlink(source.path(file));
			}
		}

		return {
			reserved: [],
		};
	};
}) satisfies PluginFactory;
