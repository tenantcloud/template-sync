import { default as syncPlugin } from "./sync";
import { default as composerPlugin } from "./composer";
import { PluginFactory } from "../plugin";
import { default as templateSync } from "./template-sync";

export const standardPlugins: { [name: string]: PluginFactory } = {
	sync: syncPlugin,
	composer: composerPlugin,
	"template-sync": templateSync,
};
