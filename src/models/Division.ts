import { IDivision } from "@/types";
import logger from "@/utils/logger";
import { model, Schema } from "mongoose";

const divisionSchema = new Schema<IDivision>({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  name: { type: String, required: true },
  logoUrl: { type: String },
});

const DivisionModel = model<IDivision>("divisions", divisionSchema);

DivisionModel.createCollection().catch((error) => {
  logger.error(`Error creating divisions collection: ${error}`);
  process.exit(1);
});

export default DivisionModel;
