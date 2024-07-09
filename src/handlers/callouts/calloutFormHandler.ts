import createCalloutEmbed, {
  createCalloutButtons,
} from "@/templates/calloutTemplate";
import getLastCallout from "@/utils/callous/getLastCallout";
import getRoleColor from "@/utils/getRoleColor";
import logger from "@/utils/logger";
import { ModalSubmitInteraction } from "discord.js";
import Division from "models/Division";

export async function handleSubmitCalloutForm(
  interaction: ModalSubmitInteraction
) {
  const guildId = interaction.guild!.id;
  const channelId = interaction.channelId;
  const userId = interaction.user.id;

  const incidentType = interaction.fields.getTextInputValue(
    "callout-incident-type-input"
  );
  const incidentLocation = interaction.fields.getTextInputValue(
    "callout-incident-location-input"
  );
  const incidentDetails = interaction.fields.getTextInputValue(
    "callout-incident-details-input"
  );
  const incidentChannel = interaction.fields.getTextInputValue(
    "callout-channel-input"
  );

  try {
    const callout = await getLastCallout(guildId, channelId!, userId);

    if (!callout) {
      await interaction.reply({
        content:
          "Не удалось найти данные о запросе. Пожалуйста, попробуйте снова.",
        ephemeral: true,
      });
      return;
    }

    const division = await Division.findOne({
      _id: callout.divisionId,
      guildId,
    });

    if (!division) {
      await interaction.reply({
        content: "Не удалось найти информацию о дивизионе.",
        ephemeral: true,
      });
      return;
    }

    callout.incidentType = incidentType;
    callout.incidentLocation = incidentLocation;
    callout.incidentDetails = incidentDetails;
    callout.incidentChannel = incidentChannel;

    await callout.save();

    const roleColor = getRoleColor(interaction, division.roleId);

    const embed = createCalloutEmbed({
      userId,
      divisionName: division.name,
      divisionLogoUrl: division.logoUrl,
      callout,
      roleColor,
    });

    const row = createCalloutButtons(callout._id as string);

    const message = await interaction.channel?.send({
      content: `<@&${division.roleId}>`,
      embeds: [embed],
      components: [row],
    });

    callout.messageId = message?.id as string;
    await callout.save();

    logger.info(`Callout created. Callout: ${callout._id}, guild: ${guildId}`);

    interaction.deferUpdate();
  } catch (error) {
    logger.error("Failed to handle callout form submission:", error);
    await interaction.reply({
      content: "Произошла ошибка при обработке формы каллаута.",
      ephemeral: true,
    });
  }
}
