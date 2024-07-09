import { generateFtpPanel } from "@/utils/ftp/generateFtpPanel";
import { TextChannel } from "discord.js";

export default async function updateQueueMessage(
  channel: TextChannel,
  clientUserId: string
) {
  try {
    const messages = await channel.messages.fetch();
    const queueMessage = messages.find(
      (msg) =>
        msg.author.id === clientUserId &&
        msg.embeds[0]?.title === "FIELD TRAINING PROGRAM QUEUE"
    );

    const panelEmbed = await generateFtpPanel(channel.guild.id);

    if (queueMessage) {
      await queueMessage.edit({ embeds: [panelEmbed] });
    } else {
      await channel.send({ embeds: [panelEmbed] });
    }
  } catch (error) {
    console.error("Error updating queue message:", error);
  }
}
