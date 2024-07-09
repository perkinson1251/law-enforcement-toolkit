import Callout from "@/models/Callout";
import createCalloutEmbed, {
  createCalloutButtons,
} from "@/templates/calloutTemplate";
import getRoleColorById from "@/utils/getRoleColor";
import logger from "@/utils/logger";
import { ModalSubmitInteraction, TextChannel } from "discord.js";
import Division from "models/Division";

export async function handleSubmitCalloutDeBriefForm(
  interaction: ModalSubmitInteraction,
  calloutId: string
) {
  const guildId = interaction.guild!.id;

  const incidentDetails = interaction.fields.getTextInputValue(
    "callout-incident-debrief-input"
  );

  try {
    await Callout.findByIdAndUpdate(
      {
        _id: calloutId,
        guildId,
      },
      {
        incidentDetails,
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

    const row = createCalloutButtons(calloutId as string, true);

    await message.edit({
      content: `<@&${division!.roleId}>`,
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "Подробности успешно обновлены",
      ephemeral: true,
    });

    logger.info(
      `Callout details edited. Callout: ${calloutId}, guild: ${guildId}`
    );
  } catch (error) {
    logger.error(
      `Failed edit callout details. Callout id: ${calloutId}, guild id: ${guildId}. Error:`,
      error
    );
    await interaction.reply({
      content: "Произошла ошибка при обработке формы новых подробностей.",
      ephemeral: true,
    });
  }
}
