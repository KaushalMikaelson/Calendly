import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, HelpCircle, ChevronDown, Search, ExternalLink, Users } from 'lucide-react';
import { useEventTypes } from '../hooks/useEventTypes';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { EventTypeCardSkeleton } from '../components/EventTypeCard';
import EventTypeCard from '../components/EventTypeCard';
import BookingPreviewModal from '../components/BookingPreviewModal';
import OfferTimesModal from '../components/OfferTimesModal';
import ShareModal from '../components/ShareModal';
import { eventTypesApi, meetingsApi } from '../api';
import { useToast } from '../components/ui/Toast';
import CreateDropdown from '../components/CreateDropdown';

function Dashboard() {
  const navigate = useNavigate();
  const { items, loading, error, reload, setItems } = useEventTypes();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const createBtnRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [previewEvent, setPreviewEvent] = useState(null);
  const [offerTimesEvent, setOfferTimesEvent] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);

  // Fetch upcoming meetings to show next booked date on each event type card
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  useEffect(() => {
    meetingsApi.getAll('upcoming')
      .then((res) => setUpcomingMeetings(res.data || res))
      .catch(() => {}); // fail silently — not critical
  }, []);

  // Build a map: event_type_id → next upcoming meeting (sorted by start_time asc)
  const nextMeetingByType = useMemo(() => {
    const map = {};
    const now = new Date();
    upcomingMeetings
      .filter((m) => m.status !== 'cancelled' && new Date(m.start_time) >= now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .forEach((m) => {
        // Coerce to string — IDs can be number from one API and string from another
        const tid = String(m.event_type_id ?? m.event_type?.id ?? '');
        if (tid && !map[tid]) map[tid] = m;
      });
    return map;
  }, [upcomingMeetings]);

  const filtered = useMemo(
    () => items
      .filter((e) => (activeTab === 'active' ? e.is_active : !e.is_active))
      .filter((e) => !searchQuery.trim() || e.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [items, activeTab, searchQuery]
  );

  const counts = useMemo(
    () => ({
      active: items.filter((e) => e.is_active).length,
      inactive: items.filter((e) => !e.is_active).length,
    }),
    [items]
  );

  const handleCopyLink = async (event) => {
    const url = `${window.location.origin}/book/${event.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast({ message: 'Link copied!', type: 'success' });
    } catch {
      showToast({ message: url, type: 'info' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await eventTypesApi.delete(deleteTarget.id);
      setItems((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast({ message: 'Event type deleted', type: 'success' });
    } catch (e) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      
      {/* Top Bar matching new layout */}
      <div className="h-16 border-b border-border flex items-center justify-end px-6 sticky top-0 bg-white z-40">
         <div className="flex items-center gap-4">
           <button className="text-text-secondary hover:text-text-primary transition-colors">
              <Users className="w-5 h-5" />
           </button>
           <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pl-2 pr-1 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                K
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted" />
           </button>
         </div>
      </div>

      <div className="page-enter max-w-[1280px] w-full mx-auto pt-8 px-8 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[26px] font-extrabold tracking-tight text-text-primary flex items-center gap-2">
            Scheduling
            <HelpCircle className="w-4 h-4 text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
          </h1>
        
        <div className="relative z-50">
          <Button
            ref={createBtnRef}
            size="md"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 shadow-sm px-6 rounded-full"
          >
            <Plus className="w-4 h-4 -mr-0.5" strokeWidth={3} />
            Create
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </Button>
          <CreateDropdown
            open={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            anchorRef={createBtnRef}
            side="right"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border text-[14px] font-bold text-text-secondary mb-6">
        <button className="text-blue-600 border-b-[3px] border-blue-600 pb-3 -mb-[2px]">Event types</button>
        <button className="pb-3 -mb-[2px] transition-colors border-b-[3px] border-transparent hover:text-text-primary">Single-use links</button>
        <button className="pb-3 -mb-[2px] transition-colors border-b-[3px] border-transparent hover:text-text-primary">Meeting polls</button>
      </div>

      {/* Search */}
      <div className="relative max-w-[340px] mb-8">
        <Search className="w-4 h-4 absolute left-3 top-[18px] -translate-y-1/2 text-text-muted stroke-[2]" />
        <Input
          placeholder="Search event types"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="!pl-9 !h-[36px] text-sm placeholder:text-text-muted !bg-white focus:!bg-white"
        />
      </div>

      {/* Event List Section */}
      <div className="mb-8 mt-12">
        {/* User Header */}
        <div className="flex items-center justify-between mb-4 px-1">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-xs text-blue-600">
               K
             </div>
             <span className="font-extrabold text-[15px] tracking-tight text-text-primary">Kaushal Kumar</span>
           </div>
           
           <button className="flex items-center gap-2 text-[14px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
             <ExternalLink className="w-4 h-4 stroke-[2]" /> View landing page
           </button>
        </div>

        {/* List Container */}
        {error ? (
           <div className="bg-dangerLight/20 border border-danger/20 rounded-xl px-4 py-3 text-sm font-medium text-danger flex items-center justify-between">
             <span>{error}</span>
             <Button size="sm" variant="ghost" onClick={reload} className="hover:bg-danger/10 text-danger">Retry</Button>
           </div>
        ) : loading ? (
           <div className="flex flex-col gap-3">
              <div className="bg-white border border-border shadow-sm rounded-xl"><EventTypeCardSkeleton /></div>
              <div className="bg-white border border-border shadow-sm rounded-xl"><EventTypeCardSkeleton /></div>
           </div>
        ) : filtered.length === 0 ? (
           <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden flex flex-col p-16 text-center">
             <h2 className="text-xl font-extrabold text-text-primary mb-2">{searchQuery ? 'No results found' : 'No event types'}</h2>
             <p className="text-text-secondary text-sm font-medium">{searchQuery ? `No event types match "${searchQuery}".` : 'Please create an event type to get started.'}</p>
           </div>
        ) : (
           <div className="flex flex-col gap-3">
             {filtered.map((event) => (
               <div key={event.id} className="bg-white border border-border shadow-sm rounded-xl">
                 <EventTypeCard
                   event={event}
                   nextMeeting={nextMeetingByType[String(event.id)] || null}
                   onCopyLink={() => handleCopyLink(event)}
                   onEdit={() => navigate(`/event-types/${event.id}/edit`)}
                   onDelete={() => setDeleteTarget(event)}
                   onBookLink={() => setPreviewEvent(event)}
                   onOfferTimes={() => setOfferTimesEvent(event)}
                   onShare={() => setShareEvent(event)}
                 />
               </div>
             ))}
           </div>
        )}
      </div>

      <Modal
         open={!!deleteTarget}
         onClose={() => setDeleteTarget(null)}
         title="Delete Event Type?"
         footer={
           <>
             <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>Cancel</Button>
             <Button variant="danger" size="md" onClick={confirmDelete}>Delete Event Type</Button>
           </>
         }
       >
         <p className="text-base font-medium text-text-secondary">
           This will permanently delete <strong className="text-text-primary">&quot;{deleteTarget?.name}&quot;</strong> and cancel all future bookings associated with it. This action cannot be undone.
         </p>
       </Modal>

       {/* Overlay Action Modals */}
       <BookingPreviewModal 
          open={!!previewEvent} 
          onClose={() => setPreviewEvent(null)} 
          event={previewEvent} 
       />
       <OfferTimesModal 
          open={!!offerTimesEvent} 
          onClose={() => setOfferTimesEvent(null)} 
          event={offerTimesEvent} 
       />
       <ShareModal 
          open={!!shareEvent} 
          onClose={() => setShareEvent(null)} 
          event={shareEvent} 
       />

      </div>
    </div>
  );
}

export default Dashboard;

