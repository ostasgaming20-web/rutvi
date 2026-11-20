import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/auth-schema.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
