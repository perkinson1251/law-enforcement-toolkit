import Callout from "@/models/Callout";
import Division from "@/models/Division";
import createCalloutEmbed, {
  createCalloutButtons,
} from "@/templates/calloutTemplate";
import getStatusDescription from "@/utils/callous/getStatusDescription";
import getRoleColorById from "@/utils/getRoleColor";
import logger from "@/utils/logger";
import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
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

  const collector = interaction.channel?.createMessageComponentCollector({
    filter: (i) =>
      i.customId === `select-status-${calloutId}` &&
      i.user.id === interaction.user.id,
    time: 60000,
  });

  collector?.on("collect", async (i: StringSelectMenuInteraction) => {
    collector.stop();
    const selectedStatus = i.values[0];
    const guildId = i.guild!.id;
    const channelId = i.channel!.id;
    const messageId = i.message.id;
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
      const roleColor = getRoleColorById(i, division!.roleId);
      const embed = createCalloutEmbed({
        userId: updatedCallout!.userId,
        divisionName: division!.name,
        divisionLogoUrl: division!.logoUrl,
        callout: updatedCallout!,
        roleColor,
      });

      const channel = i.guild!.channels.cache.get(updatedCallout!.channelId);
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

      await i.reply({
        content: "Статус успешно обновлён",
        ephemeral: true,
      });
    } catch (error) {
      logger.error("Error while updating callout status.", error);
    }
    setTimeout(async () => {
      await i.deleteReply();
      await interaction.deleteReply();
    }, 2000);
  });
  collector?.on("end", (collected) => {
    if (collected.size === 0) {
      interaction.followUp({
        content: "Время на выбор статуса истекло.",
        ephemeral: true,
      });
      setTimeout(async () => {
        await interaction.deleteReply();
      }, 2000);
    }
  });
}

async function handleDeBriefButton(
  interaction: ButtonInteraction,
  calloutId: string
) {
  const guildId = interaction.guild!.id;
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

  try {
    const modalInteraction = await interaction.awaitModalSubmit({
      time: 120000,
      filter: (i) => {
        return (
          i.customId === `callout-debrief-${calloutId}` &&
          i.user.id === interaction.user.id
        );
      },
    });

    await modalInteraction.deferReply({ ephemeral: true });

    const incidentDetails = modalInteraction.fields.getTextInputValue(
      "callout-incident-debrief-input"
    );

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
    const roleColor = getRoleColorById(modalInteraction, division!.roleId);
    const embed = createCalloutEmbed({
      userId: updatedCallout!.userId,
      divisionName: division!.name,
      divisionLogoUrl: division!.logoUrl,
      callout: updatedCallout!,
      roleColor,
    });

    const channel = modalInteraction.guild!.channels.cache.get(
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

    await modalInteraction.editReply({
      content: "Подробности успешно обновлены",
    });
    setTimeout(async () => {
      await modalInteraction.deleteReply();
    }, 2000);

    logger.info(
      `Callout details edited. Callout: ${calloutId}, guild: ${guildId}`
    );
  } catch (error) {
    if (!interaction.replied) {
      await interaction.reply({
        content: "Произошла ошибка при обработке формы новых подробностей.",
        ephemeral: true,
      });
    } else {
      logger.warn("Interaction already replied, unable to send error message.");
    }
  }
}

async function handleThreadButton(
  interaction: ButtonInteraction,
  calloutId: string
) {
  const channel = interaction.channel as TextChannel;

  if (!channel) {
    throw new Error("Channel not found");
  }

  const callout = await Callout.findById(calloutId);
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

  await Callout.findOneAndUpdate({ _id: calloutId }, { threadId: thread.id });
}
