/*
  Warnings:

  - The primary key for the `Panel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Panel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "command" TEXT
);
INSERT INTO "new_Panel" ("command", "id", "name") SELECT "command", "id", "name" FROM "Panel";
DROP TABLE "Panel";
ALTER TABLE "new_Panel" RENAME TO "Panel";
CREATE TABLE "new_Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "panelId" TEXT NOT NULL,
    CONSTRAINT "Role_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Role" ("id", "label", "panelId", "roleId") SELECT "id", "label", "panelId", "roleId" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
