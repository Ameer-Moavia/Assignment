import { AttachmentTypeEnum, EventTypeEnum, RoleEnum } from "../enums";

export type UserDTO = {
  id: number;
  email: string;
  role: RoleEnum;
  name?: string | null;
}

export type AttachmentDTO = {
  id?: number;
  url: string;
  publicId?: string;
  type: AttachmentTypeEnum;
}

export type EventDTO = {
 title: string;
  description: string;
  type: EventTypeEnum;
  venue?: string;
  joinLink?: string;
  contactInfo?: string;
  totalSeats?: number;
  requiresApproval?: boolean;
  joinQuestions?: string; // JSON string
  startDate: string;
  endDate: string;
  organizerId: number;
  attachments?: { url: string; type: "IMAGE" | "VIDEO"; publicId?: string }[];
}

export type Paginated<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}


export type VerificationState = {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}