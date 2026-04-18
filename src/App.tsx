import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight, 
  LogOut, 
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Navigation,
  CreditCard,
  Wallet,
  Banknote,
  Receipt,
  Share2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { useAppointments } from './hooks/useAppointments';
import { CLINICS, DOCTOR_INFO, TIME_SLOTS } from './constants';
import { Appointment, City } from './types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { DoctorPanel } from './components/DoctorPanel';
import { WhatsAppIcon } from './components/WhatsAppIcon';

type Screen = 'home' | 'booking' | 'appointments' | 'contact';
type AuthStep = 'role-selection' | 'patient-login' | 'doctor-auth';

export default function App() {
  const { user, profile, loading: authLoading, loginWithGoogle, loginWithEmail, registerDoctor, logout, resetPassword } = useAuth();
  const { appointments, loading: appointmentsLoading, bookAppointment, cancelAppointment } = useAppointments(user?.uid, profile?.role);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [authStep, setAuthStep] = useState<AuthStep>('role-selection');
  const [doctorAuthMode, setDoctorAuthMode] = useState<'login' | 'register'>('login');
  const [doctorForm, setDoctorForm] = useState({ email: '', password: '', name: '' });
  
  const [bookingStep, setBookingStep] = useState(1);
  const [lastAppointmentId, setLastAppointmentId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<Partial<Appointment>>({
    city: 'Hyderabad',
    clinicLocation: '',
    patientName: '',
    patientAge: 0,
    patientPhone: '',
    symptoms: '',
    date: undefined,
    timeSlot: '',
    status: 'pending',
    fee: DOCTOR_INFO.consultationFee,
    paymentStatus: 'unpaid',
    paymentMethod: 'cash'
  });

  const selectedClinic = CLINICS.find(c => c.name === bookingData.clinicLocation);

  const isDateDisabled = (date: Date) => {
    if (!selectedClinic) return true;
    const day = date.getDay();
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    return isPast || !selectedClinic.workingDays.includes(day);
  };

  const availableSlots = TIME_SLOTS.filter(slot => {
    if (!selectedClinic) return false;
    if (selectedClinic.city === 'Hyderabad') return slot.period === 'Evening';
    if (selectedClinic.city === 'Mirpurkhas') return slot.period === 'Morning';
    return true;
  });

  if (authLoading) {
    return (
      <div className="mobile-container items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  // Doctor Dashbord (if authenticated as doctor)
  if (user && profile?.role === 'doctor') {
    return (
      <div className="mobile-container">
        <DoctorPanel 
          userId={user.uid} 
          doctorName={profile.displayName} 
          onLogout={logout} 
        />
      </div>
    );
  }

  // Auth Screens
  if (!user) {
    return (
      <div className="mobile-container bg-gray-50">
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
          <AnimatePresence mode="wait">
            {authStep === 'role-selection' && (
              <motion.div 
                key="role-selection"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-medical-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Stethoscope className="w-10 h-10 text-medical-primary" />
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Select Your Role</h1>
                  <p className="text-medical-muted">Welcome back! Please tell us who you are.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setAuthStep('patient-login')}
                    className="p-6 bg-white border border-gray-100 rounded-[32px] text-left hover:border-medical-primary/50 hover:shadow-xl hover:shadow-medical-primary/5 transition-all group flex items-center gap-6"
                  >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">Patient</p>
                      <p className="text-xs text-medical-muted">I want to book an appointment</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setAuthStep('doctor-auth')}
                    className="p-6 bg-white border border-gray-100 rounded-[32px] text-left hover:border-medical-primary/50 hover:shadow-xl hover:shadow-medical-primary/5 transition-all group flex items-center gap-6"
                  >
                    <div className="w-16 h-16 bg-medical-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Stethoscope className="h-8 w-8 text-medical-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">Doctor</p>
                      <p className="text-xs text-medical-muted">Access dashboard & schedule</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {authStep === 'patient-login' && (
              <motion.div 
                key="patient-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-8"
              >
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                     <User className="w-8 h-8 text-blue-600" />
                   </div>
                   <h2 className="text-2xl font-bold">Patient Access</h2>
                   <p className="text-sm text-medical-muted">Sign in with your Google account to manage your health appointments.</p>
                </div>
                
                <Button onClick={loginWithGoogle} className="w-full btn-primary h-14 text-lg">
                  Sign in with Google
                </Button>
                
                <button 
                  onClick={() => setAuthStep('role-selection')}
                  className="w-full text-center text-sm font-medium text-medical-muted hover:text-medical-primary pt-4"
                >
                  Change Role
                </button>
              </motion.div>
            )}

            {authStep === 'doctor-auth' && (
              <motion.div 
                key="doctor-auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-6"
              >
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-medical-primary/10 rounded-full flex items-center justify-center mx-auto">
                     <Stethoscope className="w-8 h-8 text-medical-primary" />
                   </div>
                   <h2 className="text-2xl font-bold">{doctorAuthMode === 'login' ? 'Doctor Login' : 'Doctor Registration'}</h2>
                </div>

                <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm">
                   {doctorAuthMode === 'register' && (
                     <div className="space-y-2">
                       <Label>Full Name</Label>
                       <Input 
                         type="text" 
                         placeholder="Dr. Name"
                         value={doctorForm.name}
                         onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                         className="rounded-xl"
                       />
                     </div>
                   )}
                   <div className="space-y-2">
                     <Label>Professional Email</Label>
                     <Input 
                       type="email" 
                       placeholder="doctor@example.com"
                       value={doctorForm.email}
                       onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                       className="rounded-xl"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Password</Label>
                     <Input 
                       type="password" 
                       placeholder="••••••••"
                       value={doctorForm.password}
                       onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                       className="rounded-xl"
                     />
                   </div>
                   <Button 
                    className="w-full btn-primary h-12"
                    onClick={() => {
                      if (doctorAuthMode === 'login') {
                        loginWithEmail(doctorForm.email, doctorForm.password).catch(e => toast.error(e.message));
                      } else {
                        registerDoctor(doctorForm.email, doctorForm.password, doctorForm.name).catch(e => {
                          toast.error(e.message);
                          if (e.message.includes('already in use')) {
                            setDoctorAuthMode('login');
                          }
                        });
                      }
                    }}
                    disabled={!doctorForm.email || !doctorForm.password}
                   >
                     {doctorAuthMode === 'login' ? 'Access Dashboard' : 'Register Profile'}
                   </Button>
                   {doctorAuthMode === 'login' && (
                     <button 
                      onClick={() => {
                        if (doctorForm.email) {
                          resetPassword(doctorForm.email);
                        } else {
                          toast.error('Please enter your email address first.');
                        }
                      }}
                      className="w-full text-center text-xs text-medical-muted hover:text-medical-primary"
                     >
                       Forgot password?
                     </button>
                   )}
                </div>

                <div className="text-center space-y-4">
                  <button 
                    onClick={() => setDoctorAuthMode(doctorAuthMode === 'login' ? 'register' : 'login')}
                    className="text-sm font-semibold text-medical-primary"
                  >
                    {doctorAuthMode === 'login' ? "Don't have a profile? Create one" : "Already have a profile? Login"}
                  </button>
                  <p>
                    <button 
                      onClick={() => setAuthStep('role-selection')}
                      className="text-xs text-medical-muted underline"
                    >
                      Back to Role Selection
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const handleBook = async () => {
    if (!user || !bookingData.patientName || !bookingData.patientPhone || !bookingData.date || !bookingData.timeSlot) return;
    
    const id = await bookAppointment({
      patientId: user.uid,
      patientName: bookingData.patientName,
      patientAge: bookingData.patientAge || 0,
      patientPhone: bookingData.patientPhone,
      symptoms: bookingData.symptoms || '',
      city: bookingData.city as City,
      clinicLocation: bookingData.clinicLocation || '',
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      fee: bookingData.fee || DOCTOR_INFO.consultationFee,
      paymentStatus: bookingData.paymentStatus || 'pay_at_clinic',
      paymentMethod: bookingData.paymentMethod || 'cash',
    });
    
    if (id) {
      toast.success("Appointment Confirmed Successfully!");
      setLastAppointmentId(id);
      setBookingStep(5); // Success step
    }
  };

  const resetBooking = () => {
    setBookingStep(1);
    setBookingData({ 
      city: 'Hyderabad', 
      clinicLocation: '',
      patientName: '',
      patientAge: 0,
      patientPhone: '',
      symptoms: '',
      date: undefined,
      timeSlot: '',
      status: 'pending',
      fee: DOCTOR_INFO.consultationFee,
      paymentStatus: 'unpaid',
      paymentMethod: 'cash'
    });
    setLastAppointmentId(null);
  };

  return (
    <div className="mobile-container">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="p-6 pb-2 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-medical-primary/20">
            <AvatarImage src={user.photoURL || ''} />
            <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-medical-muted">Welcome back,</p>
            <p className="font-semibold">{user.displayName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} className="text-medical-muted">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeScreen === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              {/* Doctor Card */}
              <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                <CardContent className="p-8">
                  <Badge className="bg-white/20 text-white border-none mb-2">Pulmonologist</Badge>
                  <h2 className="text-3xl font-bold mb-1">{DOCTOR_INFO.name}</h2>
                  <p className="text-white/80 text-sm mb-6">{DOCTOR_INFO.title}</p>
                  <div className="flex items-center gap-2 text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm w-fit">
                    <Stethoscope className="h-5 w-5" />
                    <span>{DOCTOR_INFO.specialty}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveScreen('booking')}
                  className="h-32 flex flex-col gap-2 bg-white hover:bg-medical-primary/5 text-medical-text border-none shadow-sm rounded-3xl"
                >
                  <div className="w-10 h-10 bg-medical-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="text-medical-primary" />
                  </div>
                  <span className="font-semibold">Book Now</span>
                </Button>
                <Button 
                  asChild
                  className="h-32 flex flex-col gap-2 bg-white hover:bg-medical-primary/5 text-medical-text border-none shadow-sm rounded-3xl"
                >
                  <a href={`tel:${CLINICS[0].phone}`}>
                    <div className="w-10 h-10 bg-medical-accent/10 rounded-full flex items-center justify-center">
                      <Phone className="text-medical-accent" />
                    </div>
                    <span className="font-semibold">Call Clinic</span>
                  </a>
                </Button>
                <Button 
                  asChild
                  className="h-32 flex flex-col gap-2 bg-white hover:bg-medical-primary/5 text-medical-text border-none shadow-sm rounded-3xl col-span-2"
                >
                  <a href="https://wa.me/923332655847" target="_blank" rel="noreferrer">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <WhatsAppIcon className="text-green-600 h-6 w-6" />
                    </div>
                    <span className="font-semibold">WhatsApp Us</span>
                  </a>
                </Button>
              </div>

              {/* Clinics */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-medical-primary" />
                  Clinic Locations
                </h3>
                <div className="space-y-4">
                  {CLINICS.map(clinic => (
                    <Card key={clinic.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Navigation className="text-medical-muted" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{clinic.name}</h4>
                          <p className="text-sm text-medical-muted mb-2">{clinic.address}</p>
                          <div className="flex gap-2">
                            <Button variant="link" className="p-0 h-auto text-medical-primary text-xs" asChild>
                              <a href={clinic.mapUrl} target="_blank" rel="noreferrer">Get Directions</a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeScreen === 'booking' && (
            <motion.div 
              key="booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" onClick={() => setActiveScreen('home')}>
                  <ChevronRight className="rotate-180" />
                </Button>
                <h2 className="text-2xl font-bold">Book Appointment</h2>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4].map(step => (
                  <div 
                    key={step} 
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all",
                      bookingStep >= step ? "bg-medical-primary" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>

              {bookingStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Select City</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Hyderabad', 'Mirpurkhas'] as City[]).map(city => (
                        <Button
                          key={city}
                          variant={bookingData.city === city ? 'default' : 'outline'}
                          onClick={() => setBookingData({ ...bookingData, city, clinicLocation: CLINICS.find(c => c.city === city)?.name || '' })}
                          className={cn(
                            "h-12 rounded-xl",
                            bookingData.city === city ? "bg-medical-primary" : "border-gray-200"
                          )}
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Select Clinic</Label>
                    <Select 
                      value={bookingData.clinicLocation} 
                      onValueChange={(val) => setBookingData({ ...bookingData, clinicLocation: val })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-200">
                        <SelectValue placeholder="Choose clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLINICS.filter(c => c.city === bookingData.city).map(clinic => (
                          <SelectItem key={clinic.id} value={clinic.name}>{clinic.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full btn-primary h-14 mt-8"
                    disabled={!bookingData.city || !bookingData.clinicLocation}
                    onClick={() => setBookingStep(2)}
                  >
                    Next Step
                  </Button>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <Label>Select Date</Label>
                      {bookingData.date && !selectedClinic?.workingDays.includes(new Date(bookingData.date).getDay()) && (
                        <span className="text-[10px] font-bold text-red-500 animate-pulse uppercase">Clinic Closed</span>
                      )}
                    </div>
                    <div className="border rounded-2xl p-2 bg-white border-gray-100">
                      <CalendarComponent
                        mode="single"
                        selected={bookingData.date ? new Date(bookingData.date) : undefined}
                        onSelect={(date) => {
                          if (date && selectedClinic?.workingDays.includes(date.getDay())) {
                            setBookingData({ ...bookingData, date: date?.toISOString(), timeSlot: undefined });
                          } else if (date) {
                            toast.error("Doctor is not available on this day.");
                          }
                        }}
                        disabled={isDateDisabled}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Select Time Slot</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.id}
                          variant={bookingData.timeSlot === slot.label ? 'default' : 'outline'}
                          onClick={() => setBookingData({ ...bookingData, timeSlot: slot.label })}
                          className={cn(
                            "h-10 rounded-lg text-xs transition-all",
                            bookingData.timeSlot === slot.label 
                              ? "bg-medical-primary border-medical-primary text-white shadow-md shadow-medical-primary/20" 
                              : "border-medical-accent/20 bg-medical-accent/[0.03] text-medical-accent hover:bg-medical-accent/10 hover:border-medical-accent/50"
                          )}
                        >
                          {slot.label}
                        </Button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Selected time is خارج از اوقات کار (outside working hours)
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-medical-primary/5 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-medical-primary" />
                        <span className="text-sm font-medium">Consultation Fee</span>
                      </div>
                      <span className="font-bold text-medical-primary">PKR {DOCTOR_INFO.consultationFee}</span>
                    </div>

                    <div className="flex items-center gap-2 px-2 text-[11px] text-medical-muted">
                      <Clock className="h-3 w-3 text-medical-accent" />
                      <span>Please arrive 10 minutes before your appointment time</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setBookingStep(1)}>Back</Button>
                    <Button 
                      className="flex-[2] btn-primary h-14"
                      disabled={!bookingData.date || !bookingData.timeSlot}
                      onClick={() => setBookingStep(3)}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Patient Name</Label>
                      <Input 
                        placeholder="Full Name" 
                        value={bookingData.patientName || ''}
                        onChange={e => setBookingData({ ...bookingData, patientName: e.target.value })}
                        className="h-12 rounded-xl border-gray-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input 
                          type="number" 
                          placeholder="Age" 
                          value={bookingData.patientAge || ''}
                          onChange={e => setBookingData({ ...bookingData, patientAge: parseInt(e.target.value) })}
                          className="h-12 rounded-xl border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input 
                          placeholder="03xx xxxxxxx" 
                          value={bookingData.patientPhone || ''}
                          onChange={e => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                          className="h-12 rounded-xl border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Symptoms (Optional)</Label>
                      <Input 
                        placeholder="Briefly describe symptoms" 
                        value={bookingData.symptoms || ''}
                        onChange={e => setBookingData({ ...bookingData, symptoms: e.target.value })}
                        className="h-12 rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <Card className="bg-medical-primary/5 border-none rounded-2xl p-4">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-medical-primary" />
                      Summary
                    </h4>
                    <div className="text-sm space-y-1 text-medical-muted">
                      <p>Clinic: {bookingData.clinicLocation}</p>
                      <p>Date: {bookingData.date ? format(new Date(bookingData.date), 'PPP') : ''}</p>
                      <p>Time: {bookingData.timeSlot}</p>
                    </div>
                  </Card>

                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setBookingStep(2)}>Back</Button>
                    <Button 
                      className="flex-[2] btn-primary h-14"
                      disabled={!bookingData.patientName || !bookingData.patientPhone}
                      onClick={() => setBookingStep(4)}
                    >
                      Summary & Pay
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-medical-primary" />
                    Payment Summary
                  </h3>

                  <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
                    <div className="bg-medical-primary/10 p-6 border-b border-medical-primary/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-medical-primary rounded-2xl flex items-center justify-center text-white shadow-inner">
                          <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-medical-primary text-lg">{DOCTOR_INFO.name}</p>
                          <p className="text-xs text-medical-muted">Consultant Pulmonologist</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-medical-muted">Clinic Location</p>
                            <p className="text-sm font-semibold">{bookingData.clinicLocation}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-medical-muted">Date & Time</p>
                            <p className="text-sm font-semibold">
                              {bookingData.date ? format(new Date(bookingData.date), 'PPP') : ''}
                              <span className="text-medical-primary ml-2">• {bookingData.timeSlot}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <Separator className="bg-gray-100" />
                      <div className="flex justify-between items-center py-2">
                        <span className="text-medical-muted">Consultation Fee</span>
                        <span className="text-xl font-bold text-medical-primary">PKR {DOCTOR_INFO.consultationFee}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <Label className="text-medical-muted">Select Payment Method</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        variant={bookingData.paymentMethod === 'cash' ? 'default' : 'outline'}
                        onClick={() => setBookingData({ ...bookingData, paymentMethod: 'cash', paymentStatus: 'unpaid' })}
                        className={cn(
                          "h-14 justify-start px-6 gap-4 rounded-2xl border-gray-200",
                          bookingData.paymentMethod === 'cash' && "bg-medical-primary border-medical-primary"
                        )}
                      >
                        <Banknote className={cn("h-5 w-5", bookingData.paymentMethod === 'cash' ? "text-white" : "text-gray-400")} />
                        <div className="text-left">
                          <p className="font-semibold leading-none">Cash at Clinic</p>
                          <p className="text-[10px] opacity-70">Pay when you visit the doctor</p>
                        </div>
                      </Button>
                      <Button
                        variant={bookingData.paymentMethod === 'easypaisa' ? 'default' : 'outline'}
                        onClick={() => setBookingData({ ...bookingData, paymentMethod: 'easypaisa', paymentStatus: 'paid' })}
                        className={cn(
                          "h-14 justify-start px-6 gap-4 rounded-2xl border-gray-200",
                          bookingData.paymentMethod === 'easypaisa' && "bg-medical-primary border-medical-primary"
                        )}
                      >
                        <Wallet className={cn("h-5 w-5", bookingData.paymentMethod === 'easypaisa' ? "text-white" : "text-gray-400")} />
                        <div className="text-left">
                          <p className="font-semibold leading-none">Easypaisa / JazzCash</p>
                          <p className="text-[10px] opacity-70">Secure mobile payment</p>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-medical-primary/5 p-4 rounded-2xl border border-medical-primary/10">
                    <h4 className="text-xs font-bold text-medical-primary flex items-center gap-2 mb-1">
                      <AlertCircle className="h-3 w-3" />
                      Cancellation Policy
                    </h4>
                    <p className="text-[10px] text-medical-muted leading-relaxed">
                      Cancellations must be made at least 2 hours before the appointment time. 
                      Late cancellations or no-shows may prevent you from booking in the future.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setBookingStep(3)}>Back</Button>
                    <Button 
                      className="flex-[2] btn-primary h-14"
                      onClick={handleBook}
                    >
                      Confirm & Pay
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 5 && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">Appointment Confirmed<br/>Successfully!</h3>
                    <p className="text-medical-muted text-sm px-4">Your session has been scheduled. A confirmation has been sent to your account.</p>
                  </div>

                  <Card className="w-full border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                    <div className="bg-medical-primary/5 p-4 border-b border-gray-100">
                       <p className="text-[10px] uppercase tracking-widest font-bold text-medical-primary">Official Appointment Receipt</p>
                    </div>
                    <CardContent className="p-6 space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-medical-muted uppercase font-semibold">Doctor</p>
                          <p className="text-sm font-bold truncate">{DOCTOR_INFO.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-medical-muted uppercase font-semibold">Appointment ID</p>
                          <p className="text-sm font-bold font-mono text-medical-primary">#{lastAppointmentId?.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-medical-muted uppercase font-semibold">Clinic & Location</p>
                        <p className="text-sm font-bold">{bookingData.clinicLocation} ({bookingData.city})</p>
                        <p className="text-[11px] text-medical-muted leading-tight">{selectedClinic?.address}</p>
                      </div>

                      <Separator className="bg-gray-50" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-medical-muted uppercase font-semibold">Date</p>
                          <p className="text-sm font-bold">{bookingData.date ? format(new Date(bookingData.date), 'PPP') : ''}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-medical-muted uppercase font-semibold">Time</p>
                          <p className="text-sm font-bold">{bookingData.timeSlot}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-medical-muted uppercase font-semibold">Patient Name</p>
                        <p className="text-sm font-bold">{bookingData.patientName}</p>
                      </div>

                      <Separator className="bg-gray-50" />

                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] text-medical-muted uppercase font-semibold">Payment Status</p>
                          <Badge className={cn(
                            "text-[10px] px-2 py-0 h-5",
                            bookingData.paymentStatus === 'paid' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                          )}>
                            {bookingData.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Clinic'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-medical-muted uppercase font-semibold">Fee</p>
                          <p className="text-lg font-bold text-gray-900 tracking-tight">PKR {bookingData.fee}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-medical-accent/5 p-4 rounded-2xl flex items-start gap-3 text-left">
                    <AlertCircle className="h-5 w-5 text-medical-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-medical-accent font-medium leading-relaxed">
                      Thank you for booking your appointment. Please arrive <strong>10 minutes before</strong> your scheduled time.
                    </p>
                  </div>

                  <div className="w-full space-y-3 pt-2 pb-8">
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 btn-primary h-14 rounded-2xl"
                        onClick={() => {
                          setActiveScreen('appointments');
                          resetBooking();
                        }}
                      >
                        My Appointments
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-14 w-14 rounded-2xl border-gray-200 flex items-center justify-center p-0"
                        onClick={() => {
                         if (navigator.share) {
                           navigator.share({
                             title: 'Appointment Confirmation',
                             text: `Appointment with ${DOCTOR_INFO.name} at ${bookingData.clinicLocation} confirmed for ${bookingData.date ? format(new Date(bookingData.date), 'PPP') : ''} at ${bookingData.timeSlot}`,
                             url: window.location.href
                           }).catch(() => {});
                         } else {
                           toast.info("Screenshot taken (simulated)");
                           window.print();
                         }
                        }}
                      >
                        <Share2 className="h-6 w-6 text-medical-muted" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 text-medical-muted font-medium"
                      onClick={() => {
                        setActiveScreen('home');
                        resetBooking();
                      }}
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeScreen === 'appointments' && (
            <motion.div 
              key="appointments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <h2 className="text-2xl font-bold">My Appointments</h2>
              
              {appointmentsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="text-gray-400" />
                  </div>
                  <p className="text-medical-muted">No appointments found.</p>
                  <Button variant="outline" onClick={() => setActiveScreen('booking')}>Book your first visit</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map(app => (
                    <Card key={app.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{app.clinicLocation}</CardTitle>
                          <CardDescription>{format(new Date(app.date), 'PPP')}</CardDescription>
                        </div>
                        <Badge className={cn(
                          "capitalize",
                          app.status === 'confirmed' && "bg-green-100 text-green-700 hover:bg-green-100",
                          app.status === 'pending' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                          app.status === 'cancelled' && "bg-red-100 text-red-700 hover:bg-red-100",
                          app.status === 'completed' && "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        )}>
                          {app.status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex items-center gap-4 text-sm text-medical-muted mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{app.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{app.patientName}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-1 text-xs font-medium text-medical-muted">
                            <Receipt className="h-3 w-3" />
                            <span>PKR {app.fee}</span>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] h-5 px-2",
                            app.paymentStatus === 'paid' ? "border-green-200 text-green-600" : "border-yellow-200 text-yellow-600"
                          )}>
                            {app.paymentStatus === 'paid' ? 'Paid' : 'Pay at Clinic'}
                          </Badge>
                        </div>
                        {app.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => cancelAppointment(app.id)}
                          >
                            Cancel Appointment
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeScreen === 'contact' && (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <h2 className="text-2xl font-bold">Contact & Directions</h2>
              
              <div className="space-y-6">
                {CLINICS.map(clinic => (
                  <Card key={clinic.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle>{clinic.city} Clinic</CardTitle>
                      <CardDescription>{clinic.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-medical-primary flex-shrink-0" />
                        <p className="text-sm">{clinic.address}</p>
                      </div>
                      <div className="flex gap-3">
                        <Phone className="h-5 w-5 text-medical-primary flex-shrink-0" />
                        <p className="text-sm">{clinic.phone}</p>
                      </div>
                      <div className="flex gap-3">
                        <Clock className="h-5 w-5 text-medical-primary flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold">{clinic.city === 'Hyderabad' ? 'Monday - Saturday' : 'Saturday Only'}</p>
                          <p className="text-medical-muted">{clinic.city === 'Hyderabad' ? '02:00 PM - 10:00 PM' : '09:00 AM - 02:00 PM'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 btn-secondary" asChild>
                          <a href={`tel:${clinic.phone}`}>Call Clinic</a>
                        </Button>
                        <Button className="flex-1 btn-primary" asChild>
                          <a href={clinic.mapUrl} target="_blank" rel="noreferrer">Open Maps</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-none shadow-sm rounded-2xl bg-medical-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-medical-muted mb-4">
                    For medical emergencies, please visit the nearest hospital or call the emergency helpline.
                  </p>
                  <Button variant="destructive" className="w-full rounded-xl">Call Emergency</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20">
        <NavButton 
          active={activeScreen === 'home'} 
          onClick={() => setActiveScreen('home')} 
          icon={<HomeIcon />} 
          label="Home" 
        />
        <NavButton 
          active={activeScreen === 'booking'} 
          onClick={() => setActiveScreen('booking')} 
          icon={<Calendar />} 
          label="Book" 
        />
        <NavButton 
          active={activeScreen === 'appointments'} 
          onClick={() => setActiveScreen('appointments')} 
          icon={<Clock />} 
          label="History" 
        />
        <NavButton 
          active={activeScreen === 'contact'} 
          onClick={() => setActiveScreen('contact')} 
          icon={<MapPin />} 
          label="Contact" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-medical-primary" : "text-medical-muted"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all",
        active ? "bg-medical-primary/10" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}
