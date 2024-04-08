-- CreateTable
CREATE TABLE "Jar" (
    "identifier" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "software" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "remoteUrl" TEXT NOT NULL,
    "stable" BOOLEAN NOT NULL
);
