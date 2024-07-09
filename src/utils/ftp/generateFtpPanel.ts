import { config } from "@/config";
import Queue from "@/models/Queue";
import { ftpPanelTemplate } from "@/templates/ftpPanelTemplate";

export const generateFtpPanel = async (guildId: string) => {
  const traineeQueue = await Queue.find({ guildId, type: "trainee" });
  const ftoQueue = await Queue.find({ guildId, type: "fto" });

  const trainees =
    traineeQueue.map((t) => `${t.mention} - <t:${t.timestamp}:R>`).join("\n") ||
    "Нет стажеров в очереди";
  const ftos =
    ftoQueue.map((t) => `${t.mention} - <t:${t.timestamp}:R>`).join("\n") ||
    "Нет полевых офицеров в очереди";

  const panel = {
    ...ftpPanelTemplate,
    description: ftpPanelTemplate.description.replace(
      "{{AUTO_REMOVE_TIME}}",
      config.autoRemoveTime.toString()
    ),
    fields: [
      { name: "СТАЖЕРЫ", value: trainees, inline: true },
      { name: "ПОЛЕВЫЕ ОФИЦЕРЫ", value: ftos, inline: true },
    ],
  };

  return panel;
};
