import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Video, Globe, CalendarDays, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { availabilityApi, bookingsApi } from '../api';
import Calendar from './Calendar';
import TimeSlotPicker from './TimeSlotPicker';
import { useToast } from './ui/Toast';
import { ArrowLeft } from 'lucide-react';

export default function BookingPreviewModal({ open, onClose, event }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDays, setAvailableDays] = useState([1, 2, 3, 4, 5]);
  const [overrides, setOverrides] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  // load availability rules to determine clickable days
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await availabilityApi.get();
        const data = res.data || res;
        const rules = data.rules || [];
        const days = rules.filter((r) => r.is_available).map((r) => r.day_of_week);
        if (days.length) setAvailableDays(days);
        if (data.overrides) setOverrides(data.overrides);
      } catch {
        // ignore
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open || !event) return;
    (async () => {
      try {
        setSlotsLoading(true);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await availabilityApi.getSlots(dateStr, event.id);
        const payload = res.data || res;
        const list = payload.slots || payload;
        setSlots(list);
        setSelectedSlot(null);
      } catch (e) {
        // error
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [event, selectedDate, open]);

  // Reset state when opened/closed
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedSlot(null);
      setForm({ name: '', email: '' });
    }
  }, [open]);

  if (!open || !event) return null;

  const dateLabel = format(selectedDate, 'EEEE, MMMM d');
  const timezoneLabel = 'India Standard Time';
  const currentTimeStr = format(new Date(), 'h:mma').toLowerCase();

  const handleBook = async () => {
    if (!selectedSlot) {
      showToast({ message: 'Please select a time slot first', type: 'error' });
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      showToast({ message: 'Name and email are required', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const booking = await bookingsApi.create({
        event_type_id: event.id,
        invitee_name: form.name,
        invitee_email: form.email,
        invitee_notes: '',
        start_time: selectedSlot.startISO,
        end_time: selectedSlot.endISO,
        timezone: 'Asia/Kolkata',
      });
      const b = booking.data || booking;
      onClose();
      navigate('/confirmation', {
        state: {
          booking: {
            invitee_name: b.invitee_name,
            invitee_email: b.invitee_email,
            start_time: b.start_time,
            end_time: b.end_time,
            event_type_name: event.name,
            duration: event.duration,
            location: event.location,
            cancel_token: b.cancel_token,
          },
        },
      });
    } catch (err) {
      showToast({ message: err.message || 'Error booking meeting', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={onClose} />
      <div className="fixed top-[5vh] left-1/2 -translate-x-1/2 w-full max-w-[1040px] bg-white rounded-2xl shadow-modal z-[101] flex flex-col animate-in zoom-in-95 h-[90vh]">
        
        {/* Header Ribbon */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 z-10 transition-colors">
          <X className="w-6 h-6 stroke-[1.5]" />
        </button>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden rounded-2xl relative">
          
          {/* Left Column (Meeting Details & Form) */}
          <div className="w-full md:w-[42%] p-8 md:p-10 border-r border-border bg-white overflow-y-auto custom-scrollbar flex flex-col">
             
             {step === 2 && (
               <button onClick={() => setStep(1)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-gray-50 hover:text-text-primary hover:shadow-sm transition-all mb-5 group">
                 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
               </button>
             )}

             <div className="text-[13px] font-bold text-text-secondary mb-1">Meeting Details</div>
             <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight mb-6 flex items-center gap-2">
               {event.name}
               <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
               </svg>
             </h1>
             
             <div className="flex flex-col gap-3 font-semibold text-text-primary text-[15px] mb-8">
               <div className="flex items-center gap-3 text-blue-600">
                 <Clock className="w-5 h-5" strokeWidth={2} />
                 {event.duration} min
                 <ChevronDown className="w-4 h-4 text-text-muted ml-auto" />
               </div>
               <div className="flex items-center gap-3 text-blue-600">
                 <Video className="w-5 h-5 text-[#00897B]" strokeWidth={2} />
                 {event.location || 'Google Meet web conference'}
                 <ChevronDown className="w-4 h-4 text-text-muted ml-auto" />
               </div>
             </div>

             <div className="mb-8">
               <div className="text-[14px] font-bold text-text-secondary mb-3">Hosts</div>
               <div className="bg-[#F3F4F6] rounded-xl p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-white">
                      K
                    </div>
                    <span className="text-[14px] font-semibold text-text-primary">Kaushal Kumar (you)</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-text-secondary text-[13px] font-bold">
                   <Globe className="w-4 h-4" /> IST
                 </div>
               </div>
             </div>
             {step === 2 && selectedSlot && (
               <div className="flex items-center gap-3 text-text-secondary font-semibold text-[15px] mb-8">
                 <CalendarDays className="w-5 h-5 text-text-muted" strokeWidth={2} />
                 <span>{dateLabel}, {selectedSlot.start}</span>
               </div>
             )}
          </div>

          {/* Right Column (Calendar / Time Slots / Form) */}
          <div className="flex-1 bg-white p-8 md:p-10 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
             
             {step === 1 && (
               <>
                 <div className="flex items-center justify-between mb-8">
                   <h2 className="text-[20px] font-extrabold text-text-primary">Select a time to book</h2>
                   <button className="text-[13px] font-bold text-text-primary border border-border rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                     <CalendarDays className="w-4 h-4" /> Override available times
                   </button>
                 </div>

                 <div className="flex items-center gap-2 text-[13px] font-semibold text-text-secondary mb-10">
                    <Globe className="w-4 h-4" /> Time zone display: <span className="text-blue-600 cursor-pointer">{timezoneLabel} ({currentTimeStr}) <ChevronDown className="w-3 h-3 inline pb-0.5" /></span>
                 </div>

                 {/* Internal split: Calendar vs Slots */}
                 <div className="flex gap-10 flex-1">
                    
                    {/* Calendar Side */}
                    <div className="flex-1 max-w-[340px]">
                      <Calendar
                        currentMonth={currentMonth}
                        selectedDate={selectedDate}
                        onMonthChange={setCurrentMonth}
                        onDateSelect={(day) => {
                          setSelectedDate(day);
                          setSelectedSlot(null);
                        }}
                        availableDays={availableDays}
                        overrides={overrides}
                      />
                    </div>

                    {/* Slots Side */}
                    <div className="w-[260px] flex flex-col items-center">
                       <div className="text-[16px] font-medium text-text-primary mb-6 w-full text-center">{dateLabel}</div>
                       
                       <div className="w-full">
                         <TimeSlotPicker
                           slots={slots}
                           loading={slotsLoading}
                           selectedSlot={selectedSlot}
                           onSelectSlot={setSelectedSlot}
                           onConfirmSlot={(slot) => {
                             setSelectedSlot(slot);
                             setStep(2);
                           }}
                         />
                       </div>
                    </div>
                 </div>
               </>
             )}

             {step === 2 && (
               <div className="flex-1 flex flex-col max-w-[480px] animate-[slideInRight_0.35s_ease-out]">
                 <h2 className="text-[20px] font-extrabold text-text-primary mb-6">Enter Details</h2>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-[14px] font-bold text-text-primary mb-1">Name</label>
                     <input 
                       className="w-full h-11 border border-border rounded-lg px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                       value={form.name}
                       onChange={(e) => setForm({ ...form, name: e.target.value })}
                     />
                   </div>
                   <div>
                     <label className="block text-[14px] font-bold text-text-primary mb-1">Email</label>
                     <input 
                       className="w-full h-11 border border-border rounded-lg px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                       value={form.email}
                       onChange={(e) => setForm({ ...form, email: e.target.value })}
                     />
                   </div>
                   
                   <button className="text-[14px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                     + Add guests
                   </button>
                   
                   <div className="pt-2">
                     <label className="block text-[14px] font-bold text-text-primary mb-1">Additional Notes</label>
                     <textarea
                       rows={3}
                       placeholder="Share anything that helps prepare for our meeting..."
                       className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-white placeholder:text-text-muted hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                     />
                   </div>
                 </div>
                 
                 <div className="pt-8 mt-auto">
                   <button 
                     onClick={handleBook}
                     disabled={submitting}
                     className="w-[200px] bg-[#0069FF] hover:bg-blue-700 text-white font-bold text-[15px] h-[46px] rounded-full transition-colors shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {submitting ? 'Booking...' : 'Book meeting'}
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
