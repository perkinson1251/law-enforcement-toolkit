import Callout from "@/models/Callout";
import Division from "@/models/Division";
import createCalloutEmbed from "@/templates/calloutTemplate";
import getRoleColorById from "@/utils/getRoleColor";
import logger from "@/utils/logger";
import { StringSelectMenuInteraction, TextChannel } from "discord.js";

export async function handleSelectCalloutStatus(
  interaction: StringSelectMenuInteraction,
  calloutId: string
) {
  const selectedStatus = interaction.values[0];
  const guildId = interaction.guild!.id;
  const channelId = interaction.channel!.id;
  const messageId = interaction.message.id;

  try {
    await Callout.findByIdAndUpdate(
      {
        _id: calloutId,
        guildId,
        channelId,
        messageId,
      },
      {
        status: selectedStatus,
      }
    );
    const updatedCallout = await Callout.findById(calloutId);
    const division = await Division.findOne({
      _id: updatedCallout!.divisionId,
      guildId,
    });
    const roleColor = getRoleColorById(interaction, division!.roleId);
    const embed = createCalloutEmbed({
      userId: updatedCallout!.userId,
      divisionName: division!.name,
      divisionLogoUrl: division!.logoUrl,
      callout: updatedCallout!,
      roleColor,
    });

    const channel = interaction.guild!.channels.cache.get(
      updatedCallout!.channelId
    );
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error("Channel not found or not a TextChannel");
    }
    const message = await (channel as TextChannel).messages.fetch(
      updatedCallout!.messageId
    );
    if (!message) {
      throw new Error("Message not found");
    }

    await message.edit({
      content: `<@&${division!.roleId}>`,
      embeds: [embed],
      components: message.components,
    });

    await interaction.reply({
      content: "Статус успешно обновлён",
      ephemeral: true,
    });
  } catch (error) {
    logger.error("Error while updating callout status.", error);
  }
}
