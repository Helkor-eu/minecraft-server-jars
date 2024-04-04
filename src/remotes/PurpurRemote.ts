import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";

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

	async getProject(projectName: string): Promise<PurpurProject> {
		console.log(`PurpurRemote: Listing project ${projectName}`);
		const response = await fetch(`${PurpurRemote.PURPUR_API_URL}v2/${projectName}`);
		const project = await response.json();
		return project;
	}

	async getVersion(projectName: string, version: string): Promise<PurpurVersion> {
		console.log(`PurpurRemote: Listing version ${version} for project ${projectName}`);
		const response = await fetch(`${PurpurRemote.PURPUR_API_URL}v2/${projectName}/${version}`);
		const project = await response.json();
		return project;
	}

	async getBuild(projectName: string, version: string, build: string): Promise<PuprurBuild> {
		console.log(`PurpurRemote: Listing build ${build} for version ${version} of project ${projectName}`);
		const response = await fetch(`${PurpurRemote.PURPUR_API_URL}v2/${projectName}/${version}/${build}`);
		const project = await response.json();
		return project;
	}

	async listRemote(): Promise<IMinecraftJar[]> {
		const project = await this.getProject("purpur");
		const versions = project.versions;
		const jars: IMinecraftJar[] = [];

		for (const versionId of versions) {
			const version = await this.getVersion("purpur", versionId);
			const latestBuildId = version.builds.latest;
			const latestBuild = await this.getBuild("purpur", versionId, latestBuildId);
			let bestBuild: string | undefined = latestBuildId;

			if (latestBuild.result !== "SUCCESS") {
				const allBuildsSorted = version.builds.all.sort((a, b) => {
					const buildA = parseInt(a);
					const buildB = parseInt(b);
					return buildB - buildA;
				});
				while (true) {
					const buildId = allBuildsSorted.pop();
					if (!buildId) {
						bestBuild = undefined;
						break;
					}
					const build = await this.getBuild("purpur", versionId, buildId);
					if (build.result === "SUCCESS") {
						bestBuild = buildId;
						break;
					}
				}
			}

			if (!bestBuild) {
				continue;
			}

			const downloadUrl = `${PurpurRemote.PURPUR_API_URL}v2/purpur/${versionId}/${bestBuild}/download`;

			jars.push({
				identifier: `purpur-${versionId}-${bestBuild}`,
				localPath: null,
				remoteUrl: downloadUrl,
				stable: true,
				title: `Purpur ${versionId} build ${bestBuild}`,
			});


		}

		return jars;
	}
}

export default PurpurRemote;
