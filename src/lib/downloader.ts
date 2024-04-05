import { IMinecraftJar } from "../types/IMinecraftJar.js";
import https from "https";
import fs from "fs";

export function pathFromJar(jar: IMinecraftJar): string {
	return `public/jars/${jar.software}/${jar.gameVersion}/${jar.identifier}.jar`;
}

function ensurePathExists(path: string): void {
	const parts = path.split("/");
	let current = "";
	for (const part of parts) {
		current += part + "/";
		if (!fs.existsSync(current)) {
			fs.mkdirSync(current);
		}
	}
}

type Logger = (message: string) => void;
export async function downloadJar(jar: IMinecraftJar, logger: Logger = console.log): Promise<void> {
	return new Promise((resolve, reject) => {

		if (!jar.stable) {
			logger("Skipping " + jar.identifier + " as it is not stable");
			resolve();
			return;
		}

		const destionation = pathFromJar(jar);
		ensurePathExists(destionation);
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
	const workerCount = 5;
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
