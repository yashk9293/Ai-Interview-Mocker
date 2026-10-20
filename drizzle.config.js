// drizzle-kit doesn't read .env on its own; Next.js does this for the app.
try {
  process.loadEnvFile();
} catch {}

/** @type { import("drizzle-kit").Config } */
const config = {
    schema: "./utils/schema.js",
    out: "./drizzle",
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL,
    }
  };

export default config;
