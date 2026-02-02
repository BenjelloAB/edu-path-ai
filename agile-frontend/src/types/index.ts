export type LicenceMajor = 'Math-Info' | 'Physique' | 'BCG';

export interface UserProfile {
  name: string;
  email: string;
  major: LicenceMajor;
  establishment: string;
  year: 'L1' | 'L2' | 'L3';
}

export interface PredictionResult {
  master: string;
  probability: number;
}