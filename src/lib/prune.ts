import { IMinecraftJar } from "../types/IMinecraftJar.js";
import { deleteJarFile, getAllJarFiles } from "./downloader.js";
import { deleteFromIndexExcept, getAllJars } from "./indexer.js";

async function pruneIndex(jarsToKeep: IMinecraftJar[]) {
	if (!['true', 'TRUE', true].includes(process.env.PRUNE_INDEX ?? true)) {
		console.log(`[Prune] Skipping index pruning (PRUNE_INDEX is disabled)`);
		return;
	}

	const count = await deleteFromIndexExcept(jarsToKeep.map(jar => jar.identifier));
	console.log(`[Prune] Pruned ${count} records from the index`);
	return count;
}

async function pruneNotIndexed() {
	if (![ 'true', 'TRUE', true ].includes(process.env.PRUNE_NOT_INDEXED_FILES ?? false)) {
		console.log(`[Prune] Skipping not indexed file pruning (PRUNE_NOT_INDEXED_FILES is disabled)`);
		return;
	}

	const allJarFiles = getAllJarFiles();
	const jarIndex = await getAllJars();
	const filesToDelete = allJarFiles.filter(file => !jarIndex.find(jar => jar.identifier + '.jar' === file));

	console.log(`[Prune] Found ${filesToDelete.length} files to prune`);

	for (const file of filesToDelete) {
		console.log(`[Prune] Pruning ${file}`);
		deleteJarFile(file);
	}
}

async function pruneDownloads() {
	await pruneNotIndexed();
}

export { pruneIndex, pruneDownloads };
