import { IQueueChannel } from "@/types";
import logger from "@/utils/logger";
import { Schema, model } from "mongoose";

const queueChannelSchema = new Schema<IQueueChannel>({
  guildId: { type: String, required: true },
  channelId: { type: String, default: null },
  messageId: { type: String, default: null },
});

const QueueChannelModel = model<IQueueChannel>(
  "queue_channels",
  queueChannelSchema
);

QueueChannelModel.createCollection().catch((error) => {
  logger.error(`Error creating queue channels collection: ${error}`);
  process.exit(1);
});

export default QueueChannelModel;
