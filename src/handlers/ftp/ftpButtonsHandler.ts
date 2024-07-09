import Queue from "@/models/Queue";
import { ftpDmTemplate } from "@/templates/ftpDmTemplate";
import updateQueues from "@/utils/ftp/updateQueues";
import logToChannel from "@/utils/logToChannel";
import logger from "@/utils/logger";
import sendEmbedToUser from "@/utils/sendEmbed";
import { ButtonInteraction, Client, EmbedBuilder } from "discord.js";

export async function handleFtpButtons(
  interaction: ButtonInteraction,
  client: Client
) {
  const customId = interaction.customId;
  switch (customId) {
    case "trainee":
      await handleTraineeButton(interaction);
      await updateQueues(client);
      break;
    case "take":
      await handleTakeButton(interaction);
      await updateQueues(client);
      break;
    case "fto":
      await handleFtoButton(interaction);
      await updateQueues(client);
      break;
  }
}

async function handleTraineeButton(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild?.id;

  if (!guildId) {
    logger.error("Guild ID is undefined.");
    return;
  }

  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);

  const existingEntry = await Queue.findOne({
    guildId,
    userId,
    type: "trainee",
  });

  if (!existingEntry) {
    await Queue.create({
      guildId,
      userId,
      mention,
      timestamp,
      type: "trainee",
    });
    await interaction.reply({
      content: `Вы встали в очередь как стажер.`,
      ephemeral: true,
    });
    logger.info(`Trainee ${userId} in guild ${guildId} added to queue.`);
    await logToChannel(
      interaction.client,
      guildId,
      `Стажёр <@${userId}> встал в очередь стажёров.`
    );
  } else {
    await Queue.deleteOne({ guildId, userId, type: "trainee" });
    await interaction.reply({
      content: `Вы вышли из очереди.`,
      ephemeral: true,
    });
    logger.info(`Trainee ${userId} in guild ${guildId} left the queue.`);
    await logToChannel(
      interaction.client,
      guildId,
      `Стажёр <@${userId}> самостоятельно вышел из очереди.`
    );
  }
}

async function handleTakeButton(interaction: ButtonInteraction) {
  const guildId = interaction.guild?.id;
  const ftoUserId = interaction.user.id;

  if (!guildId) {
    logger.error("Guild ID is undefined.");
    return;
  }

  const ftoMention = `<@${ftoUserId}>`;

  await Queue.deleteOne({ guildId, userId: ftoUserId, type: "fto" });
  const trainee = await Queue.findOne({ guildId, type: "trainee" }).sort({
    timestamp: 1,
  });

  if (!trainee) {
    await interaction.reply({
      content: "Очередь стажеров пуста.",
      ephemeral: true,
    });
    return;
  }

  if (ftoUserId === trainee.userId) {
    await interaction.reply({
      content: "Вы не можете взять сами себя.",
      ephemeral: true,
    });
    return;
  }

  await Queue.deleteOne({ guildId, userId: trainee.userId, type: "trainee" });
  logger.info(
    `FTO ${ftoUserId} in guild ${guildId} took trainee ${trainee.userId}.`
  );

  const guild = interaction.guild!;
  const guildAvatarURL = guild.iconURL() || undefined;
  const embedData = ftpDmTemplate.traineeTakenEmbed(
    ftoMention,
    guild.name,
    guildAvatarURL
  );
  const embed = new EmbedBuilder(embedData);

  const traineeMember = await guild.members.fetch(trainee.userId);
  await sendEmbedToUser(traineeMember.user, embed);

  await logToChannel(
    interaction.client,
    guildId,
    `FTO ${ftoMention} взял из очереди стажёра ${trainee.mention}.`
  );
}

async function handleFtoButton(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guild?.id;

  if (!guildId) {
    logger.error("Guild ID is undefined.");
    return;
  }

  const mention = `<@${userId}>`;
  const timestamp = Math.floor(Date.now() / 1000);

  const existingEntry = await Queue.findOne({ guildId, userId, type: "fto" });

  if (!existingEntry) {
    await Queue.create({ guildId, userId, mention, timestamp, type: "fto" });
    await interaction.reply({
      content: `Вы встали в очередь как наставник.`,
      ephemeral: true,
    });
    logger.info(`FTO ${userId} in guild ${guildId} added to queue.`);
    await logToChannel(
      interaction.client,
      guildId,
      `FTO <@${userId}> встал в очередь наставников.`
    );
  } else {
    await Queue.deleteOne({ guildId, userId, type: "fto" });
    await interaction.reply({
      content: `Вы вышли из очереди.`,
      ephemeral: true,
    });
    logger.info(`FTO ${userId} in guild ${guildId} left the queue.`);
    await logToChannel(
      interaction.client,
      guildId,
      `FTO <@${userId}> самостоятельно вышел из очереди.`
    );
  }
}
