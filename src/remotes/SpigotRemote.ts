import { fetchTask } from "../lib/scheduled-fetch.js";
import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";
import { parse } from 'node-html-parser';

interface SpigotVersionLink {
	version: string;
	link: string;
}

export class SpigotRemote implements IJarSource {
	static readonly SPIGOT_DOWNLOAD_URL = "https://getbukkit.org/download/spigot";

	constructor(
		readonly stable_only: boolean = false,
	) { }

	async getDownloads(): Promise<SpigotVersionLink[]> {
		const rtn: SpigotVersionLink[] = [];
		const response = await fetchTask(SpigotRemote.SPIGOT_DOWNLOAD_URL);
		const text = await response.text();
		const document = parse(text);
		const versionBoxes = document.querySelectorAll('.download-pane');
		versionBoxes.forEach((box) => {
			const versionEl = box.querySelector('h2');
			const download = box.querySelector('.btn-download');
			if (versionEl && download) {
				const link = download.getAttribute('href');
				if (!link) return;
				const version = versionEl.text.trim();
				console.log(`SpigotRemote: Found version ${version} at ${link}`);
				rtn.push({ version, link });
			}
		});
		return rtn;
	}

	async getJarFromLink(link: SpigotVersionLink): Promise<IMinecraftJar|null> {
		const response = await fetchTask(link.link);
		const text = await response.text();
		const document = parse(text);
		const download = document.querySelector('.well a');
		if (!download) {
			return null;
		}
		const jarLink = download.getAttribute('href');
		if (!jarLink) {
			return null;
		}

		return {
			gameVersion: link.version,
			identifier: `spigot-${link.version}`,
			localPath: null,
			remoteUrl: jarLink,
			software: 'spigot',
			stable: true,
			title: `Spigot ${link.version}`,
		};
	}


	async listRemote(): Promise<IMinecraftJar[]> {
		const downloads = await this.getDownloads();
		const jars = await Promise.all(downloads.map(download => this.getJarFromLink(download)));
		return jars.filter(jar => jar !== null) as IMinecraftJar[];
	}
}
