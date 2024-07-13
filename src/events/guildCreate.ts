import ServerSettingsModel from "@/models/ServerSettings";
import deployCommands from "@/utils/deployCommands";
import logger from "@/utils/logger";
import { Guild } from "discord.js";

export default async (guild: Guild): Promise<void> => {
  logger.info(`Bot added to guild: ${guild.id}`);
  await ServerSettingsModel.create({
    guildId: guild.id,
  });
  await deployCommands({ guildId: guild.id });
};
