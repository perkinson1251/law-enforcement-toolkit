import commands from "@/commands";
import { handleCalloutButtons } from "@/handlers/callouts/calloutButtonsHandler";
import { handleSubmitCalloutDeBriefForm } from "@/handlers/callouts/calloutDeBriefFormHandler";
import { handleSubmitCalloutForm } from "@/handlers/callouts/calloutFormHandler";
import { handleSelectDivisionForCallout } from "@/handlers/callouts/selectDivForCalloutHandler";
import { handleSelectCalloutStatus } from "@/handlers/callouts/selectStatusHandler";
import { handleDeleteDivisionSelectMenuInteraction } from "@/handlers/divisions/chooseDivHandler";
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
    const calloutId = customId.split("-").pop();
    try {
      switch (customId) {
        case "delete-selected-division":
          await handleDeleteDivisionSelectMenuInteraction(interaction);
          break;
        case "select-division-for-callout":
          await handleSelectDivisionForCallout(interaction);
          break;
        case `select-status-${calloutId}`:
          await handleSelectCalloutStatus(interaction, calloutId!);
          break;
        default:
          logger.error(`Unhandled select menu: ${customId}`);
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
    const calloutId = customId.split("-").pop();
    try {
      switch (customId) {
        case "callout-info-modal":
          await handleSubmitCalloutForm(interaction);
          break;
        case `callout-debrief-${calloutId}`:
          await handleSubmitCalloutDeBriefForm(interaction, calloutId!);
          break;
        default:
          logger.info(`Unhandled modal submit: ${customId}`);
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
