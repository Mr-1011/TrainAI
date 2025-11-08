// Passport types matching backend models

export enum PassportStatus {
  CREATED = "created",
  STAMPS_PENDING = "stamps_pending",
  STAMPS_COMPLETED = "stamps_completed",
  STAMPS_FAILED = "stamps_failed",
  STAMPS_REVIEWED = "stamps_reviewed",
}

export interface Passport {
  id: string;
  user_id: string;
  status: PassportStatus;
  created_at: string;
  country_code?: string;
}

export interface CreatePassportRequest {
  country_code?: string;
}

export interface UpdatePassportRequest {
  country_code?: string;
  status?: "verified_by_user";
}

// Stamp extraction
export interface ExtractStampsRequest {
  passport_id: string;
}

// Country stays
export interface EntryExitPair {
  enter: string | null;
  exit: string | null;
  days_total: number;
}

export interface CountryStay {
  country_code: string | null;
  days_spent: number;
  entry_exit_pairs: EntryExitPair[];
}

export interface DaysPerCountryResponse {
  passport_id: string;
  total_countries_visited: number;
  country_stays: CountryStay[];
}

// Upload response
export interface UploadResponse {
  passport_id: string;
  uploaded_files: string[];
  failed_files: string[];
  total_uploaded: number;
}

// Passport Pages
export enum PassportPageStatus {
  UPLOADED = "uploaded",
  ANALYZING = "analyzing",
  ANALYZED = "analyzed",
  VALIDATED = "validated",
  FAILED = "failed",
}

export interface PassportPage {
  id: string;
  passport_id: string;
  source_url: string;
  status: PassportPageStatus;
  created_at?: string;
}

// Stamps
export enum Direction {
  ENTRY = "entry",
  EXIT = "exit",
}

export interface Stamp {
  id: string;
  passport_page_id: string | null;
  country_code: string | null;
  stamp_date: string | null;
  direction: Direction | null;
  confidence: number | null;
  passport_id?: string | null;
}

export interface StampUpdateRequest {
  country_code?: string;
  stamp_date?: string;
  direction?: Direction;
}

export interface StampCreateRequest {
  country_code: string;
  stamp_date: string;
  direction: Direction;
  passport_page_id?: string;
}
