import { Interaction } from "discord.js";
import logger from "./logger";

export default function getRoleColorById(
  interaction: Interaction,
  roleId: string
) {
  try {
    const role = interaction.guild!.roles.cache.get(roleId);
    return parseInt(role!.color.toString(16).padStart(6, "0"), 16);
  } catch (error) {
    logger.error(`Error when receiving a role (getRoleColorById): ${error}`);
    return undefined;
  }
}
