import { ICallout } from "@/types";
import logger from "@/utils/logger";
import { model, Schema } from "mongoose";

const calloutSchema = new Schema<ICallout>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, default: "" },
  userId: { type: String, required: true },
  divisionId: { type: String, required: true },
  incidentType: { type: String, default: "" },
  incidentLocation: { type: String, default: "" },
  incidentDetails: { type: String, default: "" },
  incidentChannel: { type: String, default: "" },
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active",
  },
  threadId: { type: String, default: "" },
  timestamp: { type: Number, required: true },
});

const CalloutModel = model<ICallout>("callouts", calloutSchema);

CalloutModel.createCollection().catch((error) => {
  logger.error(`Error creating callouts collection: ${error}`);
  process.exit(1);
});

export default CalloutModel;
