import apiClient from "@/lib/api-client";
import type { Video, VideoStatus } from "@/types/video";

type VideoApiResponse = {
  id: string | number;
  equipment_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  result_url?: string | null;
  prompt?: string | null;
  task_id?: string | null;
};

const normalizeStatus = (status?: string | null): VideoStatus => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "success" || normalized === "processing" || normalized === "failed") {
    return normalized;
  }
  return "processing";
};

const normalizeDate = (value?: string | null): string => {
  if (!value) {
    return new Date().toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const mapVideo = (payload: VideoApiResponse): Video => ({
  id: String(payload.id),
  equipmentId: payload.equipment_id ?? "",
  createdAt: normalizeDate(payload.created_at),
  status: normalizeStatus(payload.status),
  resultUrl: payload.result_url && payload.result_url.trim() !== "" ? payload.result_url : null,
  prompt: payload.prompt?.trim() ? payload.prompt : "Untitled video",
  taskId: payload.task_id ?? null,
});

export const getVideos = async (): Promise<Video[]> => {
  const { data } = await apiClient.get<VideoApiResponse[]>("/videos");
  return data.map(mapVideo);
};

export const deleteVideo = async (videoId: string): Promise<void> => {
  await apiClient.delete(`/videos/${videoId}`);
};
