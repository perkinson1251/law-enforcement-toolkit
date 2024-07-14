import { getQueueChannel } from "@/commands/ftp/ftp";
import Queue from "@/models/Queue";
import autoRemoveFromQueue from "@/utils/ftp/autoRemoveFromQueue";
import updateQueueMessage from "@/utils/ftp/updateQueueMessage";
import logger from "@/utils/logger";
import { Client, TextChannel } from "discord.js";

export default async function updateQueues(client: Client) {
  try {
    client.guilds.cache.forEach(async (guild) => {
      const guildId = guild.id;
      const traineeQueue = await Queue.find({ guildId, type: "trainee" });
      const ftoQueue = await Queue.find({ guildId, type: "fto" });

      const channelID = await getQueueChannel(guildId);
      if (!channelID) {
        return;
      }

      const channel = guild.channels.cache.get(channelID) as
        | TextChannel
        | undefined;
      if (!channel) {
        logger.warn(
          `Queue channel (${channelID}) is not a valid text channel for guild ${guildId}, cannot update queue message.`
        );
        return;
      }
      autoRemoveFromQueue(traineeQueue, "trainee");
      autoRemoveFromQueue(ftoQueue, "fto");
      await updateQueueMessage(channel, client.user?.id ?? "");
    });
  } catch (error) {
    logger.error("Error updating queues:", error);
  }
}
