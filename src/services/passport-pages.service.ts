import apiClient from '@/lib/api-client';
import type { PassportPage } from '@/types/passport';
import { PassportPageStatus } from '@/types/passport';

class PassportPagesService {
  /**
   * Get all passport pages for a specific passport
   */
  async getPassportPages(passportId: string): Promise<PassportPage[]> {
    const response = await apiClient.get<PassportPage[]>(
      `/passport-pages/passport/${passportId}`
    );
    return response.data;
  }

  private async updatePassportPageStatus(
    passportPageId: string,
    status: PassportPageStatus
  ): Promise<PassportPage> {
    const response = await apiClient.patch<PassportPage>(
      `/passport-pages/${passportPageId}`,
      { status }
    );
    return response.data;
  }

  /**
   * Mark a passport page as validated
   */
  async validatePassportPage(
    passportPageId: string
  ): Promise<PassportPage> {
    return this.updatePassportPageStatus(passportPageId, PassportPageStatus.VALIDATED);
  }

  /**
   * Mark a passport page as not validated
   */
  async unvalidatePassportPage(
    passportPageId: string
  ): Promise<PassportPage> {
    return this.updatePassportPageStatus(passportPageId, PassportPageStatus.ANALYZED);
  }

  /**
   * Delete a passport page
   */
  async deletePassportPage(
    passportPageId: string
  ): Promise<void> {
    await apiClient.delete(`/passport-pages/${passportPageId}`);
  }
}

export const passportPagesService = new PassportPagesService();
export default passportPagesService;
