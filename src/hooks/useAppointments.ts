import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { Appointment } from '../types';
import { toast } from 'sonner';

export function useAppointments(userId: string | undefined, role: 'patient' | 'doctor' | 'admin' = 'patient') {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    let q;
    if (role === 'doctor' || role === 'admin') {
      q = query(
        collection(db, 'appointments'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'appointments'),
        where('patientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(docs);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const bookAppointment = async (data: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => {
    try {
      const newAppointment = {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'appointments'), newAppointment);
      toast.success('Appointment booked successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book appointment. Please try again.');
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled'
      });
      toast.success('Appointment cancelled.');
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel appointment.');
    }
  };

  const approveAppointment = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'confirmed'
      });
      toast.success('Appointment confirmed.');
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to confirm appointment.');
    }
  };

  const completeAppointment = async (appointmentId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'completed'
      });
      toast.success('Appointment marked as completed.');
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to mark as completed.');
    }
  };

  return { appointments, loading, bookAppointment, cancelAppointment, approveAppointment, completeAppointment };
}
