import React from 'react';
import { useMeetings } from '../hooks/useMeetings';
import Button from '../components/ui/Button';
import MeetingCard from '../components/MeetingCard';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { meetingsApi } from '../api';
import { CalendarDays } from 'lucide-react';

function Meetings() {
  const { items, filter, setFilter, loading, error, reload } = useMeetings('upcoming');
  const { showToast } = useToast();

  const handleCancel = async (id) => {
    try {
      await meetingsApi.cancel(id);
      showToast({ message: 'Meeting cancelled', type: 'success' });
      reload(filter);
    } catch (e) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const upcoming = items.filter((m) => new Date(m.start_time) >= new Date());
  const past = items.filter((m) => new Date(m.start_time) < new Date());

  const activeList = filter === 'upcoming' ? upcoming : filter === 'past' ? past : items;

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Scheduled Events</h1>
        <p className="text-sm font-medium text-text-secondary mt-1">View upcoming and past meetings.</p>
      </div>

      <div className="flex items-center gap-6 border-b border-border text-sm font-semibold">
        <button
          type="button"
          onClick={() => setFilter('upcoming')}
          className={`pb-3 border-b-2 font-bold px-1 transition-colors ${
            filter === 'upcoming'
              ? 'border-blue-primary text-blue-600'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('past')}
          className={`pb-3 border-b-2 font-bold px-1 transition-colors ${
            filter === 'past'
              ? 'border-blue-primary text-blue-600'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Past ({past.length})
        </button>
      </div>

      {error && (
        <div className="bg-dangerLight/20 border border-danger/20 rounded-xl p-4 text-sm font-medium text-danger flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={() => reload(filter)} className="hover:bg-danger/10 text-danger hover:text-danger">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-[20px]" />
          <Skeleton className="h-24 w-full rounded-[20px]" />
          <Skeleton className="h-24 w-full rounded-[20px]" />
        </div>
      ) : activeList.length === 0 ? (
        <div className="text-center py-24 bg-white border border-border rounded-[32px] shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-blue-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDays className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No meetings yet</h3>
          <p className="text-text-secondary font-medium">
            Meetings will appear here once someone books time with you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((m) => (
            <MeetingCard key={m.id} meeting={m} onCancel={() => handleCancel(m.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Meetings;

