import { fetchTask } from "../lib/scheduled-fetch.js";
import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";
import { asyncForeach } from "../utils/async-foreach.js";

interface FabricMinecraftVersion {
	version: string;
	stable: boolean;
}

interface FabricLoaderOptions {
	loader: FabricLoaderVerison;
	intermediary: FabricMinecraftVersion;
}

interface FabricLoaderVerison {
	build: number;
	maven: string;
	seperator: string;
	stable: boolean;
	version: string;
}

interface FabricInstallerVersion {
	url: string
	version: string;
	stable: boolean;
}

class FabricRemote implements IJarSource {

	static readonly FABRIC_API_URL = "https://meta.fabricmc.net/";

	async listMinecraftVersions(): Promise<FabricMinecraftVersion[]> {
		console.log("FabricRemote: Requesting game versions");
		const response = await fetchTask(FabricRemote.FABRIC_API_URL + "v2/versions/game");
		const versions = await response.json();
		return versions;
	}

	async listLoaderVersions(gameVersion: string): Promise<FabricLoaderOptions[]> {
		console.log("FabricRemote: Requesting Loader versions for game version " + gameVersion);
		const response = await fetchTask(FabricRemote.FABRIC_API_URL + "v2/versions/loader/" + gameVersion);
		const versions = await response.json();
		return versions;
	}

	async listInstallers(): Promise<FabricInstallerVersion[]> {
		console.log("FabricRemote: Requesting installers");
		const response = await fetchTask(FabricRemote.FABRIC_API_URL + "v2/versions/installer");
		const installers = await response.json();
		return installers;
	}

	public async listRemote(): Promise<IMinecraftJar[]> {
		console.log("FabricRemote: Fetchong remote Versions");
		const gameVersions = await this.listMinecraftVersions();
		const installers = await this.listInstallers();
		const stableInstaller = installers.find(installer => installer.stable);
		if (!stableInstaller) {
			throw new Error("FabricRemote: No stable installer found");
		}

		console.log(`FabricRemote: Using installer ${stableInstaller.version}`);

		const jars: IMinecraftJar[] = [];
		await asyncForeach(gameVersions, async (gameVersion) => {
			const loaders = await this.listLoaderVersions(gameVersion.version);

			await asyncForeach(loaders, async (loader) => {
				jars.push({
					identifier: "fabric-loader-" + gameVersion.version + "-" + loader.loader.version,
					remoteUrl: `${FabricRemote.FABRIC_API_URL}v2/versions/loader/${gameVersion.version}/${loader.loader.version}/${stableInstaller.version}/server/jar`,
					localPath: null,
					stable: loader.loader.stable && gameVersion.stable,
					title: `Fabric ${gameVersion.version} loader ${loader.loader.version}`,
				});
			});
		});
		return jars;
	}
}

export default FabricRemote;
