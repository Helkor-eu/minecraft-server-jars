import { runApi } from "./api/api.js";
import {  downloadJars } from "./lib/downloader.js";
import { getAllJars, indexJars } from "./lib/indexer.js";
import { pruneDownloads, pruneIndex } from "./lib/prune.js";
import { discoverAllRemoteVersions } from "./lib/remote.js";
import dotenv from 'dotenv';
dotenv.config();

console.log('running...');

async function indexRemoteJars() {
	const remoteJars = await discoverAllRemoteVersions();
	await indexJars(remoteJars);
	await pruneIndex(remoteJars);
}

async function downloadJarsFromIndex() {
	const localJars = await getAllJars();
	await pruneDownloads();
	await downloadJars(localJars);
}

async function fullUpdate() {
	await indexRemoteJars();
	await downloadJarsFromIndex();
}

setInterval(fullUpdate, parseInt(process.env.UPDATE_INTERVAL ?? '24')*60*60*1000);
if ((process.env.UPDATE_ON_START ?? 'true') === 'true') {
	console.log('Running full update on start');
	fullUpdate();
} else {
	console.log('Skipping full update on start (set UPDATE_ON_START=true to enable)');
}

runApi();
