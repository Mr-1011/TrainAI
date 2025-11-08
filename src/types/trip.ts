// Trip types matching backend models

export interface Trip {
  id: string;
  passport_id: string;
  country_code: string | null;
  entrance_date: string | null;
  exit_date: string | null;
}

export interface CreateTripRequest {
  country_code: string;
  entrance_date?: string | null;
  exit_date?: string | null;
}

export interface UpdateTripRequest {
  country_code?: string | null;
  entrance_date?: string | null;
  exit_date?: string | null;
}
