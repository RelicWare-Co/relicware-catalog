import "@tanstack/react-start/server-only";

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

import * as authSchema from "./schema/auth.schema.ts";
import * as mainSchema from "./schema/main.schema.ts";

export const runtime = process.versions.bun ? "bun" : "node";

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
const require = createRequire(import.meta.url);

type AppDb = BaseSQLiteDatabase<"sync", unknown, typeof schema>;

async function createDbClient() {
  // biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required at runtime
  const databaseUrl = process.env.DATABASE_URL!;

  if (runtime === "bun") {
    const [{ drizzle }, { migrate }] = await Promise.all([
      import("drizzle-orm/bun-sqlite"),
      import("drizzle-orm/bun-sqlite/migrator"),
    ]);
    const db = drizzle(databaseUrl, { schema }) as AppDb;

    return {
      db,
      migrate: () =>
        migrate(db as Parameters<typeof migrate>[0], { migrationsFolder }),
    };
  }

  const [{ drizzle }, { migrate }] = await Promise.all([
    import("drizzle-orm/better-sqlite3"),
    import("drizzle-orm/better-sqlite3/migrator"),
  ]);
  const sqlite = new (require("better-sqlite3") as typeof import(
    "better-sqlite3"
  ))(databaseUrl) as import("better-sqlite3").Database;
  const db = drizzle(sqlite, { schema }) as AppDb;

  return {
    db,
    migrate: () =>
      migrate(db as Parameters<typeof migrate>[0], { migrationsFolder }),
  };
}

const dbClient = await createDbClient();

export const db = dbClient.db;

export function migrateDb() {
  if (globalForDb.__relicwareMigrationsApplied) {
    return;
  }

  dbClient.migrate();
  globalForDb.__relicwareMigrationsApplied = true;
}

migrateDb();
