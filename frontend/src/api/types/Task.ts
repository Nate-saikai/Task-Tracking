import { type Status } from './Status';

export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  trackingStatus: Status;
  userId: number;
  username: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  trackingStatus?: Status;
}