import { fetchTask } from "../lib/scheduled-fetch.js";
import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";
import { asyncForeach } from "../utils/async-foreach.js";

interface PaperProject {
	project_id: string;
	project_name: string;
	version_groups: string[];
	versions: string[];
}

interface PaperVersion {
	project_id: string;
	project_name: string;
	version: string;
	builds: number[];
}

interface PaperBuild {
	project_id: string;
	project_name: string;
	version: string;
	build: number;
	time: string;
	channel: string;
	promoted: boolean;
	changes: PaperChangelog[];
	downloads: {
		application: {
			name: string;
			sha256: string;
		}
	}
}

interface PaperChangelog {
	commit: string;
	summary: string;
	message: string;
}

class PaperRemote implements IJarSource {
	static readonly PAPER_API_URL = "https://api.papermc.io/";

	constructor(
		readonly stable_only: boolean = false,
	) { }

	async getProject(projectName: string): Promise<PaperProject> {
		console.log(`PaperRemote: Requesting project ${projectName}`);
		const response = await fetchTask(PaperRemote.PAPER_API_URL + "v2/projects/" + projectName);
		const project = await response.json();
		return project;
	}

	async getVersion(projectName: string, version: string): Promise<PaperVersion> {
		console.log(`PaperRemote: Requesting version ${version} for project ${projectName}`);
		const response = await fetchTask(PaperRemote.PAPER_API_URL + "v2/projects/" + projectName + "/versions/" + version);
		const project = await response.json();
		return project;
	}

	async getBuild(projectName: string, version: string, build: number): Promise<PaperBuild> {
		console.log(`PaperRemote: Requesting build ${build} for version ${version} of project ${projectName}`);
		const response = await fetchTask(PaperRemote.PAPER_API_URL + "v2/projects/" + projectName + "/versions/" + version + "/builds/" + build);
		const project = await response.json();
		return project;
	}


	async listRemote(): Promise<IMinecraftJar[]> {
		const jars: IMinecraftJar[] = [];
		const versions = await this.getProject('paper');
		await asyncForeach(versions.versions, async (versionId) => {
			const version = await this.getVersion('paper', versionId);
			const builds = version.builds;
			const latestBuildId = builds.reduce((a, b) => Math.max(a, b), 0);


			await asyncForeach(builds, async (buildId) => {
				if (this.stable_only && latestBuildId !== buildId) {
					return;
				}
				const build = await this.getBuild('paper', versionId, buildId);

				const url = `https://api.papermc.io/v2/projects/paper/versions/${versionId}/builds/${buildId}/downloads/${build.downloads.application.name}`;
				const jar: IMinecraftJar = {
					identifier: 'paper-' + versionId + '-' + buildId,
					title: 'Paper ' + versionId + ' Build ' + buildId,
					remoteUrl: url,
					localPath: null,
					stable: build.channel === 'default',
					gameVersion: versionId,
					software: 'paper',
				};
				jars.push(jar);
			});
		});

		return jars;
	}
}

export default PaperRemote;
