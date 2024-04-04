import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";

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


	async getProject(projectName: string): Promise<PaperProject> {
		console.log(`PaperRemote: Listing project ${projectName}`);
		const response = await fetch(PaperRemote.PAPER_API_URL + "v2/projects/" + projectName);
		const project = await response.json();
		return project;
	}

	async getVersion(projectName: string, version: string): Promise<PaperVersion> {
		console.log(`PaperRemote: Listing version ${version} for project ${projectName}`);
		const response = await fetch(PaperRemote.PAPER_API_URL + "v2/projects/" + projectName + "/versions/" + version);
		const project = await response.json();
		return project;
	}

	async getBuild(projectName: string, version: string, build: number): Promise<PaperBuild> {
		console.log(`PaperRemote: Listing build ${build} for version ${version} of project ${projectName}`);
		const response = await fetch(PaperRemote.PAPER_API_URL + "v2/projects/" + projectName + "/versions/" + version + "/builds/" + build);
		const project = await response.json();
		return project;
	}


	async listRemote(): Promise<IMinecraftJar[]> {
		const jars: IMinecraftJar[] = [];
		const versions = await this.getProject('paper');

		for (const versionId of versions.versions) {
			const version = await this.getVersion('paper', versionId);
			const builds = version.builds;
			const latestBuild = builds[builds.length - 1];
			const build = await this.getBuild('paper', versionId, latestBuild);
			const url = `https://api.papermc.io/v2/projects/paper/versions/${versionId}/builds/${latestBuild}/downloads/${build.downloads.application.name}`;
			const jar: IMinecraftJar = {
				identifier: 'paper-' + versionId + '-' + latestBuild,
				title: 'Paper ' + versionId + ' Build ' + latestBuild,
				remoteUrl: url,
				localPath: null,
				stable: build.channel === 'default'
			};
			jars.push(jar);
		}

		return jars;
	}
}

export default PaperRemote;
