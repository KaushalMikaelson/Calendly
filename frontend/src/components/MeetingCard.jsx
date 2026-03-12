import React from 'react';
import { CalendarDays, Clock, Timer, Video } from 'lucide-react';
import Button from './ui/Button';

function formatInIST(date, options) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    ...options,
  }).format(date);
}

function MeetingCard({ meeting, onCancel }) {
  const start = new Date(meeting.start_time);
  const end = new Date(meeting.end_time);

  const dateLabel = formatInIST(start, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const startTime = formatInIST(start, { hour: 'numeric', minute: '2-digit' });
  const endTime = formatInIST(end, { hour: 'numeric', minute: '2-digit' });
  const formattedTime = `${startTime} - ${endTime}`;

  const isUpcoming = start >= new Date();

  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-card-hover hover:border-blue-200 transition-all duration-300">
      <div
        className="hidden sm:block w-1.5 self-stretch rounded-full"
        style={{ backgroundColor: meeting.color || '#006BFF' }}
      />
      <div className="flex-1 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-text-primary capitalize">{meeting.invitee_name}</p>
            <p className="text-sm font-medium text-text-secondary">{meeting.invitee_email}</p>
          </div>
          {meeting.event_type && (
            <span
              className="inline-flex text-xs font-bold px-3 py-1 rounded-full shadow-sm w-fit"
              style={{
                color: meeting.event_type.color || '#006BFF',
                backgroundColor: `${meeting.event_type.color || '#006BFF'}15`,
                border: `1px solid ${meeting.event_type.color || '#006BFF'}30`
              }}
            >
              {meeting.event_type.name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm font-medium text-text-secondary">
          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-border">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            {dateLabel}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-border">
            <Clock className="w-4 h-4 text-orange-500" />
            {formattedTime}
          </span>
          {meeting.event_type && (
            <span className="flex items-center gap-1.5 text-text-muted">
              <Timer className="w-4 h-4" />
              {meeting.event_type.duration} min
            </span>
          )}
        </div>
      </div>
      <div className="sm:self-stretch flex items-center pt-3 sm:pt-0 border-t border-border sm:border-0">
        {meeting.status === 'confirmed' && isUpcoming ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="w-full sm:w-auto text-danger hover:bg-dangerLight/50"
          >
            Cancel
          </Button>
        ) : meeting.status === 'cancelled' ? (
           <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gray-100 text-text-muted rounded-full">
             Cancelled
           </span>
        ) : null}
      </div>
    </div>
  );
}

export default MeetingCard;

