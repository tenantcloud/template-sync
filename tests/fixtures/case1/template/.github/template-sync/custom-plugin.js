import {writeFile} from "fs/promises";

export default (rawOptions) => async (template, source, reserved) => {
	await writeFile(source.path('custom-plugin.json'), JSON.stringify(reserved));

	return {
		reserved: [],
	};
};
