import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DB_URI } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DB_URI) {
  throw new Error("Missing environment variables");
}

export const config = {
  discordToken: DISCORD_TOKEN,
  discordClientId: DISCORD_CLIENT_ID,
  db: DB_URI,
  autoRemoveTime: 180,
};
