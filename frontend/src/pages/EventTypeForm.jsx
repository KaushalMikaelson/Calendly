import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Clock, MapPin, CalendarDays, User, ChevronDown, AlertCircle, Video, Phone, Users, ChevronDownCircle } from 'lucide-react';
import { eventTypesApi } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

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

  // Generate time slots 9am–5pm based on duration
  const timeSlots = useMemo(() => {
    const slots = [];
    const dur = Number(form.duration) || 30;
    let start = 9 * 60;
    const end = 17 * 60;
    while (start + dur <= end) {
      const h = Math.floor(start / 60);
      const m = start % 60;
      const period = h < 12 ? 'AM' : 'PM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      slots.push(`${h12}:${m.toString().padStart(2, '0')} ${period}`);
      start += dur;
    }
    return slots;
  }, [form.duration]);

  const isDateSelectable = (date) => {
    if (!date) return false;
    if (date < today) return false;
    const day = date.getDay();
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

      if (isDuplicateSlug) {
        setErrors((prev) => ({
          ...prev,
          slug: 'This URL is already taken — please choose a different one.',
        }));
        // Open the Host & Links section so the user can see the error
        setActiveSection('host');
        showToast({ message: 'URL slug is already in use. Please choose a unique one.', type: 'error' });
      } else {
        showToast({ message: err.message, type: 'error' });
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
    <div className="h-[calc(100vh-80px)] bg-page page-enter flex overflow-hidden">
      
      {/* Left Area: Live Booking Preview */}
      <div className="flex-1 bg-[#F9FAFB] hidden lg:flex flex-col relative border-r border-border">
        {/* Header Ribbon */}
        <div className="h-16 flex items-center justify-between px-8 bg-white border-b border-border shadow-sm z-10">
           <div className="flex items-center gap-2.5">
             <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: form.color }} />
             <h2 className="text-[15px] font-bold text-text-primary">Preview of {form.name || 'New Meeting'}</h2>
           </div>
           <div className="flex items-center gap-4 text-text-muted">
              <CalendarDays className="w-5 h-5 cursor-pointer hover:text-text-primary transition-colors" />
              <div className="w-px h-5 bg-border" />
              <button 
                type="button" 
                onClick={() => window.open(bookingLink, '_blank')}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border text-sm font-semibold text-text-primary hover:bg-gray-50 transition-colors"
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-sm border-t-0 border-r-0 transform -rotate-45" />
                Copy link
              </button>
           </div>
        </div>

        {/* Live Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-12 flex justify-center pb-32">
          {/* Card Wrapper mimicking actual booking page */}
          <div className="w-full max-w-[800px] bg-white rounded-xl shadow-lg border border-border overflow-hidden self-start flex flex-col md:flex-row min-h-[500px]">
             
             {/* Left Column: Details + selected date/time */}
             <div className="w-full md:w-[40%] p-8 border-b md:border-b-0 md:border-r border-border bg-white flex flex-col">
               <h3 className="text-base font-bold text-text-secondary mb-1">Kaushal Kumar</h3>
               <h1 className="text-3xl font-extrabold text-text-primary mb-6 tracking-tight">{form.name || 'Event Name'}</h1>
               
               <div className="flex flex-col gap-4 text-[15px] font-semibold text-text-secondary">
                 <div className="flex items-center gap-3">
                   <Clock className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
                   {form.duration} min
                 </div>
                 {form.location && (
                   <div className="flex items-start gap-3">
                     {form.location.startsWith('http') || form.location.includes('Zoom') ? (
                       <Video className="w-6 h-6 text-text-muted shrink-0 mt-0.5" strokeWidth={1.5} />
                     ) : form.location.includes('Phone') ? (
                       <Phone className="w-6 h-6 text-text-muted shrink-0 mt-0.5" strokeWidth={1.5} />
                     ) : (
                       <MapPin className="w-6 h-6 text-text-muted shrink-0 mt-0.5" strokeWidth={1.5} />
                     )}
                     <span className="leading-snug">{form.location.startsWith('http') ? 'Web conferencing details provided upon confirmation.' : form.location}</span>
                   </div>
                 )}

                 {/* Selected date & time pill */}
                 {selectedDate && (
                   <div className="flex items-start gap-3 mt-1">
                     <CalendarDays className="w-6 h-6 text-text-muted shrink-0 mt-0.5" strokeWidth={1.5} />
                     <div className="flex flex-col gap-0.5">
                       <span className="text-text-primary">
                         {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                       </span>
                       {selectedTime && (
                         <span className="text-blue-primary font-bold">{selectedTime}</span>
                       )}
                     </div>
                   </div>
                 )}
               </div>
               
               {form.description && (
                  <p className="mt-6 pt-6 border-t border-border text-[15px] leading-relaxed text-text-primary flex-1 whitespace-pre-wrap">
                    {form.description}
                  </p>
               )}
             </div>
             
             {/* Right Column: Interactive Calendar + Time Slots */}
             <div className="flex-1 flex overflow-hidden">

               {/* Calendar panel */}
               <div className={`flex flex-col p-6 transition-all duration-300 ${
                 selectedDate ? 'w-[55%]' : 'w-full'
               }`}>
                 <h2 className="text-[18px] font-bold text-text-primary mb-5 text-center">Select a Date &amp; Time</h2>

                 {/* Month navigation */}
                 <div className="flex items-center justify-between mb-4 px-1">
                   <button
                     type="button"
                     onClick={() => setPreviewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                     className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
                   >
                     <ChevronDown className="w-4 h-4 rotate-90" />
                   </button>
                   <span className="text-[15px] font-semibold text-text-primary">{monthLabel}</span>
                   <button
                     type="button"
                     onClick={() => setPreviewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                     className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-primary hover:bg-blue-100 transition-colors"
                   >
                     <ChevronDown className="w-4 h-4 -rotate-90" />
                   </button>
                 </div>

                 {/* Day headers */}
                 <div className="grid grid-cols-7 mb-2">
                   {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                     <div key={d} className="text-center text-[10px] font-bold text-text-muted tracking-widest py-1">{d}</div>
                   ))}
                 </div>

                 {/* Date grid */}
                 <div className="grid grid-cols-7 gap-y-1">
                   {calendarDays.map((date, idx) => {
                     if (!date) return <div key={`blank-${idx}`} />;
                     const selectable = isDateSelectable(date);
                     const isSelected = isSameDay(date, selectedDate);
                     const isToday = isSameDay(date, today);
                     return (
                       <div key={date.toISOString()} className="flex justify-center">
                         <button
                           type="button"
                           disabled={!selectable}
                            onClick={() => {
                             if (selectable) {
                               setSelectedDate(date);
                               setSelectedTime(null); // clear time when date changes
                             }
                           }}
                           className={`w-9 h-9 flex items-center justify-center rounded-full text-[13px] font-semibold transition-all
                             ${ isSelected
                               ? 'bg-blue-primary text-white shadow-sm'
                               : isToday
                               ? 'border-2 border-blue-primary text-blue-primary'
                               : selectable
                               ? 'text-text-primary hover:bg-blue-50 hover:text-blue-primary cursor-pointer'
                               : 'text-gray-300 cursor-not-allowed'
                             }`}
                         >
                           {date.getDate()}
                         </button>
                       </div>
                     );
                   })}
                 </div>

                 <div className="text-[11px] font-medium text-text-muted text-center mt-4">
                   {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g,' ')}
                 </div>
               </div>

               {/* Time slots panel — slides in when a date is selected */}
               {selectedDate && (
                 <div className="w-[45%] border-l border-border flex flex-col overflow-hidden">
                   <div className="px-3 pt-5 pb-2 shrink-0">
                     <div className="text-[13px] font-bold text-text-primary">
                       {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                     </div>
                   </div>
                   <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
                     {timeSlots.map(slot => {
                       const isSelectedSlot = selectedTime === slot;
                       return isSelectedSlot ? (
                         /* When a slot is selected, split into time + Confirm button */
                         <div key={slot} className="flex gap-1.5">
                           <div className="flex-1 text-center py-2.5 rounded-xl bg-blue-primary text-white text-[13px] font-bold border border-blue-primary">
                             {slot}
                           </div>
                           <button
                             type="button"
                             onClick={() => setSelectedTime(null)}
                             className="flex-1 text-center py-2.5 rounded-xl bg-blue-primary text-white text-[13px] font-bold border border-blue-primary hover:bg-blue-700 transition-colors"
                           >
                             Confirm
                           </button>
                         </div>
                       ) : (
                         <button
                           key={slot}
                           type="button"
                           onClick={() => setSelectedTime(slot)}
                           className="w-full text-center py-2.5 rounded-xl border border-blue-200 text-blue-primary text-[13px] font-semibold hover:bg-blue-primary hover:text-white hover:border-blue-primary transition-all"
                         >
                           {slot}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Right Area: Form Configuration Sidebar */}
      <div className="w-full lg:w-[480px] xl:w-[540px] bg-white h-full flex flex-col relative shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20">
        
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
                  Weekdays, 9 am - 5 pm
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
                   {['M', 'T', 'W', 'T', 'F'].map(day => (
                      <div key={day} className="flex items-center gap-4 text-text-secondary font-medium">
                         <div className="w-6 h-6 rounded-full bg-blue-primary text-white text-[10px] flex items-center justify-center font-bold">
                           {day}
                         </div>
                         <span>9:00am - 5:00pm</span>
                      </div>
                   ))}
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
           <button type="button" className="text-[14px] font-bold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
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

