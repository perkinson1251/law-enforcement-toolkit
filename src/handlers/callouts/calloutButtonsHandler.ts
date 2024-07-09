import CalloutModel from "@/models/Callout";
import getStatusDescription from "@/utils/callous/getStatusDescription";
import logger from "@/utils/logger";
import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export async function handleCalloutButtons(interaction: ButtonInteraction) {
  const customId = interaction.customId;
  const calloutId = customId.split("-").pop();
  switch (customId) {
    case `callout-status-button-${calloutId}`:
      await handleStatusButton(interaction, calloutId!);
      break;
    case `callout-deBrief-button-${calloutId}`:
      await handleDeBriefButton(interaction, calloutId!);
      break;
    case `callout-thread-button-${calloutId}`:
      await handleThreadButton(interaction, calloutId!);
      break;
  }
}

async function handleStatusButton(
  interaction: ButtonInteraction,
  calloutId: string
) {
  const statusOptions = ["active", "closed"].map((status) => ({
    label: getStatusDescription(status),
    value: status,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`select-status-${calloutId}`)
    .setPlaceholder("Выберите статус")
    .addOptions(statusOptions);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu
  );

  await interaction.reply({
    content: "Выберите новый статус для каллаута:",
    components: [row],
    ephemeral: true,
  });
}

async function handleDeBriefButton(
  interaction: ButtonInteraction,
  calloutId: string
) {
  const modal = new ModalBuilder()
    .setCustomId(`callout-debrief-${calloutId}`)
    .setTitle("Подробности");

  const incidentDetailsInput = new TextInputBuilder()
    .setCustomId("callout-incident-debrief-input")
    .setLabel("Новые подробности")
    .setStyle(TextInputStyle.Paragraph);

  const incidentDetailsActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(
      incidentDetailsInput
    );

  modal.addComponents(incidentDetailsActionRow);

  await interaction.showModal(modal);
}

async function handleThreadButton(
  interaction: ButtonInteraction,
  calloutId: string
) {
  const channel = interaction.channel as TextChannel;

  if (!channel) {
    throw new Error("Channel not found");
  }

  const callout = await CalloutModel.findById(calloutId);
  if (callout?.threadId !== "") {
    await interaction.reply({
      content: `Ветка уже создана: <#${callout?.threadId}>`,
      ephemeral: true,
    });
    return;
  }

  const thread = await channel.threads.create({
    name: `${callout!.incidentType}`,
    autoArchiveDuration: 60,
    reason: `Ветка для инцидента ${callout!.incidentType}`,
  });

  logger.info(
    `Created thread for callout. Callout: ${calloutId}, guild: ${interaction.guild?.id}`
  );

  await CalloutModel.findOneAndUpdate(
    { _id: calloutId },
    { threadId: thread.id }
  );
}
