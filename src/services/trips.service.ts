import apiClient from '@/lib/api-client';
import type { Trip, CreateTripRequest, UpdateTripRequest } from '@/types/trip';

class TripsService {
  /**
   * Get all trips for a passport
   */
  async getTripsByPassport(passportId: string): Promise<Trip[]> {
    const response = await apiClient.get<Trip[]>(`/trips/passport/${passportId}`);
    return response.data;
  }

  /**
   * Create a new trip
   */
  async createTrip(passportId: string, data: CreateTripRequest): Promise<Trip> {
    const response = await apiClient.post<Trip>(`/trips/passport/${passportId}`, data);
    return response.data;
  }

  /**
   * Update an existing trip
   */
  async updateTrip(tripId: string, data: UpdateTripRequest): Promise<Trip> {
    const response = await apiClient.patch<Trip>(`/trips/${tripId}`, data);
    return response.data;
  }

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    await apiClient.delete(`/trips/${tripId}`);
  }
}

export const tripsService = new TripsService();
export default tripsService;
