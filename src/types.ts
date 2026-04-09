export type Role = 'tenant' | 'owner' | 'admin';
export type KYCStatus = 'pending' | 'verified' | 'rejected';
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled';
export type AgreementStatus = 'pending' | 'active' | 'expired' | 'terminated';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentType = 'rent' | 'maintenance' | 'deposit';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: Role;
  phone?: string;
  tempPassword?: string;
  kycStatus?: KYCStatus;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  area: string;
  rent: number;
  maintenance: number;
  bedrooms: number;
  amenities: string[];
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  isOccupied?: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export interface SiteVisit {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName?: string;
  scheduledAt: string;
  status: VisitStatus;
  tenantInterested?: boolean;
}

export interface Agreement {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  rent: number;
  deposit: number;
  startDate: string;
  durationMonths: number;
  status: AgreementStatus;
  tenantSigned?: boolean;
  ownerSigned?: boolean;
  exitRequested?: boolean;
  exitDate?: string;
  vacateDate?: string;
}

export interface Payment {
  id: string;
  agreementId: string;
  tenantId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  paidAt?: string;
  dueDate: string;
}
