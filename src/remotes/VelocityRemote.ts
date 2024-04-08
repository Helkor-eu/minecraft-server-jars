import { fetchTask } from "../lib/scheduled-fetch.js";
import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";
import { asyncForeach } from "../utils/async-foreach.js";
import PaperRemote from "./PaperRemote.js";

class VelocityRemote extends PaperRemote {

	constructor(
		readonly stable_only: boolean = false,
	) {
		super(stable_only);
	}


	async listRemote(): Promise<IMinecraftJar[]> {
		return this.listRemoteProject('velocity');
	}
}

export default VelocityRemote;
