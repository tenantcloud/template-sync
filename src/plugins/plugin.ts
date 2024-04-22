import { Repository } from "../repositories/repository";

export interface PluginResult {
	reserved: string[];
}
export type Plugin = (
	template: Repository,
	source: Repository,
	reserved: string[],
) => Promise<PluginResult>;
export type PluginFactory = (rawOptions: object) => Plugin;
