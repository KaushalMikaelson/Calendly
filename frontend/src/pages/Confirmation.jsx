import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, CalendarDays, Clock, Timer, MapPin, Mail, User } from 'lucide-react';
import Button from '../components/ui/Button';

function formatGCalDate(isoString) {
  return new Date(isoString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    navigate('/', { replace: true });
    return null;
  }

  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);

  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = `${start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    booking.event_type_name || 'Meeting'
  )}&dates=${formatGCalDate(booking.start_time)}/${formatGCalDate(
    booking.end_time
  )}&details=${encodeURIComponent(`Meeting via ${booking.location}`)}&location=${encodeURIComponent(
    booking.location
  )}`;

  const handleAddGoogle = () => {
    window.open(gcalUrl, '_blank');
  };

  const handleAddIcs = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Calendly Clone//EN',
      'BEGIN:VEVENT',
      `UID:${booking.cancel_token || booking.start_time}`,
      `DTSTAMP:${formatGCalDate(new Date().toISOString())}`,
      `DTSTART:${formatGCalDate(booking.start_time)}`,
      `DTEND:${formatGCalDate(booking.end_time)}`,
      `SUMMARY:${booking.event_type_name || 'Meeting'}`,
      `DESCRIPTION:Meeting via ${booking.location}`,
      `LOCATION:${booking.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4 py-10 page-enter font-sans">
      <div className="max-w-[600px] w-full bg-white rounded-[32px] shadow-modal border border-border p-10 md:p-14 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-successLight/30 flex items-center justify-center animate-[fadeIn_0.5s_ease-out]">
          <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-md">
             <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight mt-8 mb-3">You are scheduled</h1>
        <p className="text-base text-text-secondary font-medium">
          A calendar invitation has been sent to your email address.
        </p>

        <div className="mt-10 border border-border rounded-2xl p-6 text-left space-y-5 bg-gray-50/50">
          <h3 className="font-bold text-lg text-text-primary border-b border-border pb-4">{booking.event_type_name}</h3>
          
          <div className="flex items-center gap-4 text-base text-text-primary font-medium">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
               <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Date</div>
              <div>{dateLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-base text-text-primary font-medium">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
               <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Time</div>
              <div>{timeLabel} IST</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-base text-text-primary font-medium">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
               <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-text-secondary text-sm">Location</div>
              <div>{booking.location}</div>
            </div>
          </div>

          {booking.duration && (
            <div className="flex items-center gap-4 text-base text-text-primary font-medium">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                 <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-text-secondary text-sm">Duration</div>
                <div>{booking.duration} minutes</div>
              </div>
            </div>
          )}

          {booking.invitee_name && (
            <div className="flex items-center gap-4 text-base text-text-primary font-medium">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                 <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-text-secondary text-sm">Invitee</div>
                <div>{booking.invitee_name}</div>
              </div>
            </div>
          )}

          {booking.invitee_email && (
            <div className="flex items-center gap-4 text-base text-text-primary font-medium">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                 <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-text-secondary text-sm">Email</div>
                <div>{booking.invitee_email}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleAddGoogle} className="w-full sm:w-auto px-8 shadow-button">
            Add to Google Calendar
          </Button>
          <Button size="lg" variant="secondary" onClick={handleAddIcs} className="w-full sm:w-auto px-8">
            Add to iCal
          </Button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border">
           <button
             type="button"
             onClick={() => navigate('/', { replace: true })}
             className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
           >
             Need to cancel? Click here
           </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;

