import FabricRemote from "../remotes/FabricRemote.js";
import MojangRemote from "../remotes/MojangRemote.js";
import PaperRemote from "../remotes/PaperRemote.js";
import PurpurRemote from "../remotes/PurpurRemote.js";

export async function discoverAllRemoteVersions() {
	const mojangRemote = new MojangRemote();
	const fabricRemote = new FabricRemote();
	const paperRemote = new PaperRemote();
	const purpurRemote = new PurpurRemote();

	return [
		await mojangRemote.listRemote(),
		await purpurRemote.listRemote(),
		await paperRemote.listRemote(),
		await fabricRemote.listRemote(),
	].flat();
}
