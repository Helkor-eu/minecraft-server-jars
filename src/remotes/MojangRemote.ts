import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";

enum MojangMinecraftReleaseType {
	RELEASE = "release",
	SNAPSHOT = "snapshot",

}

enum MojangMinecraftSoftwareType {
	CLIENT = "client",
	CLIENT_MAPPINGS = "client_mappings",
	SERVER = "server",
	SERVER_MAPPINGS = "server_mappings",
}

interface MojangMinecraftVersionManifest {
	latest: Record<MojangMinecraftReleaseType, string>;
	versions: MojangMinecraftVersion[];
}


interface MojangMinecraftPackageDetails {
	id: string;
	type: MojangMinecraftReleaseType;
	complianceLevel: number;
	minimumLauncherVersion: number;
	downloads: Record<MojangMinecraftSoftwareType, MojangMinecraftPackageDownload>;
	releaseTime: string;
	time: string;
}


interface MojangMinecraftPackageDownload {
	sha1: string;
	size: number;
	url: string;
}

interface MojangMinecraftVersion {
	id: string;
	type: "release" | "snapshot";
	url: string;
	time: string;
	releaseTime: string;
}

class MojangRemote implements IJarSource {

	static readonly MOJANG_VERSION_ENDPOINT_URL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

	async listMinecraftVersions(): Promise<MojangMinecraftVersionManifest> {
		console.log("MojangRemote: Fetching version manifest");
		const response = await fetch(MojangRemote.MOJANG_VERSION_ENDPOINT_URL);
		const manifest = await response.json();
		return manifest;
	}

	async getVersionDetails(version: MojangMinecraftVersion): Promise<MojangMinecraftPackageDetails> {
		console.log(`MojangRemote: Fetching version details for ${version.id}`);
		const response = await fetch(version.url);
		const details = await response.json();
		return details;
	}

	public async listRemote(): Promise<IMinecraftJar[]> {
		const minecraftVersions = await this.listMinecraftVersions();
		const jars: IMinecraftJar[] = [];

		for (const version of minecraftVersions.versions) {
			if (version.type !== MojangMinecraftReleaseType.RELEASE) {
				continue;
			}
			const details = await this.getVersionDetails(version);
			if (!details.downloads.server) {
				continue;
			}

			jars.push({
				identifier: `minecraft-server-${version.id}`,
				localPath: null,
				remoteUrl: details.downloads.server.url,
				title: `Minecraft Server ${version.id}`,
				stable: version.type === MojangMinecraftReleaseType.RELEASE,
			});
		}

		return jars;
	}
}

export default MojangRemote;
