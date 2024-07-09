import Callout from "@/models/Callout";
import logger from "@/utils/logger";
import {
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export async function handleSelectDivisionForCallout(
  interaction: StringSelectMenuInteraction
) {
  const selectedDivisionId = interaction.values[0];
  const guildId = interaction.guild!.id;
  const channelId = interaction.channel!.id;
  const userId = interaction.user.id;
  const timestamp = Math.floor(Date.now() / 1000);

  const callout = await Callout.create({
    guildId,
    channelId,
    messageId: "",
    userId,
    divisionId: selectedDivisionId,
    incidentType: "",
    incidentLocation: "",
    incidentDetails: "",
    incidentChannel: "",
    status: "active",
    timestamp,
  });
  logger.info(`Callout created. Guild: ${guildId}, callout: ${callout._id}`);

  const modal = new ModalBuilder()
    .setCustomId("callout-info-modal")
    .setTitle("Подробности");

  const incidentTypeInput = new TextInputBuilder()
    .setCustomId("callout-incident-type-input")
    .setLabel("Тип инцидента")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Штурм, задержание");

  const incidentLocationInput = new TextInputBuilder()
    .setCustomId("callout-incident-location-input")
    .setLabel("Локация")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Ист ЛС, центральная станция");

  const incidentDetailsInput = new TextInputBuilder()
    .setCustomId("callout-incident-details-input")
    .setLabel("Подробности")
    .setStyle(TextInputStyle.Paragraph);

  const incidentChannelInput = new TextInputBuilder()
    .setCustomId("callout-channel-input")
    .setLabel("Канал в Teamspeak")
    .setStyle(TextInputStyle.Short);

  const incidentTypeActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(incidentTypeInput);
  const incidentLocationActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentLocationInput
    );
  const incidentDetailsActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentDetailsInput
    );
  const incidentChannelActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentChannelInput
    );

  modal.addComponents(
    incidentTypeActionRow,
    incidentLocationActionRow,
    incidentDetailsActionRow,
    incidentChannelActionRow
  );

  await interaction.showModal(modal);
}
