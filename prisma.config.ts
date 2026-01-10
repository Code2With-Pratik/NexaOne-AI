import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // 👇 We are hardcoding this temporarily to bypass the environment error
    url: "postgresql://neondb_owner:npg_vcW0CeTY7NIz@ep-red-dream-ahycvzws-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});