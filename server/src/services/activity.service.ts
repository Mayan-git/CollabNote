import { Types } from 'mongoose';
import { ActivityModel, ActivityAction } from '../models/Activity.model';

interface LogActivityInput {
  actor: string | Types.ObjectId;
  action: ActivityAction;
  targetNote?: string | Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export const activityService = {
  async log(input: LogActivityInput): Promise<void> {
    await ActivityModel.create(input);
  },
};
