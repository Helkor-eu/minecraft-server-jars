import express from 'express';
import { getGameVersions, getJarById, getJarJavaVersion, getJarsByGameVersion, getJarsBySoftware, getJarsBySoftwareAndGameVersion, getSoftwareList } from '../lib/indexer.js';
import { IMinecraftJar } from '../types/IMinecraftJar.js';
import { isJarDownloaded } from '../lib/downloader.js';

function getBaseUrl() {
	return process.env.BASE_URL ?? 'http://localhost:3000';
}

interface ApiJar extends IMinecraftJar {
	bestDownload: string;
	downloaded: boolean;
}

export async function transformJar(jar: IMinecraftJar): Promise<ApiJar> {
	const isDownloaded = isJarDownloaded(jar);
	const localUrl = `${getBaseUrl()}/static/jars/${jar.identifier}.jar`;
	const javaVersion = await getJarJavaVersion(jar);
	return {
		...jar,
		javaVersion,
		localPath: isDownloaded ? localUrl : null,
		bestDownload: isDownloaded ? localUrl : jar.remoteUrl,
		downloaded: isDownloaded,
	};
}

// software
// software/:software
// software/:software/jars
// software/:software/group/:group
// software/:software/group/:group/jars
// versions - Missing
// versions/:version -- Missing
// versions/:version/jars -- Missing
// jar/:identifier - Missing


export function api_v1() {
	const app = express.Router();

	app.get('/software', async (req, res) => {
		const software = await getSoftwareList();
		res.json({
			software: software.map((s) => ({
				software: s,
				url: `${getBaseUrl()}/api/v1/software/${s}`,
			})),
		});
	});

	app.get('/software/:software', async (req, res) => {
		const software = req.params.software;
		const gameVersions = await getGameVersions(software);
		res.json({
			software,
			jars: `${getBaseUrl()}/api/v1/software/${software}/jars`,
			groups: gameVersions.map((v) => ({
				group: v,
				url: `${getBaseUrl()}/api/v1/software/${software}/group/${v}/jars`,
			})),
		});
	});

	app.get('/software/:software/jars', async (req, res) => {
		const software = req.params.software;
		const jars = await getJarsBySoftware(software);
		res.json({
			software,
			jars: await Promise.all(jars.map(transformJar)),
		});
	});

	app.get('/software/:software/group/:group', async (req, res) => {
		const software = req.params.software;
		const group = req.params.group;
		res.json({
			software,
			jars: `${getBaseUrl()}/api/v1/software/${software}/group/${group}/jars`,
		})
	});

	app.get('/software/:software/group/:group/jars', async (req, res) => {
		const software = req.params.software;
		const group = req.params.group;
		const jars = await getJarsBySoftwareAndGameVersion(software, group);
		res.json({
			software,
			group,
			jars: await Promise.all(jars.map(transformJar)),
		});
	});

	app.get('/versions', async (req, res) => {
		const versions = await getGameVersions();
		res.json({
			versions: versions.map((v) => ({
				version: v,
				url: `${getBaseUrl()}/api/v1/versions/${v}`,
				jars: `${getBaseUrl()}/api/v1/versions/${v}/jars`,
			})),
		});
	});

	app.get('/versions/:version', async (req, res) => {
		const version = req.params.version;
		const software = await getSoftwareList(version);

		res.json({
			version,
			jars: `${getBaseUrl()}/api/v1/versions/${version}/jars`,
			software: software.map((s) => ({
				software: s,
				url: `${getBaseUrl()}/api/v1/software/${s}/group/${version}`,
				jars: `${getBaseUrl()}/api/v1/software/${s}/group/${version}/jars`,
			})),
		});
	});

	app.get('/versions/:version/jars', async (req, res) => {
		const version = req.params.version;
		const jars = await getJarsByGameVersion(version);
		res.json({
			version,
			jars: await Promise.all(jars.map(transformJar)),
		});
	});

	app.get('/jar/:identifier', async (req, res) => {
		const identifier = req.params.identifier;
		const jar = await getJarById(identifier);
		if (!jar) {
			res.status(404).json({ error: 'Jar not found' });
			return;
		}
		res.json(await transformJar(jar));
	});

	return app;
}
