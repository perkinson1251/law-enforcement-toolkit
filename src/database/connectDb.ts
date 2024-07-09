import { config } from "@/config";
import logger from "@/utils/logger";
import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db!, {
      autoCreate: true,
    } as ConnectOptions);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error while connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
