import { type Document } from "mongoose";

interface IServerSettings extends Document {
  guildId: string;
  ftpLogChannelId?: string;
  forumLink?: string;
}

interface IQueue extends Document {
  guildId: string;
  userId: string;
  mention: string;
  timestamp: number;
  type: "trainee" | "fto";
}

interface IQueueChannel extends Document {
  guildId: string;
  channelId?: string;
  messageId?: string;
}

interface IDivision extends Document {
  guildId: string;
  roleId: string;
  name: string;
  logoUrl?: string;
}

interface ICallout extends Document {
  guildId: string;
  channelId: string;
  messageId: string;
  userId: string;
  divisionId: string;
  incidentType: string;
  incidentLocation: string;
  incidentDetails: string;
  incidentChannel: string;
  status: "active" | "closed";
  threadId: string;
  timestamp: number;
}
