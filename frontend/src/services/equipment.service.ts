import apiClient from "@/lib/api-client";
import type { Equipment, EquipmentFileType } from "@/types/equipment";

type EquipmentApiResponse = Omit<Equipment, "manuals" | "images"> & {
  manuals?: string[] | null;
  images?: string[] | null;
};

const mapEquipment = (payload: EquipmentApiResponse): Equipment => ({
  id: payload.id,
  name: payload.name,
  manuals: Array.isArray(payload.manuals) ? payload.manuals : [],
  images: Array.isArray(payload.images) ? payload.images : [],
});

export const getEquipments = async (): Promise<Equipment[]> => {
  const { data } = await apiClient.get<EquipmentApiResponse[]>("/equipments");
  return data.map(mapEquipment);
};

export const createEquipment = async (
  payload: Pick<Equipment, "name">,
): Promise<Equipment> => {
  const { data } = await apiClient.post<EquipmentApiResponse>(
    "/equipments",
    payload,
  );
  return mapEquipment(data);
};

export const updateEquipment = async (
  equipmentId: string,
  payload: Pick<Equipment, "name">,
): Promise<Equipment> => {
  const { data } = await apiClient.patch<EquipmentApiResponse>(
    `/equipments/${equipmentId}`,
    payload,
  );
  return mapEquipment(data);
};

interface UploadEquipmentFilePayload {
  equipmentId: string;
  file: File;
  type: EquipmentFileType;
}

export const uploadEquipmentFile = async ({
  equipmentId,
  file,
  type,
}: UploadEquipmentFilePayload): Promise<Equipment> => {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint =
    type === "manual"
      ? `/equipments/${equipmentId}/manuals`
      : `/equipments/${equipmentId}/images`;

  const { data } = await apiClient.post<EquipmentApiResponse>(
    endpoint,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return mapEquipment(data);
};

interface DeleteEquipmentFilePayload {
  equipmentId: string;
  url: string;
  type: EquipmentFileType;
}

export const deleteEquipmentFile = async ({
  equipmentId,
  url,
  type,
}: DeleteEquipmentFilePayload): Promise<Equipment> => {
  const endpoint =
    type === "manual"
      ? `/equipments/${equipmentId}/manuals`
      : `/equipments/${equipmentId}/images`;

  const { data } = await apiClient.delete<EquipmentApiResponse>(endpoint, {
    params: { url },
  });

  return mapEquipment(data);
};
