import { syncResultToReport } from "./result-to-report";

describe("syncResultToReport", () => {
	it("converts result to markdown string", () => {
		const report = syncResultToReport({
			repositories: [
				{ url: "https://github.com/first/repo", branch: "alpha" },
				{ url: "https://github.com/second/repo", branch: "master" },
			],
		});

		expect(report).toMatchSnapshot();
	});
});
