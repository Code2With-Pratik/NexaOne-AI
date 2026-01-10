import { defineConfig } from '@prisma/config';

export default defineConfig({
  // 👇 This must be 'datasource' (singular), not 'datasources'
  datasource: {
    url: process.env.DATABASE_URL,
  },
});