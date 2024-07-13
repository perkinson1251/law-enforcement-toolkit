import { config } from "@/config";
import connectDB from "@/database/connectDb";
import registerEvents from "@/events";
import logger from "@/utils/logger";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  logger.info(`${client.user?.username} is online.`);
  await connectDB();
});

registerEvents(client);

client.login(config.discordToken);

export default client;
