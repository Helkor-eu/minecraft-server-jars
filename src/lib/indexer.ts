import { PrismaClient } from "@prisma/client";
import { IMinecraftJar } from "../types/IMinecraftJar.js";
const prisma = new PrismaClient();

const logger = (message: string, q: number = -1) => {
  if (q > -1) {
    console.log(`[Indexer] Queue: ${q} | ${message}`);
    return;
  }
  console.log(`[Indexer] ${message}`);
};

async function indexJar(jar: IMinecraftJar, q: number = -1) {
  const existingJar = await prisma.jar.findFirst({
    where: {
      identifier: jar.identifier,
    },
  });

  if (existingJar) {
    if (!['true', 'TRUE', true].includes(process.env.ALLOW_REINDEX ?? true)) {
      logger(`Skipping reindex for existing record ${jar.identifier}`, q);
      return;
    }

    logger(`Updating existing record ${jar.identifier}`, q);
    await prisma.jar.update({
      where: {
        identifier: existingJar.identifier,
      },
      data: jar,
    });
    return;
  }

  logger(`Creating new record for ${jar.identifier}`);
  await prisma.jar.create({
    data: jar,
  });
}

async function indexJars(jars: IMinecraftJar[]) {
  let q = jars.length;
  for (const jar of jars) {
    await indexJar(jar, q);
    q--;
  }
}

async function getAllJars(): Promise<IMinecraftJar[]> {
  return prisma.jar.findMany();
}

async function getJarById(identifier: string): Promise<IMinecraftJar | null> {
  return prisma.jar.findFirst({
    where: {
      identifier,
    },
  });
}

async function getJarsByGameVersion(
  gameVersion: string
): Promise<IMinecraftJar[]> {
  return prisma.jar.findMany({
    where: {
      gameVersion,
    },
  });
}

async function getJarsBySoftware(software: string): Promise<IMinecraftJar[]> {
  return prisma.jar.findMany({
    where: {
      software,
    },
  });
}

async function getSoftwareList(version: string | undefined = undefined): Promise<string[]> {
  const software = await prisma.jar.findMany({
    distinct: ['software'],
    select: {
      software: true,
    },
    where: {
      gameVersion: version,
    }
  });

  return software.map((s) => s.software);
}

async function getJarsBySoftwareAndGameVersion(
  software: string,
  gameVersion: string
): Promise<IMinecraftJar[]> {
  return prisma.jar.findMany({
    where: {
      software,
      gameVersion,
    },
  });
}

async function getGameVersions(software: string | undefined = undefined) {
  const versions = await prisma.jar.findMany({
    distinct: ['gameVersion'],
    where: {
      software,
    },
    select: {
      gameVersion: true,
    },
  });
  return versions.map((v) => v.gameVersion);
}

async function deleteFromIndex(identifiers: string[]) {
  const { count } = await prisma.jar.deleteMany({
    where: {
      identifier: {
        in: identifiers,
      },
    },
  });
  return count;
}

async function deleteFromIndexExcept(identifiers: string[]) {
  const { count } = await prisma.jar.deleteMany({
    where: {
      NOT: {
        identifier: {
          in: identifiers,
        },
      },
    },
  });
  return count;
}

export {
  indexJars,
  indexJar,
  getAllJars,
  getJarById,
  getJarsByGameVersion,
  getJarsBySoftware,
  getSoftwareList,
  getJarsBySoftwareAndGameVersion,
  deleteFromIndex,
  deleteFromIndexExcept,
  getGameVersions,
};
