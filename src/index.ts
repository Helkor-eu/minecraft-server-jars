import {  downloadJars } from "./lib/downloader.js";
import { discoverAllRemoteVersions } from "./lib/remote.js";
console.log('running...');
discoverAllRemoteVersions().then(downloadJars);
