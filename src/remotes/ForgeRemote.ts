import { fetchTask } from "../lib/scheduled-fetch.js";
import { IJarSource } from "../types/IJarSource.js";
import { IMinecraftJar } from "../types/IMinecraftJar.js";

interface ForgeData {
    homepage: string;
    promos: Record<string,string>;
}

export default class ForgeRemote implements IJarSource {

    static readonly FORGE_URL = "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json";

    constructor(
        readonly stable_only: boolean = false,
    ){}

    public async listRemote(): Promise<IMinecraftJar[]> {
        console.log("ForgeRemote: Fetching remote Versions");
        const response = await fetchTask(ForgeRemote.FORGE_URL);
        const versions = await response.json() as ForgeData;
        if (!versions) {
            throw new Error("ForgeRemote: No data found");
        }

        const jars: IMinecraftJar[] = [];
        Object.entries(versions.promos).forEach(([version, forgeVersion]) => {
            const versionSplit = version.split('-');
            const gameVersion = versionSplit[0];
            const channel = versionSplit[1];

            jars.push ({
                title: `Forge ${gameVersion} - ${forgeVersion}`,
                identifier: `forge-${forgeVersion}`,
                localPath: null,
                software: "forge",
                gameVersion,
                remoteUrl: `https://maven.minecraftforge.net/net/minecraftforge/forge/${gameVersion}-${forgeVersion}/forge-${gameVersion}-${forgeVersion}-installer.jar`,
                stable: channel === "recommended",
            });
        });
        return jars;
    }
}
