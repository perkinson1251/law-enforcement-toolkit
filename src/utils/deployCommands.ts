import commands from "@/commands";
import { config } from "@/config";
import logger from "@/utils/logger";
import { REST, Routes } from "discord.js";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.discordToken);

type DeployCommandsProps = {
  guildId: string;
};

export default async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    logger.info("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.discordClientId, guildId),
      {
        body: commandsData,
      }
    );

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error(`Error while deploying commands. Details: ${error}`);
  }
}
