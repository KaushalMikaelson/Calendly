import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { bookingsApi } from '../api';
import { useToast } from '../components/ui/Toast';

function CancelPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await bookingsApi.getByToken(token);
        const data = res.data || res;
        setBooking(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const res = await bookingsApi.cancelByToken(token);
      const data = res.data || res;
      setBooking(data);
      setSuccess(true);
      showToast({ message: 'Meeting cancelled', type: 'success' });
    } catch (e) {
      setError(e.message);
      showToast({ message: e.message, type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  let content;
  if (loading) {
    content = (
       <div className="flex flex-col items-center justify-center p-8">
         <div className="w-8 h-8 border-4 border-blue-primary border-t-transparent rounded-full animate-spin shadow-button mb-4" />
         <p className="text-sm font-medium text-text-secondary">Loading booking...</p>
       </div>
    );
  } else if (error || !booking) {
    content = (
      <div className="text-center p-6 bg-dangerLight/20 rounded-2xl border border-danger/20">
         <p className="text-sm font-medium text-danger">{error || 'Invalid cancellation link.'}</p>
      </div>
    );
  } else if (success || booking.status === 'cancelled') {
    content = (
       <div className="text-center p-8 space-y-4">
         <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
         </div>
         <h2 className="text-2xl font-bold tracking-tight text-text-primary">Cancellation Confirmed</h2>
         <p className="text-base text-text-secondary font-medium">Your meeting has been cancelled.</p>
       </div>
    );
  } else {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const dateLabel = start.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
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

    content = (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary text-center">Cancel this event?</h2>
        <div className="bg-gray-50 border border-border p-6 rounded-2xl space-y-4">
           <p className="text-base font-bold text-text-primary mb-2">
             Meeting with {booking.invitee_name}
           </p>
           <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
               <CalendarDays className="w-4 h-4" />
             </div>
             {dateLabel}
           </div>
           <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
             </div>
             {timeLabel}
           </div>
        </div>
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          loading={cancelling}
          onClick={handleCancel}
        >
          Yes, cancel meeting
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4 py-10 page-enter font-sans">
      <div className="max-w-[480px] w-full bg-white rounded-[32px] border border-border shadow-modal p-8 md:p-10 space-y-8">
        {content}
        <div className="text-center !mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelPage;

