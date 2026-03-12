import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, HelpCircle, ChevronDown, Search, ExternalLink, Users, ArrowRight } from 'lucide-react';
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
import { eventTypesApi } from '../api';
import { useToast } from '../components/ui/Toast';

function Dashboard() {
  const navigate = useNavigate();
  const { items, loading, error, reload, setItems } = useEventTypes();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Modal states
  const [previewEvent, setPreviewEvent] = useState(null);
  const [offerTimesEvent, setOfferTimesEvent] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);

  const filtered = useMemo(
    () => items.filter((e) => (activeTab === 'active' ? e.is_active : !e.is_active)),
    [items, activeTab]
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

      <div className="page-enter max-w-[1080px] w-full mx-auto pt-8 px-8 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[26px] font-extrabold tracking-tight text-text-primary flex items-center gap-2">
            Scheduling
            <HelpCircle className="w-4 h-4 text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
          </h1>
        
        <div className="relative z-50">
          <Button
            size="md"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 shadow-sm px-6 rounded-full"
          >
            <Plus className="w-4 h-4 -mr-0.5" strokeWidth={3} />
            Create
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </Button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-[380px] bg-white border border-border shadow-modal rounded-[8px] z-50 animate-dropdown text-left pb-1 overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <h3 className="font-bold text-[#1A2E46] text-[15px] mb-3">Event type</h3>
                  
                  <button type="button" onClick={() => navigate('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                    <span className="font-bold text-[#006BFF] text-[15.5px]">One-on-one</span>
                    <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
                      <span>1 host</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>1 invitee</span>
                    </div>
                    <span className="text-[14.5px] text-[#4A6380] mt-0.5">Good for coffee chats, 1:1 interviews, etc.</span>
                  </button>
                  
                  <button type="button" onClick={() => navigate('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                    <span className="font-bold text-[#006BFF] text-[15.5px]">Group</span>
                    <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
                      <span>1 host</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>Multiple invitees</span>
                    </div>
                    <span className="text-[14.5px] text-[#4A6380] mt-0.5">Webinars, online classes, etc.</span>
                  </button>
                  
                  <button type="button" onClick={() => navigate('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                    <span className="font-bold text-[#006BFF] text-[15.5px]">Round robin</span>
                    <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
                      <span>Rotating hosts</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>1 invitee</span>
                    </div>
                    <span className="text-[14.5px] text-[#4A6380] mt-0.5">Distribute meetings between team members</span>
                  </button>
                  
                  <button type="button" onClick={() => navigate('/event-types/new')} className="w-full text-left mb-2 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                    <span className="font-bold text-[#006BFF] text-[15.5px]">Collective</span>
                    <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
                      <span>Multiple hosts</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>1 invitee</span>
                    </div>
                    <span className="text-[14.5px] text-[#4A6380] mt-0.5">Panel interviews, group sales calls, etc.</span>
                  </button>
                </div>
                
                <div className="border-t border-[#E5E7EB] px-5 pt-4 pb-3">
                  <h3 className="font-bold text-[#1A2E46] text-[15px] mb-3">More ways to meet</h3>
                  
                  <button type="button" onClick={() => navigate('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                    <span className="font-bold text-[#006BFF] text-[15.5px]">One-off meeting</span>
                    <span className="text-[14.5px] text-[#4A6380] mt-0.5">Offer time outside your normal schedule</span>
                  </button>
                  
                  <button type="button" onClick={() => navigate('/event-types/new')} className="w-full text-left mb-2 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors group">
                    <span className="font-bold text-[#006BFF] text-[15.5px]">Meeting poll</span>
                    <span className="text-[14.5px] text-[#4A6380] mt-0.5">Let invitees vote on a time to meet</span>
                  </button>
                </div>
              </div>
            </>
          )}
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
        <Input placeholder="Search event types" className="!pl-9 !h-[36px] text-sm placeholder:text-text-muted !bg-white focus:!bg-white" />
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
           <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden flex flex-col">
              <EventTypeCardSkeleton />
              <EventTypeCardSkeleton />
           </div>
        ) : filtered.length === 0 ? (
           <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden flex flex-col p-16 text-center">
             <h2 className="text-xl font-extrabold text-text-primary mb-2">No event types</h2>
             <p className="text-text-secondary text-sm font-medium">Please create an event type to get started.</p>
           </div>
        ) : (
           <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden flex flex-col">
             {filtered.map((event) => (
               <EventTypeCard
                 key={event.id}
                 event={event}
                 onCopyLink={() => handleCopyLink(event)}
                 onEdit={() => navigate(`/event-types/${event.id}/edit`)}
                 onDelete={() => setDeleteTarget(event)}
                 onBookLink={() => setPreviewEvent(event)}
                 onOfferTimes={() => setOfferTimesEvent(event)}
                 onShare={() => setShareEvent(event)}
               />
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

