export interface IMinecraftJar {
	title: string;
	identifier: string;
	software: string;
	gameVersion: string;

	remoteUrl: string;
	localPath: string | null;

	stable: boolean;
}
