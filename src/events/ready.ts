import ServerSettingsModel from "@/models/ServerSettings";
import deployCommands from "@/utils/deployCommands";
import updateQueues from "@/utils/ftp/updateQueues";
import logger from "@/utils/logger";
import { Client } from "discord.js";

export default async (client: Client): Promise<void> => {
  try {
    const guilds = await client.guilds.fetch();
    for (const guild of guilds.values()) {
      const existingSettings = await ServerSettingsModel.findOne({
        guildId: guild.id,
      });
      if (!existingSettings) {
        await ServerSettingsModel.create({ guildId: guild.id });
        logger.info(`Server settings created for guild: ${guild.id}`);
      }
      await deployCommands({ guildId: guild.id });
      logger.info(`Deployed commands for guild: ${guild.id}`);

      setInterval(async () => {
        try {
          await updateQueues(client);
        } catch (error) {
          logger.error("Failed to update queues:", error);
        }
      }, 60 * 1000);
    }
  } catch (error) {
    logger.error(`Error during bot startup: ${error}`);
  }
};
