import * as R from "remeda";
import { globby } from "globby";

export async function glob(
	patterns: string | string[],
	root: string,
	ignore: string[] = [],
): Promise<string[]> {
	if (typeof patterns === "string") {
		patterns = [patterns];
	}

	return R.difference.multiset(
		await globby([...patterns, "!.git/**/*"], { cwd: root, dot: true }),
		ignore,
	);
}
