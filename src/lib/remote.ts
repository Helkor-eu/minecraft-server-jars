import FabricRemote from "../remotes/FabricRemote.js";
import MojangRemote from "../remotes/MojangRemote.js";
import PaperRemote from "../remotes/PaperRemote.js";
import PurpurRemote from "../remotes/PurpurRemote.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";


function constructRemoteByName(name: string, stable_only: boolean = false) {
	switch (name.toUpperCase()) {
		case 'MOJANG':
			return new MojangRemote(stable_only);
		case 'FABRIC':
			return new FabricRemote(stable_only);
		case 'PAPER':
			return new PaperRemote(stable_only);
		case 'PURPUR':
			return new PurpurRemote(stable_only);
		default:
			throw new Error(`Unknown remote ${name}`);
	}
}

export async function discoverAllRemoteVersions() {
	const indexString = process.env.INDEX ?? 'ALL_STABLE';
	if (indexString === 'ALL' || indexString === 'ALL_STABLE') {
		const onlyStable = indexString === 'ALL_STABLE';
		const remotes = [
			new MojangRemote(onlyStable),
			new FabricRemote(onlyStable),
			new PaperRemote(onlyStable),
			new PurpurRemote(onlyStable),
		];
		const jars = await Promise.all(remotes.map(remote => remote.listRemote()));
		return jars.flat();
	}

	const channelNames = indexString.split(',');
	const channels = channelNames.map((channelName) => {
		const props = channelName.split('_');
		const remote = constructRemoteByName(props[0], (props[1] ?? 'UNSTABLE') === 'STABLE');
		return remote.listRemote();
	});

	const jars = await Promise.all(channels);
	return jars.flat();
}
