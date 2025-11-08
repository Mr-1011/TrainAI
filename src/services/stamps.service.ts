import apiClient from '@/lib/api-client';
import type {
  Stamp,
  StampUpdateRequest,
  StampCreateRequest,
} from '@/types/passport';

class StampsService {
  /**
   * Get all stamps for a specific passport page
   */
  async getStampsByPage(passportPageId: string): Promise<Stamp[]> {
    const response = await apiClient.get<Stamp[]>(
      `/stamps/page/${passportPageId}`
    );
    return response.data;
  }

  /**
   * Update an existing stamp
   */
  async updateStamp(
    stampId: string,
    data: StampUpdateRequest
  ): Promise<Stamp> {
    const response = await apiClient.patch<Stamp>(
      `/stamps/stamp/${stampId}`,
      data
    );
    return response.data;
  }

  /**
   * Create a new stamp manually
   */
  async createStamp(
    passportPageId: string,
    data: StampCreateRequest
  ): Promise<Stamp> {
    const response = await apiClient.post<Stamp>(
      `/stamps/${passportPageId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete a stamp
   */
  async deleteStamp(
    stampId: string
  ): Promise<void> {
    await apiClient.delete(`/stamps/stamp/${stampId}`);
  }
}

export const stampsService = new StampsService();
export default stampsService;
