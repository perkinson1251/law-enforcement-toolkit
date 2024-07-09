import { Client } from "discord.js";
import guildCreate from "./guildCreate";
import interactionCreate from "./interactionCreate";
import ready from "./ready";

export default (client: Client): void => {
  client.once("ready", ready.bind(null, client));
  client.on("guildCreate", guildCreate);
  client.on("interactionCreate", interactionCreate);
};
