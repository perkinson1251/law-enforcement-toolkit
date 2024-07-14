import Division from "@/models/Division";
import { IDivision } from "@/types";
import isAdmin from "@/utils/isAdmin";
import logger from "@/utils/logger";
import {
  ActionRowBuilder,
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("deletedivision")
  .setDescription("Удаляет дивизион");

export async function execute(interaction: CommandInteraction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({
      content: "У вас нет прав для выполнения этой команды.",
      ephemeral: true,
    });
    return;
  }

  const guildId = interaction.guild!.id;
  const divisions = await Division.find({ guildId });

  if (divisions.length === 0) {
    await interaction.reply({
      content: "На этом сервере нет созданных дивизионов.",
      ephemeral: true,
    });
    return;
  }

  const options = divisions.map((division: IDivision) => ({
    label: division.name,
    value: division._id!.toString(),
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("delete-selected-division")
    .setPlaceholder("Выберите дивизион для удаления")
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu
  );

  await interaction.reply({
    content: "Выберите дивизион, который хотите удалить:",
    components: [row],
    ephemeral: true,
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    filter: (i) =>
      i.customId === "delete-selected-division" &&
      i.user.id === interaction.user.id,
    time: 60000,
  });

  collector?.on("collect", async (i: StringSelectMenuInteraction) => {
    collector.stop();
    const selectedDivisionId = i.values[0];

    try {
      const division = await Division.findOneAndDelete({
        _id: selectedDivisionId,
        guildId,
      });

      if (!division) {
        await i.reply({
          content: "Дивизион не найден или уже был удален.",
          ephemeral: true,
        });
        return;
      }

      await i.reply({
        content: `Дивизион **${division.name}** успешно удален.`,
        ephemeral: true,
      });

      logger.info(
        `Division deleted: ${division.name} (Role: ${division.roleId}, Guild: ${guildId})`
      );
    } catch (error) {
      logger.error("Failed to delete division: ", error);
      await i.reply({
        content: "Произошла ошибка при удалении дивизиона.",
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
}
