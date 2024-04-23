import { jest } from "@jest/globals";

global.console = {
	...console,
	debug: jest.fn(),
};
