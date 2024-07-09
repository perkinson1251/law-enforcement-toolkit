import Callout from "@/models/Callout";
import logger from "@/utils/logger";

export default async function getLastCallout(
  guildId: string,
  channelId: string,
  userId: string
) {
  try {
    const callouts = await Callout.find({
      guildId,
      channelId,
      userId,
      status: "active",
    }).populate("divisionId");

    return callouts[callouts.length - 1];
  } catch (error) {
    logger.error("Failed to fetch last callout:", error);
    return null;
  }
}
