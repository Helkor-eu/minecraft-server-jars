import { fetchTask } from "../lib/scheduled-fetch.js";
import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";
import { asyncForeach } from "../utils/async-foreach.js";

interface PurpurProject {
	project: string;
	versions: string[];
}

interface PurpurVersion {
	project: string;
	version: string;
	builds: {
		latest: string;
		all: string[];
	}
}

interface PuprurBuild {
	project: string;
	version: string;
	build: string;
	result: string;
	timestamp: number;
	duration: number;
	md5: string;
}

class PurpurRemote implements IJarSource {
	static readonly PURPUR_API_URL = "https://api.purpurmc.org/";

	constructor(
		readonly stable_only: boolean = false,
	) { }

	async getProject(projectName: string): Promise<PurpurProject> {
		console.log(`PurpurRemote: Requesting project ${projectName}`);
		const response = await fetchTask(`${PurpurRemote.PURPUR_API_URL}v2/${projectName}`);
		const project = await response.json();
		return project;
	}

	async getVersion(projectName: string, version: string): Promise<PurpurVersion> {
		console.log(`PurpurRemote: Requesting version ${version} for project ${projectName}`);
		const response = await fetchTask(`${PurpurRemote.PURPUR_API_URL}v2/${projectName}/${version}`);
		const project = await response.json();
		return project;
	}

	async getBuild(projectName: string, version: string, build: string): Promise<PuprurBuild> {
		console.log(`PurpurRemote: Requesting build ${build} for version ${version} of project ${projectName}`);
		const response = await fetchTask(`${PurpurRemote.PURPUR_API_URL}v2/${projectName}/${version}/${build}`);
		const project = await response.json();
		return project;
	}

	async listRemote(): Promise<IMinecraftJar[]> {
		const project = await this.getProject("purpur");
		const versions = project.versions;
		const jars: IMinecraftJar[] = [];

		await asyncForeach(versions, async (versionId) => {
			const version = await this.getVersion("purpur", versionId);
			const latestBuildId = version.builds.latest;

			if (this.stable_only) {
				version.builds.all = [latestBuildId];
			}

			await asyncForeach(version.builds.all, async (buildId) => {
				const build = await this.getBuild("purpur", versionId, buildId);
				if (build.result !== "SUCCESS") {
					return;
				}

				const downloadUrl = `${PurpurRemote.PURPUR_API_URL}v2/purpur/${versionId}/${buildId}/download`;

				jars.push({
					identifier: `purpur-${versionId}-${buildId}`,
					localPath: null,
					remoteUrl: downloadUrl,
					stable: latestBuildId === buildId,
					title: `Purpur ${versionId} build ${buildId}`,
					gameVersion: versionId,
					software: "purpur",
				});
			});
		});

		return jars;
	}
}

export default PurpurRemote;
