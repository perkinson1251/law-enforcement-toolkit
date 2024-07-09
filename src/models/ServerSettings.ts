import { IServerSettings } from "@/types";
import logger from "@/utils/logger";
import { Schema, model } from "mongoose";

const serverSettingsSchema = new Schema<IServerSettings>({
  guildId: { type: String, required: true, unique: true },
  ftpLogChannelId: { type: String, default: null },
  forumLink: { type: String, default: "" },
});

const ServerSettingsModel = model<IServerSettings>(
  "server_settings",
  serverSettingsSchema
);

ServerSettingsModel.createCollection().catch((error) => {
  logger.error(`Error creating server settings collection: ${error}`);
  process.exit(1);
});

export default ServerSettingsModel;
