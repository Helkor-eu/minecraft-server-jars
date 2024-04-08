import {  downloadJars } from "./lib/downloader.js";
import { indexJars } from "./lib/indexer.js";
import { discoverAllRemoteVersions } from "./lib/remote.js";
import dotenv from 'dotenv';
dotenv.config();

console.log('running...');
discoverAllRemoteVersions().then(indexJars);
