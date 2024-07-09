import { EmbedBuilder, User } from "discord.js";

export default async function sendEmbedToUser(
  user: User,
  embed: EmbedBuilder
): Promise<void> {
  try {
    await user.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Failed to send embed to user ${user.tag}:`, error);
  }
}
