import * as R from "remeda";
import { globby } from "globby";

export async function glob(
	patterns: string | readonly string[],
	root: string,
	ignore: string[] = [],
): Promise<string[]> {
	return R.difference.multiset(
		await globby(patterns, { cwd: root, dot: true }),
		ignore,
	);
}
