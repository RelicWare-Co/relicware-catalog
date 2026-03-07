import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "#/db";
import {
  organizationAc,
  organizationRoles,
} from "#/lib/organization-permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    tanstackStartCookies(),
    admin(),
    organization({
      ac: organizationAc,
      roles: organizationRoles,
    }),
  ],
});
