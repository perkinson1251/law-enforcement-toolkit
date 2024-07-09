import { config } from "@/config";
import registerEvents from "@/events";
import logger from "@/utils/logger";
import { Client, GatewayIntentBits } from "discord.js";
import connectDB from "./database/connectDb";

import { scrapeWebsite } from "@/utils/scraper";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  logger.info(`${client.user?.username} is online.`);
  await connectDB();
});

registerEvents(client);

scrapeWebsite();

client.login(config.discordToken);

export default client;
