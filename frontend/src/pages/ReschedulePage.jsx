import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Video, Globe, ArrowLeft, ChevronDown, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import Calendar from '../components/Calendar';
import TimeSlotPicker from '../components/TimeSlotPicker';
import Button from '../components/ui/Button';
import { eventTypesApi, availabilityApi, bookingsApi } from '../api';
import { useToast } from '../components/ui/Toast';

function ReschedulePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(1);

  const [eventType, setEventType] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlots, setShowSlots] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [availableDays, setAvailableDays] = useState([1, 2, 3, 4, 5]);
  const [overrides, setOverrides] = useState([]);

  // load availability rules to determine clickable days
  useEffect(() => {
    (async () => {
      try {
        const res = await availabilityApi.get();
        const data = res.data || res;
        const rules = data.rules || [];
        const days = rules.filter((r) => r.is_available).map((r) => r.day_of_week);
        if (days.length) setAvailableDays(days);
        if (data.overrides) setOverrides(data.overrides);
      } catch {
        // ignore; fall back to weekdays
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingEvent(true);
        const resBooking = await bookingsApi.getByRescheduleToken(token);
        const bookingData = resBooking.data || resBooking;
        setBooking(bookingData);
        setForm({
          name: bookingData.invitee_name,
          email: bookingData.invitee_email,
          notes: bookingData.invitee_notes || '',
        });
        
        const resEvent = await eventTypesApi.getById(bookingData.event_type_id);
        const et = resEvent.data || resEvent;
        setEventType(et);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingEvent(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!eventType) return;
    (async () => {
      try {
        setSlotsLoading(true);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await availabilityApi.getSlots(dateStr, eventType.id);
        const payload = res.data || res;
        const list = payload.slots || payload;
        setSlots(list);
        setSelectedSlot(null);
        setShowSlots(true);
      } catch (e) {
        setError(e.message);
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [eventType, selectedDate]);

  const timezoneLabel = 'India Standard Time';
  const currentTimeStr = format(new Date(), 'h:mma').toLowerCase();

  const validateForm = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventType || !selectedSlot) {
      showToast({ message: 'Please select a new time slot first', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const rescheduled = await bookingsApi.rescheduleByToken(token, {
        start_time: selectedSlot.startISO,
        end_time: selectedSlot.endISO,
      });
      const b = rescheduled.data || rescheduled;
      navigate('/confirmation', {
        state: {
          booking: {
            invitee_name: b.invitee_name,
            invitee_email: b.invitee_email,
            start_time: b.start_time,
            end_time: b.end_time,
            event_type_name: eventType.name,
            duration: eventType.duration,
            location: eventType.location,
            cancel_token: b.cancel_token,
          },
        },
      });
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary font-medium animate-pulse">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page p-6">
        <div className="bg-card rounded-3xl border border-border shadow-modal p-10 max-w-md w-full text-center hover:shadow-card-hover transition-all">
          <p className="text-lg font-bold text-text-primary mb-2">Oops!</p>
          <p className="text-sm text-text-secondary mb-8">{error || 'This event is not available.'}</p>
          <Button size="lg" className="w-full" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  const dateLabel = format(selectedDate, 'EEEE, MMMM d');

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-start lg:items-center justify-center px-0 sm:px-4 py-0 sm:py-8 lg:py-12 font-sans selection:bg-blue-primary/20">
      <div
        className="w-full max-w-[1280px] bg-white sm:rounded-[28px] shadow-none sm:shadow-modal border-0 sm:border border-border flex flex-col lg:flex-row overflow-hidden relative animate-[fadeIn_0.4s_ease-out]"
        style={{ minHeight: '600px' }}
      >
        {/* ── LEFT PANEL: EVENT INFO + BOOKING FORM ── */}
        <div className="w-full lg:w-[340px] xl:w-[380px] lg:border-r border-b lg:border-b-0 border-border bg-white flex flex-col shrink-0">
          {/* Event Info Header */}
          <div className="p-6 lg:p-8 border-b border-border">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-gray-50 hover:text-text-primary hover:shadow-sm transition-all mb-5 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-gray-50 hover:text-text-primary hover:shadow-sm transition-all mb-5 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            <p className="font-bold text-text-secondary tracking-wide uppercase text-[11px] mb-1">
              {eventType.user_id ? 'Kaushal Kumar' : 'Admin User'}
            </p>
            <h1 className="text-xl lg:text-2xl font-extrabold text-text-primary tracking-tight leading-tight mb-4">
              {eventType.name}
            </h1>

            <div className="space-y-2.5 text-sm text-text-secondary font-medium">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-text-muted" />
                <span>{eventType.duration} min</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-text-muted" />
                <span>{eventType.location}</span>
              </div>
              {step === 2 && selectedSlot && (
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-text-muted" />
                  <span>{dateLabel}, {selectedSlot.start}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-text-muted" />
                <span>{timezoneLabel} ({currentTimeStr})</span>
              </div>
            </div>

            {eventType.description && (
              <p className="text-sm text-text-secondary leading-relaxed mt-4 border-t border-border pt-4">
                {eventType.description}
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {step === 1 && (
            <>
              {/* Header on right panel */}
              <div className="px-6 lg:px-10 pt-6 lg:pt-8 pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg lg:text-xl font-bold text-text-primary tracking-tight">
                  Select a Date & Time
                </h2>
                <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                  <Globe className="w-4 h-4 text-text-muted" />
                  <span>Time zone display:</span>
                  <button
                    type="button"
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1"
                  >
                    {timezoneLabel}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Calendar + Time slots side by side */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Calendar */}
                <div className={`p-6 lg:p-8 ${showSlots ? 'md:border-r border-b md:border-b-0 border-border' : ''} transition-all duration-300 flex-1 min-w-0`}>
                  <Calendar
                    currentMonth={currentMonth}
                    selectedDate={selectedDate}
                    onMonthChange={setCurrentMonth}
                    onDateSelect={(day) => {
                      setSelectedDate(day);
                      setShowSlots(true);
                      setSelectedSlot(null);
                    }}
                    availableDays={availableDays}
                    overrides={overrides}
                  />
                </div>

                {/* Time Slots Panel */}
                {showSlots && (
                  <div className="w-full md:w-[240px] lg:w-[280px] shrink-0 flex flex-col animate-[slideInRight_0.35s_ease-out]">
                    <div className="px-5 pt-6 pb-3">
                      <p className="text-base font-bold text-text-primary">{dateLabel}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
                      <TimeSlotPicker
                        slots={slots}
                        loading={slotsLoading}
                        selectedSlot={selectedSlot}
                        onSelectSlot={(slot) => {
                          setSelectedSlot(slot);
                        }}
                        onConfirmSlot={(slot) => {
                          setSelectedSlot(slot);
                          setStep(2);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="p-6 lg:p-10 flex flex-col h-full overflow-y-auto custom-scrollbar animate-[slideInRight_0.35s_ease-out]">
              <h2 className="text-xl lg:text-2xl font-bold text-text-primary tracking-tight mb-6">
                Confirm Reschedule
              </h2>

              <div className="space-y-5 max-w-[480px]">
                <div className="text-sm font-medium text-text-secondary p-4 bg-gray-50 border border-border rounded-xl">
                  <p className="mb-1"><strong>Name:</strong> {booking?.invitee_name}</p>
                  <p className="mb-1"><strong>Email:</strong> {booking?.invitee_email}</p>
                  {booking?.invitee_notes && <p><strong>Notes:</strong> {booking.invitee_notes}</p>}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    loading={submitting}
                    disabled={!selectedSlot}
                    className="font-bold text-base px-8 py-3.5"
                  >
                    Confirm Reschedule
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default ReschedulePage;
