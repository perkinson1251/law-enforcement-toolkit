import commands from "@/commands";
import { handleCalloutButtons } from "@/handlers/callouts/calloutButtonsHandler";
import { handleFtpButtons } from "@/handlers/ftp/ftpButtonsHandler";
import logger from "@/utils/logger";
import { ButtonInteraction, Interaction } from "discord.js";
import client from "..";

export default async (interaction: Interaction): Promise<void> => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;
    logger.info(`Received command: ${commandName}`);
    const command = commands[commandName as keyof typeof commands];

    if (command) {
      try {
        logger.info(`Executing command: ${commandName}`);
        await command.execute(interaction);
        logger.info(`Command executed: ${commandName}`);
      } catch (error) {
        logger.error(`Error executing ${commandName}:`, error);
        await interaction.reply({
          content: "Что-то пошло не так...",
          ephemeral: true,
        });
      }
    } else {
      logger.error(`Command not found: ${commandName}`);
    }
  }

  if (interaction.isButton()) {
    const customId = interaction.customId;
    logger.info(`Button pressed: ${customId}`);
    try {
      await handleFtpButtons(interaction as ButtonInteraction, client);
      await handleCalloutButtons(interaction as ButtonInteraction);
    } catch (error) {
      logger.error(`Error handling button interaction ${customId}:`, error);
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;
    try {
      switch (customId) {
        default:
          logger.info(`Select menu submit: ${customId}`);
          break;
      }
    } catch (error) {
      logger.error(
        `Error handling select menu interaction ${customId}:`,
        error
      );
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }

  if (interaction.isModalSubmit()) {
    const customId = interaction.customId;
    try {
      switch (customId) {
        default:
          logger.info(`Modal submit: ${customId}`);
          break;
      }
    } catch (error) {
      logger.error(
        `Error handling modal submit interaction ${customId}:`,
        error
      );
      await interaction.reply({
        content: "Что-то пошло не так...",
        ephemeral: true,
      });
    }
  }
};
