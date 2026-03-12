import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Video, Globe, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Calendar from '../components/Calendar';
import TimeSlotPicker from '../components/TimeSlotPicker';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { eventTypesApi, availabilityApi, bookingsApi } from '../api';
import { useToast } from '../components/ui/Toast';

function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [eventType, setEventType] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState('');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formVisible, setFormVisible] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [availableDays, setAvailableDays] = useState([1, 2, 3, 4, 5]);

  // load availability rules to determine clickable days
  useEffect(() => {
    (async () => {
      try {
        const res = await availabilityApi.get();
        const data = res.data || res;
        const rules = data.rules || [];
        const days = rules.filter((r) => r.is_available).map((r) => r.day_of_week);
        if (days.length) setAvailableDays(days);
      } catch {
        // ignore; fall back to weekdays
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingEvent(true);
        const res = await eventTypesApi.getBySlug(slug);
        const et = res.data || res;
        setEventType(et);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingEvent(false);
      }
    })();
  }, [slug]);

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
        setFormVisible(false);
      } catch (e) {
        setError(e.message);
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [eventType, selectedDate]);

  const timezoneLabel = 'Asia/Kolkata (GMT+5:30)';

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
    if (!eventType || !selectedSlot) return;
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const booking = await bookingsApi.create({
        event_type_id: eventType.id,
        invitee_name: form.name,
        invitee_email: form.email,
        invitee_notes: form.notes,
        start_time: selectedSlot.startISO,
        end_time: selectedSlot.endISO,
        timezone: 'Asia/Kolkata',
      });
      const b = booking.data || booking;
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
        <div className="w-10 h-10 border-4 border-blue-primary border-t-transparent rounded-full animate-spin shadow-button" />
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4 py-12 md:py-20 page-enter font-sans selection:bg-blue-primary/20">
      <div className="max-w-[1060px] w-full bg-white rounded-[32px] shadow-modal border border-border flex flex-col md:flex-row overflow-hidden relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-2 hidden md:block"
          style={{ backgroundColor: eventType.color || '#006BFF' }}
        />
        <div className="w-full md:w-[380px] md:border-r border-b border-border bg-gray-50/50 p-8 md:p-10 relative">
          <div
            className="absolute top-0 left-0 w-full h-1.5 md:hidden"
            style={{ backgroundColor: eventType.color || '#006BFF' }}
          />
          <button
            type="button"
            onClick={() => formVisible ? setFormVisible(false) : navigate('/')}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-white hover:text-text-primary hover:shadow-sm transition-all mb-8 bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-bold text-text-secondary tracking-wide uppercase text-xs">Admin User</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">{eventType.name}</h1>
            </div>

            <div className="space-y-4 text-base text-text-secondary font-medium">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-text-muted" />
                <span>{eventType.duration} min</span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-text-muted" />
                <span>{eventType.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-text-muted" />
                <span>{timezoneLabel}</span>
              </div>
            </div>

            {eventType.description && (
              <p className="text-base text-text-secondary leading-relaxed mt-6">{eventType.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex-1 bg-white p-6 md:p-10 lg:p-12 relative overflow-hidden">
          <div className={`transition-all duration-smooth ${formVisible ? '-translate-x-12 opacity-0 pointer-events-none absolute' : 'translate-x-0 opacity-100 relative'}`}>
            <h2 className="text-2xl font-bold text-text-primary mb-8 tracking-tight">Select a Date &amp; Time</h2>
            <div className="grid lg:grid-cols-[1.2fr,1fr] gap-10">
              <Calendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onMonthChange={setCurrentMonth}
                onDateSelect={setSelectedDate}
                availableDays={availableDays}
              />
              <div className="space-y-6">
                <div>
                  <p className="text-lg font-bold text-text-primary mb-1">{dateLabel}</p>
                </div>
                <TimeSlotPicker
                  slots={slots}
                  loading={slotsLoading}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => {
                    setSelectedSlot(slot);
                    setFormVisible(false);
                  }}
                  onConfirmSlot={(slot) => {
                    setSelectedSlot(slot);
                    setFormVisible(true);
                  }}
                />
              </div>
            </div>
          </div>

          <div className={`transition-all duration-smooth ${formVisible ? 'translate-x-0 opacity-100 relative max-w-xl mx-auto' : 'translate-x-[150%] opacity-0 absolute inset-0 pointer-events-none'}`}>
            <h2 className="text-2xl font-bold text-text-primary mb-8 tracking-tight">Enter Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Name *"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                error={formErrors.name}
                placeholder="John Doe"
              />
              <Input
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                error={formErrors.email}
                placeholder="john@example.com"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  Please share anything that will help prepare for our meeting
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-white placeholder:text-text-muted hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-primary transition-all duration-fast resize-none"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="pt-4">
                <p className="text-xs text-text-muted mb-4 leading-relaxed">By proceeding, you confirm that you have read and agree to Calendly's Terms of Use and Privacy Notice.</p>
                <Button type="submit" size="lg" loading={submitting}>
                  Schedule Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;

