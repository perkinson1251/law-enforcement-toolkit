import DivisionScheme from "@/models/Division";
import calloutSelectDivTemplate from "@/templates/calloutSelectDivTemplate";
import { IDivision } from "@/types";
import logger from "@/utils/logger";
import {
  ActionRowBuilder,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("callout")
  .setDescription("Создает каллаут.");

export async function execute(interaction: CommandInteraction) {
  try {
    const guildId = interaction.guild!.id;
    const divisions = await DivisionScheme.find({ guildId });

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
  } catch (error) {
    logger.error("Failed to execute /callout command:", error);
    await interaction.reply({
      content: "Произошла ошибка при выполнении команды.",
      ephemeral: true,
    });
  }
}
