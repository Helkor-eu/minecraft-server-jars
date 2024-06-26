import { IMinecraftJar } from "../types/IMinecraftJar.js";
import https from "https";
import fs from "fs";

export function pathFromJar(jar: IMinecraftJar): string {
	//return `public/jars/${jar.software}/${jar.gameVersion}/${jar.identifier}.jar`;
	return `public/jars/${jar.identifier}.jar`;
}

export function getAllJarFiles(): string[] {
	return fs.readdirSync("public/jars").filter((file) => file.endsWith(".jar"));
}

function getDownloadPolicy(): string {
	return process.env.DOWNLOAD ?? 'STABLE';
}

function isDownloadsEnabled(): boolean {
	return ['ALL', 'STABLE'].includes(getDownloadPolicy());
}

export function deleteJarFile(file: string): void {
	fs.unlinkSync("public/jars/" + file);
}

export function isJarDownloaded(jar: IMinecraftJar): boolean {
	return fs.existsSync(pathFromJar(jar)) && !fs.existsSync(pathFromJar(jar) + ".unfinished");
}

export function shouldBeDownloaded(jar: IMinecraftJar): boolean {
	if (!isDownloadsEnabled()) {
		return false;
	}

	const downloadPolicy = getDownloadPolicy();
	if (!jar.stable && downloadPolicy === 'STABLE') {
		return false;
	}
	return true;
}

type Logger = (message: string) => void;
export async function downloadJar(jar: IMinecraftJar, logger: Logger = console.log): Promise<void> {

	if (!isDownloadsEnabled()) {
		logger("Download is disabled by env");
		return;
	}

	return new Promise((resolve, reject) => {
		if (!shouldBeDownloaded(jar)) {
			logger("Skipping " + jar.identifier + " as it is not marked for download");
			resolve();
			return;
		}


		const destionation = pathFromJar(jar);
		try {
			if (fs.existsSync(destionation) && !fs.existsSync(destionation + ".unfinished")) {
				logger("Skipping " + jar.identifier + " as it already exists");
				resolve();
				return;
			}

			logger("Downloading " + jar.identifier + " to " + destionation);

			fs.writeFileSync(destionation + ".unfinished", "lock");
			const file = fs.createWriteStream(destionation);
			const request = https.get(jar.remoteUrl, (response) => {
				if (response.statusCode !== 200) {
					logger(`Status code ${response.statusCode} while downloading ${jar.identifier}`);
					file.close();
					fs.unlinkSync(destionation);
					reject();
				};
				response.pipe(file);

				file.on('finish', () => {
					file.close();
					logger("Downloaded " + jar.identifier + " to " + destionation);
					fs.unlinkSync(destionation + ".unfinished");
					resolve();
				});
			});
		} catch (error) {
			reject(error);
		}
	});
}

export async function downloadJars(queue: IMinecraftJar[]): Promise<void> {
	const downloadPolicy = process.env.DOWNLOAD ?? 'STABLE';
	if (!['ALL', 'STABLE'].includes(downloadPolicy)) {
		console.log("Download is disabled by env");
		return;
	}

	const workerCount = parseInt(process.env.DOWNLOAD_WORKERS ?? '5');
	const workers = [];

	console.log("Downloading " + queue.length + " jars with " + workerCount + " workers");

	for (let i = 0; i < workerCount; i++) {
		const worker = new Promise<void>(async (resolve, reject) => {
			const logger = (message: string) => {
				console.log("[Download worker " + i + "]: " + message);
			}
			logger("Started");
			while (queue.length > 0) {
				const jar = queue.shift();
				logger("Queue size: " + queue.length);
				if (jar) {
					try {
						await downloadJar(jar, logger);
					} catch (error) {
						logger("Error while downloading");
					}
				}
			}
			logger("Finished");
			resolve();
		});
		workers.push(worker);
	}

	await Promise.all(workers);
}
