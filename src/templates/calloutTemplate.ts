import { ICallout } from "@/types";
import getStatusDescription from "@/utils/callous/getStatusDescription";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

interface CalloutTemplateParams {
  userId: string;
  divisionName: string;
  divisionLogoUrl?: string;
  callout: ICallout;
  roleColor: number | undefined;
}

export default function createCalloutEmbed({
  userId,
  divisionName,
  divisionLogoUrl,
  callout,
  roleColor,
}: CalloutTemplateParams) {
  const embed = new EmbedBuilder()
    .setColor(roleColor ?? "Random")
    .setAuthor({ name: `${divisionName} Request` })
    .setTitle("CALLOUT")
    .addFields(
      { name: "ЗАПРОС ОТПРАВИЛ:", value: `<@${userId}>`, inline: false },
      { name: "ТИП ИНЦИДЕНТА:", value: callout.incidentType, inline: false },
      { name: "ЛОКАЦИЯ:", value: callout.incidentLocation, inline: false },
      {
        name: "ДЕТАЛИ ИНЦИДЕНТА:",
        value: callout.incidentDetails,
        inline: false,
      },
      {
        name: "КАНАЛ В TEAMSPEAK:",
        value: callout.incidentChannel,
        inline: false,
      },
      {
        name: "СТАТУС:",
        value: getStatusDescription(callout.status),
        inline: false,
      },
      {
        name: "СОЗДАН:",
        value: `<t:${callout.timestamp}:R>`,
        inline: false,
      }
    );

  if (divisionLogoUrl) {
    embed.setThumbnail(divisionLogoUrl);
  }

  return embed;
}

export function createCalloutButtons(
  calloutId: string,
  isDeBriefOff: boolean = false
) {
  const statusButton = new ButtonBuilder()
    .setCustomId(`callout-status-button-${calloutId}`)
    .setLabel("Изменить статус")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🛠️");

  const deBriefButton = new ButtonBuilder()
    .setCustomId(`callout-deBrief-button-${calloutId}`)
    .setLabel("Обновить детали")
    .setDisabled(isDeBriefOff)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("✏️");

  const threadButton = new ButtonBuilder()
    .setCustomId(`callout-thread-button-${calloutId}`)
    .setLabel("Создать ветку")
    .setStyle(ButtonStyle.Success)
    .setEmoji("📂");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    statusButton,
    deBriefButton,
    threadButton
  );

  return row;
}
