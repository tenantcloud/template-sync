import { default as syncPlugin } from "./sync";
import { default as composerPlugin } from "./composer";
import { PluginFactory } from "../plugin";

export const standardPlugins: { [name: string]: PluginFactory } = {
	sync: syncPlugin,
	composer: composerPlugin,
};
