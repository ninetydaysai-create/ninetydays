import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Prisma v7 config loader doesn't auto-load .env files
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
