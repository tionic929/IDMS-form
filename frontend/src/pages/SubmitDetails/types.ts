export type UserType = 'STUDENT' | 'EMPLOYEE' | null;
export type ApplicationType = 'NEW' | 'OLD' | null;
export type VerificationStatus = 'idle' | 'valid' | 'invalid';
export type ApplicationStatus = 'idle' | 'pending' | 'approved' | 'rejected';
export type SigType = 'draw' | 'upload';

export interface FormState {
    idNumber: string;
    manual_full_name: string;
    email: string;
    course: string;
    schoolLevel: string;
    address: string;
    guardianName: string;
    guardianContact: string;
    lrn: string;
    department: string;
    contactInfo: string;
    id_picture: File | null;
    signature_picture: File | null;
    payment_type: 'COR' | 'OR' | 'HR_FORM' | '';
    payment_proof: File | null;
    reissuance_reason: string;
}

export interface StepLabel {
    label: string;
    icon: React.ReactNode;
}