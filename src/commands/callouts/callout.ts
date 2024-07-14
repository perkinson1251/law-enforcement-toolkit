import Callout from "@/models/Callout";
import Division from "@/models/Division";
import calloutSelectDivTemplate from "@/templates/calloutSelectDivTemplate";
import createCalloutEmbed, {
  createCalloutButtons,
} from "@/templates/calloutTemplate";
import { IDivision } from "@/types";
import getRoleColor from "@/utils/getRoleColor";
import logger from "@/utils/logger";
import {
  ActionRowBuilder,
  CommandInteraction,
  Interaction,
  ModalBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("callout")
  .setDescription("Создает каллаут.");

export async function execute(interaction: CommandInteraction) {
  try {
    const guildId = interaction.guild!.id;
    const divisions = await Division.find({ guildId });

    if (divisions.length === 0) {
      await interaction.reply({
        content: "На сервере нет дивизионов.",
        ephemeral: true,
      });
      return;
    }

    const options = divisions.map((division: IDivision) => ({
      label: division.name,
      value: division._id!.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select-division-for-callout")
      .setPlaceholder("Выберите дивизион для запроса")
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );

    await interaction.reply({
      content: "Выберите дивизион, который хотите запросить:",
      components: [row],
      embeds: [calloutSelectDivTemplate],
      ephemeral: true,
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      filter: (i) =>
        i.customId === "select-division-for-callout" &&
        i.user.id === interaction.user.id,
      time: 60000,
    });

    collector?.on("collect", async (i: StringSelectMenuInteraction) => {
      collector.stop();
      const selectedDivisionId = i.values[0];
      const userId = i.user.id;
      const timestamp = Math.floor(Date.now() / 1000);

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
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          incidentTypeInput
        );
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

      await i.showModal(modal);

      try {
        const modalInteraction = await i.awaitModalSubmit({
          time: 120000,
          filter: async (i) => {
            const filter =
              i.customId === "callout-info-modal" && i.user.id === userId;
            if (filter) {
              await i.deferReply();
            }
            return filter;
          },
        });

        const incidentType = modalInteraction.fields.getTextInputValue(
          "callout-incident-type-input"
        );
        const incidentLocation = modalInteraction.fields.getTextInputValue(
          "callout-incident-location-input"
        );
        const incidentDetails = modalInteraction.fields.getTextInputValue(
          "callout-incident-details-input"
        );
        const incidentChannel = modalInteraction.fields.getTextInputValue(
          "callout-channel-input"
        );

        const callout = await Callout.create({
          guildId,
          channelId: i.channel!.id,
          messageId: "",
          userId,
          divisionId: selectedDivisionId,
          incidentType,
          incidentLocation,
          incidentDetails,
          incidentChannel,
          status: "active",
          timestamp,
        });
        const division = divisions.find(
          (div) => div._id!.toString() === selectedDivisionId
        );

        if (!division) {
          await modalInteraction.reply({
            content: "Не удалось найти информацию о дивизионе.",
            ephemeral: true,
          });
          return;
        }

        const roleColor = getRoleColor(
          interaction as Interaction,
          division.roleId
        );

        const embed = createCalloutEmbed({
          userId,
          divisionName: division.name,
          divisionLogoUrl: division.logoUrl,
          callout,
          roleColor,
        });

        const row = createCalloutButtons(callout._id as string);

        const message = await modalInteraction.channel?.send({
          content: `<@&${division.roleId}>`,
          embeds: [embed],
          components: [row],
        });

        callout.messageId = message?.id as string;
        await callout.save();

        logger.info(
          `Callout created. Callout: ${callout._id}, guild: ${guildId}`
        );
        await modalInteraction.deleteReply();
      } catch (error) {
        logger.error("Error during modal submission:", error);
        await interaction.followUp({
          content: "Произошла ошибка при обработке формы каллаута.",
          ephemeral: true,
        });
      }
    });

    collector?.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: "Время на выбор дивизиона истекло.",
          ephemeral: true,
        });
      }
    });
  } catch (error) {
    logger.error("Failed to execute /callout command:", error);
    await interaction.reply({
      content: "Произошла ошибка при выполнении команды.",
      ephemeral: true,
    });
  }
}
