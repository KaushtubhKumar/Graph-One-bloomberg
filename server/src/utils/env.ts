import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Check your .env file (see .env.example).`
    );
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  CORS_ORIGIN: process.env.CLIENT_URL || process.env.CORS_ORIGIN || "*",
  API_KEY: process.env.API_KEY || "graphone-dev-key",
};
