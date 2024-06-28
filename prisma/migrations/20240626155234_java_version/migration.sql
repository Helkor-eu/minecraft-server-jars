/*
  Warnings:

  - Added the required column `updatedAt` to the `Jar` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Jar" (
    "identifier" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "software" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "javaVersion" TEXT,
    "remoteUrl" TEXT NOT NULL,
    "localPath" TEXT,
    "stable" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Jar" ("gameVersion", "identifier", "localPath", "remoteUrl", "software", "stable", "title") SELECT "gameVersion", "identifier", "localPath", "remoteUrl", "software", "stable", "title" FROM "Jar";
DROP TABLE "Jar";
ALTER TABLE "new_Jar" RENAME TO "Jar";
CREATE UNIQUE INDEX "Jar_identifier_key" ON "Jar"("identifier");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
