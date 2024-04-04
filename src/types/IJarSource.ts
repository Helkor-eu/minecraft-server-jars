import { IMinecraftJar } from "./IMinecraftJar.js";

type ListRemoteJarRepositoryFunction = () => Promise<IMinecraftJar[]>;
export interface IJarSource {
	listRemote: ListRemoteJarRepositoryFunction;
}
