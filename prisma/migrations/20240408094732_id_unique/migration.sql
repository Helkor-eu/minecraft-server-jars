/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Jar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Jar_identifier_key" ON "Jar"("identifier");
