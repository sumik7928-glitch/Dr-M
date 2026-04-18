import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut,
  ChevronRight,
  Filter,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { Appointment } from '../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface DoctorPanelProps {
  userId: string;
  onLogout: () => void;
  doctorName: string;
}

export function DoctorPanel({ userId, onLogout, doctorName }: DoctorPanelProps) {
  const { appointments, loading, cancelAppointment, approveAppointment, completeAppointment } = useAppointments(userId, 'doctor');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 py-6 border-b border-gray-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-medical-primary rounded-xl flex items-center justify-center text-white font-bold">
            {doctorName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dr. Dashboard</h1>
            <p className="text-xs text-medical-muted">Welcome, {doctorName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-medical-muted rounded-xl">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Stats/Overview */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <Card className="bg-white border-none shadow-sm rounded-2xl p-4">
          <p className="text-xs text-medical-muted mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-medical-primary">{appointments.length}</p>
        </Card>
        <Card className="bg-white border-none shadow-sm rounded-2xl p-4">
          <p className="text-xs text-medical-muted mb-1">Today</p>
          <p className="text-2xl font-bold text-medical-accent">
            {appointments.filter(a => format(new Date(a.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f as any)}
            className={cn(
              "rounded-full px-5 h-9 text-xs capitalize whitespace-nowrap border-gray-200",
              filter === f ? "bg-medical-primary text-white" : "bg-white text-medical-muted"
            )}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Appointment List */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <AnimatePresence mode="popLayout">
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
             </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-medical-muted italic">No {filter} appointments found.</p>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4"
              >
                <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="text-gray-400 h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{app.patientName}</CardTitle>
                        <CardDescription className="text-[10px]">{app.patientPhone}</CardDescription>
                      </div>
                    </div>
                    <Badge className={cn(
                      "capitalize text-[10px] px-2 py-0 h-5",
                      app.status === 'confirmed' && "bg-green-100 text-green-700",
                      app.status === 'pending' && "bg-yellow-100 text-yellow-700",
                      app.status === 'cancelled' && "bg-red-100 text-red-700",
                      app.status === 'completed' && "bg-blue-100 text-blue-700"
                    )}>
                      {app.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-medical-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-medical-muted uppercase font-bold tracking-tight">Date</p>
                            <p className="text-xs font-semibold">{format(new Date(app.date), 'PPP')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-medical-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-medical-muted uppercase font-bold tracking-tight">Time Slot</p>
                            <p className="text-xs font-semibold">{app.timeSlot}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-medical-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-medical-muted uppercase font-bold tracking-tight">Location</p>
                          <p className="text-xs font-semibold">{app.clinicLocation}</p>
                        </div>
                      </div>

                      {app.symptoms && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <p className="text-[10px] text-medical-muted mb-1 font-bold italic">Patient Symptoms:</p>
                           <p className="text-xs text-gray-700">{app.symptoms}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {app.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 h-9"
                              onClick={() => approveAppointment(app.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50 h-9"
                              onClick={() => cancelAppointment(app.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'confirmed' && (
                           <Button 
                            size="sm" 
                            className="w-full rounded-xl bg-medical-primary h-9"
                            onClick={() => completeAppointment(app.id)}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
