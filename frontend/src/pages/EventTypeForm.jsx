import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Clock, MapPin, CalendarDays, User, ChevronDown, AlertCircle, Video, Phone, Users, ChevronDownCircle } from 'lucide-react';
import { eventTypesApi, availabilityApi } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAvailability } from '../hooks/useAvailability';

const COLORS = ['#0069FF', '#059669', '#7C3AED', '#DB2777', '#D97706', '#DC2626', '#0891B2'];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

const LOCATION_OPTIONS = [
  { id: 'zoom', label: 'Zoom', icon: Video },
  { id: 'phone', label: 'Phone call', icon: Phone },
  { id: 'in_person', label: 'In-person', icon: MapPin },
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function EventTypeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: availabilityData } = useAvailability();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  
  const [activeSection, setActiveSection] = useState('duration');

  // ── Form state (must be declared before calendar memos that use form.duration) ──
  const [form, setForm] = useState({
    name: 'New Meeting',
    slug: 'new-meeting',
    duration: 30,
    description: '',
    location: '',
    color: '#7C3AED',
    buffer_before: 0,
    buffer_after: 0,
  });
  const [errors, setErrors] = useState({});
  // Track whether the user has manually edited the slug.
  // Once true, name changes no longer overwrite it.
  const [slugTouched, setSlugTouched] = useState(false);

  // ── Preview calendar state ──────────────────────────────────────────────
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [previewMonth, setPreviewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Build calendar grid (Sun-start)
  const calendarDays = useMemo(() => {
    const year = previewMonth.getFullYear();
    const month = previewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [previewMonth]);

  const monthLabel = useMemo(() =>
    previewMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    [previewMonth]
  );

  // Generate time slots based on availability rules and duration
  const timeSlots = useMemo(() => {
    const slots = [];
    const dur = Number(form.duration) || 30;
    let startMinutes = 9 * 60;
    let endMinutes = 17 * 60;

    if (selectedDate && availabilityData?.rules) {
      const day = selectedDate.getDay();
      const rule = availabilityData.rules.find(r => r.day_of_week === day);
      if (rule && rule.is_available) {
        const [sh, sm] = rule.start_time.split(':').map(Number);
        const [eh, em] = rule.end_time.split(':').map(Number);
        startMinutes = sh * 60 + sm;
        endMinutes = eh * 60 + em;
      }
    }

    let current = startMinutes;
    while (current + dur <= endMinutes) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const period = h < 12 ? 'AM' : 'PM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      slots.push(`${h12}:${m.toString().padStart(2, '0')} ${period}`);
      current += dur;
    }
    return slots;
  }, [form.duration, selectedDate, availabilityData]);

  const isDateSelectable = (date) => {
    if (!date) return false;
    if (date < today) return false;
    const day = date.getDay();
    if (availabilityData?.rules) {
      const rule = availabilityData.rules.find((r) => r.day_of_week === day);
      return rule ? rule.is_available : false;
    }
    return day !== 0 && day !== 6;
  };

  const isSameDay = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setInitialLoading(true);
        const res = await eventTypesApi.getById(id);
        const existing = res.data || res;
        if (!existing) {
          showToast({ message: 'Event type not found', type: 'error' });
          navigate('/dashboard', { replace: true });
          return;
        }
        setForm({
          name: existing.name,
          slug: existing.slug,
          duration: existing.duration,
          description: existing.description || '',
          location: existing.location || '',
          color: existing.color || '#7C3AED',
          buffer_before: existing.buffer_before || 0,
          buffer_after: existing.buffer_after || 0,
        });
        if (existing.scheduled_date) {
          setSelectedDate(new Date(existing.scheduled_date));
          setPreviewMonth(new Date(existing.scheduled_date));
        }
        if (existing.scheduled_time) {
          setSelectedTime(existing.scheduled_time);
        }
        // In edit mode the slug already exists — treat it as touched
        setSlugTouched(true);
      } catch (e) {
        showToast({ message: e.message, type: 'error' });
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id, isEdit, navigate, showToast]);

  const bookingLink = useMemo(
    () => `${window.location.origin}/book/${form.slug || 'your-slug'}`,
    [form.slug]
  );

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.slug.trim()) next.slug = 'Slug is required';
    if (!/^[a-z0-9-]+$/.test(form.slug)) next.slug = 'Slug can contain only letters, numbers, and hyphens';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-generate slug from name ONLY if the user hasn't manually set the slug yet
    if (field === 'name' && !isEdit && !slugTouched) {
      const slug = generateSlug(value);
      setForm((prev) => ({ ...prev, name: value, slug }));
    }
  };

  // Called when the user types directly into the slug input
  const handleSlugChange = (e) => {
    setSlugTouched(true);
    // Allow free typing — only strip characters that are truly invalid
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setForm((prev) => ({ ...prev, slug: raw }));
    setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  // On blur, clean up any leading/trailing hyphens
  const handleSlugBlur = () => {
    setForm((prev) => ({ ...prev, slug: prev.slug.replace(/(^-+|-+$)/g, '') }));
  };

  const handleLocationSelect = (locId) => {
    if (locId === 'zoom') handleChange('location', 'Zoom Meeting');
    if (locId === 'phone') handleChange('location', 'Phone Call');
    if (locId === 'in_person') handleChange('location', 'In Person');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        ...form,
        duration: Number(form.duration),
        buffer_before: Number(form.buffer_before),
        buffer_after: Number(form.buffer_after),
        scheduled_date: selectedDate ? selectedDate.toISOString() : null,
        scheduled_time: selectedTime || null,
      };
      if (isEdit) {
        await eventTypesApi.update(id, payload);
        showToast({ message: 'Event type updated!', type: 'success' });
      } else {
        await eventTypesApi.create(payload);
        showToast({ message: 'Event type created!', type: 'success' });
      }
      navigate('/dashboard');
    } catch (err) {
      // Detect duplicate slug constraint violation and show it as a field error
      const isDuplicateSlug =
        err.message?.toLowerCase().includes('slug') ||
        err.message?.toLowerCase().includes('unique constraint') ||
        err.message?.toLowerCase().includes('duplicate key');

      if (err.message === 'An event type with this name already exists') {
        setErrors((prev) => ({
          ...prev,
          name: 'This name is already used. Please choose another.',
        }));
        showToast({ message: 'An event type with this name already exists.', type: 'error' });
      } else if (isDuplicateSlug) {
        setErrors((prev) => ({
          ...prev,
          slug: 'This URL is already taken — please choose a different one.',
        }));
        // Open the Host & Links section so the user can see the error
        setActiveSection('host');
        showToast({ message: 'URL slug is already in use. Please choose a unique one.', type: 'error' });
      } else {
        showToast({ message: err.message || 'Something went wrong', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
       <div className="flex justify-center p-10">
         <div className="w-8 h-8 border-4 border-blue-primary border-t-transparent rounded-full animate-spin shadow-button" />
       </div>
    );
  }

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-page page-enter flex items-start justify-center overflow-hidden">


      {/* Form Configuration Panel */}
      <div className="w-full max-w-[600px] bg-white h-full flex flex-col relative shadow-modal z-20">
        
        {/* Header Options */}
        <div className="px-8 py-6 relative">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="absolute top-6 right-6 p-1 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
          
          <div className="mb-4 text-sm font-bold text-text-secondary">
            Event type settings
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full shadow-sm shrink-0 mt-0.5" style={{ backgroundColor: form.color }} />
            <Input 
               value={form.name}
               onChange={(e) => handleChange('name', e.target.value)}
               className="!space-y-0 text-xl font-bold tracking-tight text-text-primary !h-10 w-full"
               placeholder="Event Name"
               error={errors.name}
            />
          </div>
        </div>

        {/* Scrollable Section List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          
          {/* Duration Section */}
          <div className="border border-border rounded-xl mb-3 shadow-sm bg-white overflow-hidden">
            <button 
              type="button"
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('duration')}
            >
              <div className="text-left">
                <div className="font-bold text-[15px] text-text-primary mb-1">Duration</div>
                <div className="flex items-center text-[13px] text-text-secondary font-medium gap-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  {form.duration} min
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeSection === 'duration' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'duration' && (
              <div className="px-5 pb-5 pt-2 animate-dropdown border-t border-border">
                <label className="block text-sm font-semibold text-text-primary mb-3">Select Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleChange('duration', d)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        form.duration === d 
                          ? 'bg-blue-50 border-blue-primary text-blue-600 shadow-sm' 
                          : 'bg-white border-border text-text-primary hover:border-gray-400'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="border border-border rounded-xl mb-3 shadow-sm bg-white overflow-hidden">
            <button 
              type="button"
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('location')}
            >
              <div className="text-left">
                <div className="font-bold text-[15px] text-text-primary mb-1">Location</div>
                <div className="flex items-center text-[13px] text-text-secondary font-medium gap-2">
                  {form.location ? (
                    <>
                      <MapPin className="w-4 h-4 text-text-muted" />
                      <span className="line-clamp-1">{form.location}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-text-secondary">No location set</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeSection === 'location' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'location' && (
              <div className="px-5 pb-5 pt-4 animate-dropdown border-t border-border">
                <div className="flex flex-wrap gap-3 mb-6">
                  {LOCATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleLocationSelect(opt.id)}
                      className="flex-1 min-w-[100px] h-[80px] flex flex-col items-center justify-center gap-2 border border-border rounded-xl bg-white hover:border-gray-300 transition-colors"
                    >
                      <opt.icon className="w-5 h-5 text-gray-700 stroke-[1.5]" />
                      <span className="text-sm font-medium text-text-primary">{opt.label}</span>
                    </button>
                  ))}
                </div>
                
                {!form.location && (
                  <div className="flex items-center gap-3 bg-[#FEF3C7]/60 border border-[#F59E0B]/30 rounded-lg p-4 mb-1">
                    <AlertCircle className="w-5 h-5 text-[#D97706] fill-[#FCD34D] shrink-0" />
                    <span className="text-[13px] font-medium text-[#92400E]">
                      Add a location to help invitees know how to attend
                    </span>
                  </div>
                )}
                
                {form.location && !form.location.startsWith('http') && (
                   <Input
                     label="Custom Name/Instructions"
                     value={form.location}
                     onChange={(e) => handleChange('location', e.target.value)}
                     className="mb-1 mt-2"
                   />
                )}

                <div className="mt-6 border-t border-border pt-5">
                  <label className="block text-[15px] font-bold text-text-primary mb-1">Add a custom link</label>
                  <p className="text-[13px] text-text-secondary mb-3">Paste a direct Zoom, Google Meet, or other web conference link.</p>
                  <Input
                     placeholder="https://..."
                     value={form.location?.startsWith('http') ? form.location : ''}
                     onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div className="border border-border rounded-xl mb-3 shadow-sm bg-white overflow-hidden">
            <button 
              type="button"
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('availability')}
            >
              <div className="text-left">
                <div className="font-bold text-[15px] text-text-primary mb-1">Availability</div>
                <div className="flex items-center text-[13px] text-text-secondary font-medium gap-2">
                  <CalendarDays className="w-4 h-4 text-text-muted" />
                  Default Weekly Hours
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeSection === 'availability' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'availability' && (
              <div className="px-5 pb-5 pt-4 animate-dropdown text-[13px] text-text-secondary border-t border-border space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-border space-y-2">
                   <div className="flex justify-between items-center text-sm font-semibold text-text-primary border-b border-border pb-2 mb-2">
                      <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Weekly hours</div>
                   </div>
                   {availabilityData?.rules?.filter(r => r.is_available).sort((a,b) => a.day_of_week === 0 ? 1 : b.day_of_week === 0 ? -1 : a.day_of_week - b.day_of_week).map(rule => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const dayName = days[rule.day_of_week];
                      const formatTime = (timeStr) => {
                         if (!timeStr) return '';
                         const [h, m] = timeStr.split(':');
                         const date = new Date(2000, 0, 1, parseInt(h, 10), parseInt(m, 10));
                         return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
                      };
                      return (
                        <div key={rule.day_of_week} className="flex items-center gap-4 text-text-secondary font-medium">
                           <div className="w-7 h-7 rounded-full bg-blue-primary text-white text-[11px] flex items-center justify-center font-bold">
                             {dayName[0]}
                           </div>
                           <div className="flex-1">
                             <span className="font-bold text-text-primary uppercase tracking-wide text-[11px] inline-block w-12">{dayName}</span>
                             <span>{formatTime(rule.start_time)} - {formatTime(rule.end_time)}</span>
                           </div>
                        </div>
                      );
                   })}
                   {(!availabilityData?.rules || availabilityData.rules.filter(r => r.is_available).length === 0) && (
                     <div className="text-sm font-medium text-text-muted">No availability set.</div>
                   )}
                </div>
                <p>This event uses your default weekly hours. To change specific dates, manage them in the main Availability tab.</p>
              </div>
            )}
          </div>

          {/* Host Section */}
          <div className="border border-border rounded-xl mb-3 shadow-sm bg-white overflow-hidden">
            <button 
              type="button"
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('host')}
            >
              <div className="text-left">
                <div className="font-bold text-[15px] text-text-primary mb-2">Host & Links</div>
                <div className="flex items-center text-[13px] text-text-secondary font-medium gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] text-text-primary font-bold">
                    K
                  </div>
                  Kaushal Kumar (you)
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeSection === 'host' ? 'rotate-180' : ''}`} />
            </button>
            {activeSection === 'host' && (
              <div className="px-6 pb-6 pt-4 animate-dropdown border-t border-border">
                <Input
                  label="URL Slug"
                  value={form.slug}
                  onChange={handleSlugChange}
                  onBlur={handleSlugBlur}
                  error={errors.slug}
                  placeholder="your-custom-slug"
                />
                <p className="text-[12px] font-medium text-text-muted mt-2 truncate">Link: <span className="text-blue-primary">{bookingLink}</span></p>
                
                <div className="mt-5 space-y-1.5">
                  <label className="block text-sm font-semibold text-text-primary">
                    Description / Instructions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add details you want your invitee to know before the meeting."
                    className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-border bg-white placeholder:text-text-muted hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-primary transition-all duration-fast resize-none"
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
        
        {/* Bottom Actions Line fixed within component */}
        <div className="border-t border-border bg-white flex items-center justify-between p-5 mt-auto z-20">
           <button type="button" onClick={() => window.open(bookingLink, '_blank')} className="text-[14px] font-bold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
              <Users className="w-4 h-4" /> Preview
           </button>
           <div className="flex items-center gap-4">
             <button type="button" className="text-[14px] font-bold text-text-primary hover:text-blue-primary transition-colors">
                More options
             </button>
             <Button size="md" className="px-6" onClick={handleSubmit} loading={loading}>
               {isEdit ? 'Save changes' : 'Create event'}
             </Button>
           </div>
        </div>
        
      </div>
    </div>
  );
}

export default EventTypeForm;

