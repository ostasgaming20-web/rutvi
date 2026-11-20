import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import * as authSchema from "@/lib/db/auth-schema";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema, ...authSchema },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  baseURL: isProd
    ? process.env.BETTER_AUTH_URL
    : {
        allowedHosts: ["*"],
        fallback: "http://localhost:4000",
        protocol: "https",
      },
  trustedOrigins: ["*"],
  advanced: isProd
    ? undefined
    : {
        defaultCookieAttributes: {
          sameSite: "none",
          secure: true,
          partitioned: true,
        },
      },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
