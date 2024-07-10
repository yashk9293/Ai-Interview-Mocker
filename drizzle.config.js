/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:fI4sTyBzMLc7@ep-solitary-hill-a57dg5eu.us-east-2.aws.neon.tech/ai-mock-interview?sslmode=require',
    }
  };