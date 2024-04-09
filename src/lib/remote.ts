import FabricRemote from "../remotes/FabricRemote.js";
import MojangRemote from "../remotes/MojangRemote.js";
import PaperRemote from "../remotes/PaperRemote.js";
import PurpurRemote from "../remotes/PurpurRemote.js";
import { SpigotRemote } from "../remotes/SpigotRemote.js";
import VelocityRemote from "../remotes/VelocityRemote.js";
import { IJarSource } from "../types/IJarSource.js";


function constructRemotes(stable_only: boolean = false) {
	return {
		'MOJANG': new MojangRemote(stable_only),
		'FABRIC': new FabricRemote(stable_only),
		'PAPER': new PaperRemote(stable_only),
		'PURPUR': new PurpurRemote(stable_only),
		'VELOCITY': new VelocityRemote(stable_only),
		'SPIGOT': new SpigotRemote(stable_only),
	}
}

function constructRemoteByName(name: string, stable_only: boolean = false): IJarSource {
	const remotes = constructRemotes(stable_only);
	// @ts-ignore
	return remotes[name.toUpperCase()];
}

export async function discoverAllRemoteVersions() {
	const indexString = process.env.INDEX ?? 'ALL_STABLE';
	if (indexString === 'ALL' || indexString === 'ALL_STABLE') {
		const onlyStable = indexString === 'ALL_STABLE';

		const remoteObj = constructRemotes(onlyStable);
		const remotes = Object.entries(remoteObj).map(([_, remote]) => remote);
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
