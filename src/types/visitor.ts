export interface Visitor {
  id: string;
  fullName: string;
  reasonForVisit: ReasonForVisit;
  otherReason?: string;
  personToMeet: string;
  checkInTime: string;
  checkOutTime?: string;
  photo?: string;
  phoneNumber?: string;
}

export type ReasonForVisit = 'client-meeting' | 'interview' | 'delivery' | 'internal-guest' | 'other';

export const REASON_OPTIONS: { value: ReasonForVisit; label: string }[] = [
  { value: 'client-meeting', label: 'Client Meeting' },
  { value: 'interview', label: 'Interview' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'internal-guest', label: 'Internal Guest' },
  { value: 'other', label: 'Other' },
];