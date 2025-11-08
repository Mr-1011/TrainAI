export type VideoStatus = "success" | "processing" | "failed";

export interface Video {
  id: string;
  equipmentId: string;
  createdAt: string;
  status: VideoStatus;
  resultUrl: string | null;
  prompt: string;
  taskId: string | null;
}
