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

interface IPurpurJar extends IMinecraftJar {
	purpurBuild: string;
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

	sortBuilds(a: string, b: string): number {
		const aInt = parseInt(a);
		const bInt = parseInt(b);
		return bInt - aInt;
	}

	async listRemote(): Promise<IMinecraftJar[]> {
		const project = await this.getProject("purpur");
		const versions = project.versions;
		const jars: IMinecraftJar[] = [];

		await asyncForeach(versions, async (versionId) => {
			const version = await this.getVersion("purpur", versionId);
			const latestBuildId = version.builds.latest;

			let thisVersionBestJar: IPurpurJar | undefined = undefined;

			await asyncForeach(version.builds.all.sort(this.sortBuilds), async (buildId) => {
				if (this.stable_only && thisVersionBestJar !== undefined && parseInt(thisVersionBestJar.purpurBuild) > parseInt(buildId)) {
					return;
				}

				const build = await this.getBuild("purpur", versionId, buildId);
				if (build.result !== "SUCCESS") {
					return;
				}

				const downloadUrl = `${PurpurRemote.PURPUR_API_URL}v2/purpur/${versionId}/${buildId}/download`;

				const jar = {
					identifier: `purpur-${versionId}-${buildId}`,
					localPath: null,
					remoteUrl: downloadUrl,
					stable: latestBuildId === buildId || this.stable_only,
					title: `Purpur ${versionId} build ${buildId}`,
					gameVersion: versionId,
					software: "purpur",
					purpurBuild: buildId,
				};

				if (this.stable_only && (thisVersionBestJar === undefined || parseInt(thisVersionBestJar.purpurBuild) < parseInt(buildId))) {
					thisVersionBestJar = jar;
				}
				else if (!this.stable_only) {
					jars.push(jar);
				}
			});

			if (thisVersionBestJar !== undefined && this.stable_only) {
				jars.push(thisVersionBestJar);
			}
		});

		return jars;
	}
}

export default PurpurRemote;
