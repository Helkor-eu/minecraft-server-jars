import FabricRemote from "../remotes/FabricRemote.js";
import MojangRemote from "../remotes/MojangRemote.js";
import PaperRemote from "../remotes/PaperRemote.js";
import PurpurRemote from "../remotes/PurpurRemote.js";

export async function discoverAllRemoteVersions() {
	const mojangRemote = new MojangRemote();
	const fabricRemote = new FabricRemote();
	const paperRemote = new PaperRemote();
	const purpurRemote = new PurpurRemote();



	const jars = await Promise.all([
		mojangRemote.listRemote(),
		purpurRemote.listRemote(),
		paperRemote.listRemote(),
		fabricRemote.listRemote(),
	])
	return jars.flat();
}
