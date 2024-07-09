import { IQueue } from "@/types";
import logger from "@/utils/logger";
import { model, Schema } from "mongoose";

const queueSchema = new Schema<IQueue>({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  mention: { type: String, required: true },
  timestamp: { type: Number, required: true },
  type: { type: String, required: true, enum: ["trainee", "fto"] },
});

const QueueModel = model<IQueue>("queue", queueSchema);

QueueModel.createCollection().catch((error) => {
  logger.error(`Error creating queue collection: ${error}`);
  process.exit(1);
});

export default QueueModel;
