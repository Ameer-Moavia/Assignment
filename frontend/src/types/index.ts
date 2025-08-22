export type Role = "ADMIN" | "ORGANIZER" | "PARTICIPANT";
export type EventType = "ONSITE" | "ONLINE";
export type AttachmentType = "IMAGE" | "VIDEO";
export type ParticipationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

export interface UserDTO {
  id: number;
  email: string;
  role: Role;
  name?: string | null;
}

export interface AttachmentDTO {
  id?: number;
  url: string;
  publicId?: string;
  type: AttachmentType;
}

export interface EventDTO {
  id: number;
  title: string;
  description: string;
  type: EventType;
  venue?: string | null;
  joinLink?: string | null;
  contactInfo?: string | null;
  totalSeats?: number | null;
  requiresApproval: boolean;
  joinQuestions?: any;
  startDate: string;
  endDate: string;
  createdAt: string;
  organizer?: { id: number; name: string };
  attachments?: AttachmentDTO[];
  confirmedParticipants?: number;
}

export interface Paginated<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}
