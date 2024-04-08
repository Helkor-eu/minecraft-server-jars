import { PrismaClient } from '@prisma/client'
import { IMinecraftJar } from '../types/IMinecraftJar.js';
const prisma = new PrismaClient();

const logger = (message: string) => {
	console.log(`[Indexer] ${message}`);
}

async function indexJar(jars: IMinecraftJar) {
	const existingJar = await prisma.jar.findFirst({
		where: {
			identifier: jars.identifier
		}
	});

	if (existingJar) {
		logger(`Updating existing record ${jars.identifier}`);
		await prisma.jar.update({
			where: {
				identifier: existingJar.identifier
			},
			data: jars
		});
		return;
	}

	logger(`Creating new record for ${jars.identifier}`);
	await prisma.jar.create({
		data: jars
	});
}

async function indexJars(jars: IMinecraftJar[]) {
	for (const jar of jars) {
		await indexJar(jar);
	}
}

export { indexJars, indexJar };
