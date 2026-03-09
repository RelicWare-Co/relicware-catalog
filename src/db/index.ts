import "@tanstack/react-start/server-only";

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql/web";

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
  __relicwareMigrationsPromise?: Promise<void>;
};

function createDbClient() {
  // biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required at runtime
  const databaseUrl = process.env.DATABASE_URL!;

  const db = drizzle({
    connection: {
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    schema,
  });

  return {
    db,
    migrate: () => migrate(db, { migrationsFolder }),
  };
}

const dbClient = createDbClient();

export const db = dbClient.db;

export function migrateDb() {
  if (globalForDb.__relicwareMigrationsApplied) {
    return Promise.resolve();
  }

  if (globalForDb.__relicwareMigrationsPromise) {
    return globalForDb.__relicwareMigrationsPromise;
  }

  globalForDb.__relicwareMigrationsPromise = dbClient.migrate().then(() => {
    globalForDb.__relicwareMigrationsApplied = true;
  });

  return globalForDb.__relicwareMigrationsPromise;
}

await migrateDb();
