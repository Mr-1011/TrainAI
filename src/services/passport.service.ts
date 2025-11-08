import apiClient from '@/lib/api-client';
import type {
  Passport,
  CreatePassportRequest,
  UpdatePassportRequest,
  DaysPerCountryResponse,
  UploadResponse,
} from '@/types/passport';

class PassportService {
  /**
   * Create a new passport (authenticated users only)
   */
  async createPassport(data: CreatePassportRequest): Promise<Passport> {
    const response = await apiClient.post<Passport>('/passports/', data);
    return response.data;
  }

  /**
   * Get all passports for the current user
   */
  async getPassports(): Promise<Passport[]> {
    const response = await apiClient.get<Passport[]>('/passports/');
    return response.data;
  }

  /**
   * Get a specific passport by ID
   */
  async getPassport(passportId: string): Promise<Passport> {
    const response = await apiClient.get<Passport>(`/passports/${passportId}`);
    return response.data;
  }

  /**
   * Update a passport
   */
  async updatePassport(
    passportId: string,
    data: UpdatePassportRequest
  ): Promise<Passport> {
    const response = await apiClient.patch<Passport>(
      `/passports/${passportId}`,
      data
    );
    return response.data;
  }

  /**
   * Extract stamps from passport images
   */
  async extractStamps(passportId: string): Promise<string> {
    const response = await apiClient.post<string>(
      '/passports/extract_stamps',
      null,
      {
        params: {
          passport_id: passportId,
        },
      }
    );
    return response.data;
  }

  /**
   * Get days spent per country for a passport
   */
  async getDaysPerCountry(passportId: string): Promise<DaysPerCountryResponse> {
    const response = await apiClient.get<DaysPerCountryResponse>(
      `/passports/${passportId}/days-per-country`
    );
    return response.data;
  }

  /**
   * Upload passport images
   */
  async uploadPassportImages(
    passportId: string,
    files: File[]
  ): Promise<UploadResponse> {
    const formData = new FormData();

    // Add each file to the form data
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<UploadResponse>(
      `/uploads/${passportId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const passportService = new PassportService();
export default passportService;
