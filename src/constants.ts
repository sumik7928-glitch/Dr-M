import { Clinic, TimeSlot } from './types';

export const CLINICS: Clinic[] = [
  {
    id: 'hyd-1',
    city: 'Hyderabad',
    name: 'Hyderabad Clinic',
    address: 'Main Doctor Line, near Fatima Heights, Saddar, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Main+Doctor+Line+Fatima+Heights+Saddar+Hyderabad',
    phone: '0333-2655847',
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    workingHours: { start: '14:00', end: '22:00' }
  },
  {
    id: 'mpk-1',
    city: 'Mirpurkhas',
    name: 'Mirpurkhas Clinic',
    address: 'Dr Plaza, New Town, Mirpurkhas',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dr+Plaza+New+Town+Mirpurkhas',
    phone: '0333-2655847',
    workingDays: [6], // Saturday only
    workingHours: { start: '09:00', end: '14:00' }
  }
];

export const TIME_SLOTS: TimeSlot[] = [
  // Morning Sessions (9 AM - 2 PM)
  { id: 'm1', label: '09:00 AM - 09:30 AM', period: 'Morning' },
  { id: 'm2', label: '09:30 AM - 10:00 AM', period: 'Morning' },
  { id: 'm3', label: '10:00 AM - 10:30 AM', period: 'Morning' },
  { id: 'm4', label: '10:30 AM - 11:00 AM', period: 'Morning' },
  { id: 'm5', label: '11:00 AM - 11:30 AM', period: 'Morning' },
  { id: 'm6', label: '11:30 AM - 12:00 PM', period: 'Morning' },
  { id: 'm7', label: '12:00 PM - 12:30 PM', period: 'Morning' },
  { id: 'm8', label: '12:30 PM - 01:00 PM', period: 'Morning' },
  { id: 'm9', label: '01:00 PM - 01:30 PM', period: 'Morning' },
  { id: 'm10', label: '01:30 PM - 02:00 PM', period: 'Morning' },
  
  // Afternoon/Evening Sessions (2 PM - 10 PM)
  { id: 'e1', label: '02:00 PM - 02:30 PM', period: 'Evening' },
  { id: 'e2', label: '02:30 PM - 03:00 PM', period: 'Evening' },
  { id: 'e3', label: '03:00 PM - 03:30 PM', period: 'Evening' },
  { id: 'e4', label: '03:30 PM - 04:00 PM', period: 'Evening' },
  { id: 'e5', label: '04:00 PM - 04:30 PM', period: 'Evening' },
  { id: 'e6', label: '04:30 PM - 05:00 PM', period: 'Evening' },
  { id: 'e7', label: '05:00 PM - 05:30 PM', period: 'Evening' },
  { id: 'e8', label: '05:30 PM - 06:00 PM', period: 'Evening' },
  { id: 'e9', label: '06:00 PM - 06:30 PM', period: 'Evening' },
  { id: 'e10', label: '06:30 PM - 07:00 PM', period: 'Evening' },
  { id: 'e11', label: '07:00 PM - 07:30 PM', period: 'Evening' },
  { id: 'e12', label: '07:30 PM - 08:00 PM', period: 'Evening' },
  { id: 'e13', label: '08:00 PM - 08:30 PM', period: 'Evening' },
  { id: 'e14', label: '08:30 PM - 09:00 PM', period: 'Evening' },
  { id: 'e15', label: '09:00 PM - 09:30 PM', period: 'Evening' },
  { id: 'e16', label: '09:30 PM - 10:00 PM', period: 'Evening' }
];

export const DOCTOR_INFO = {
  name: 'Dr. Mubeen Ahmed Memon',
  title: 'Assistant Professor Incharge Department of Pulmonology',
  department: 'Department of Pulmonology',
  specialty: 'Consultant Chest Specialist',
  image: 'https://apnahyderabad.pk/wp-content/uploads/2021/08/dr-mubeen-ahmed-memon.jpg',
  qualifications: 'MBBS, FCPS (Pulmonology)',
  consultationFee: 1500
};
