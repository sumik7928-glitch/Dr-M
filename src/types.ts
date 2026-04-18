export type City = 'Hyderabad' | 'Mirpurkhas';

export interface Clinic {
  id: string;
  city: City;
  name: string;
  address: string;
  mapUrl: string;
  phone: string;
  workingDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  workingHours: {
    start: string; // HH:mm format
    end: string;
  };
}

export interface TimeSlot {
  id: string;
  label: string;
  period: 'Morning' | 'Evening';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  symptoms: string;
  city: City;
  clinicLocation: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'unpaid' | 'pay_at_clinic';
  paymentMethod?: 'easypaisa' | 'jazzcash' | 'cash';
  fee: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'patient' | 'doctor' | 'admin';
}
