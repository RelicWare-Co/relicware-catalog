import "@tanstack/react-start/server-only";

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import * as authSchema from "./schema/auth.schema.ts";
import * as mainSchema from "./schema/main.schema.ts";

const schema = {
  ...authSchema,
  ...mainSchema,
};

const moduleRelativeMigrationsFolder = fileURLToPath(
  new URL("../../drizzle", import.meta.url),
);
const cwdMigrationsFolder = resolve(process.cwd(), "drizzle");
const migrationsFolder = existsSync(cwdMigrationsFolder)
  ? cwdMigrationsFolder
  : moduleRelativeMigrationsFolder;

const globalForDb = globalThis as typeof globalThis & {
  __relicwareMigrationsApplied?: boolean;
};

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required at runtime
export const db = drizzle(process.env.DATABASE_URL!, { schema });

export function migrateDb() {
  if (globalForDb.__relicwareMigrationsApplied) {
    return;
  }

  migrate(db, { migrationsFolder });
  globalForDb.__relicwareMigrationsApplied = true;
}

migrateDb();
