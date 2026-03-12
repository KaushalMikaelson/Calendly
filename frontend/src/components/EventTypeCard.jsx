import React, { useState } from 'react';
import { Clock, Video, Link as LinkIcon, Pencil, Trash2, ExternalLink, CalendarDays, Mail, Share, Copy, MoreVertical, Globe, StickyNote, Lock, Eye } from 'lucide-react';

export function EventTypeCardSkeleton() {
  return <div className="h-[100px] w-full border-b border-border bg-gray-50 animate-pulse" />;
}

function EventTypeCard({ event, onCopyLink, onEdit, onDelete, onBookLink, onOfferTimes, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative group flex items-center p-4 pr-6 bg-white hover:bg-gray-50 border-b last:border-b-0 border-border transition-colors duration-fast">
      {/* Colored Left Border */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md"
        style={{ backgroundColor: event.color || '#7C3AED' }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center gap-4 pl-4 pr-4">
        <input type="checkbox" className="w-[18px] h-[18px] border-gray-300 rounded text-blue-primary focus:ring-blue-primary cursor-pointer shrink-0" />
        
        <div className="flex flex-col text-left">
           <h3 className="font-bold text-[17px] text-text-primary tracking-tight">{event.name}</h3>
           <div className="text-[13px] font-medium text-text-secondary mt-1 max-w-[500px] truncate">
             {event.duration} min • {event.location || 'No location'} • One-on-One
           </div>
           <div className="text-[13px] font-medium text-text-muted">
             Weekdays, 9 am - 5 pm
           </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
         <button 
           type="button"
           onClick={() => onBookLink && onBookLink()}
           className="text-text-muted hover:text-[#006BFF] hover:bg-blue-50/80 p-2 rounded-lg transition-colors relative"
           title="Book a meeting"
         >
            <CalendarDays className="w-5 h-5 stroke-[1.5]" />
         </button>
         <button 
           type="button"
           onClick={() => onOfferTimes && onOfferTimes()}
           className="text-text-muted hover:text-[#006BFF] hover:bg-blue-50/80 p-2 rounded-lg transition-colors relative"
           title="Offer time slots"
         >
            <Clock className="w-5 h-5 stroke-[1.5]" />
         </button>
         <button 
           type="button"
           onClick={() => onShare && onShare()}
           className="text-text-muted hover:text-[#006BFF] hover:bg-blue-50/80 p-2 rounded-lg transition-colors relative"
           title="Share availability"
         >
            <Share className="w-5 h-5 stroke-[1.5]" />
         </button>
         
         <div className="w-px h-6 bg-border mx-2" />
         
         <button
            type="button"
            onClick={onCopyLink}
            className="text-[13px] font-bold text-text-primary hover:text-[#006BFF] flex items-center gap-2 transition-colors border border-gray-300 hover:border-blue-200 bg-white hover:bg-blue-50/80 px-3.5 py-1.5 rounded-full shadow-sm"
         >
            <Copy className="w-4 h-4 stroke-[2]" />
            Copy link
         </button>
         
         {/* Vertical Options Menu */}
         <div className="relative">
           <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-text-muted hover:text-[#006BFF] hover:bg-blue-50/80 p-2 rounded-lg transition-colors ml-1"
           >
              <MoreVertical className="w-5 h-5 stroke-[1.5]" />
           </button>
           
           {menuOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
               <div className="absolute right-0 top-full mt-1 w-[240px] bg-white border border-border shadow-modal rounded-xl z-50 animate-dropdown overflow-hidden text-left py-2">
                 
                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex items-center gap-3">
                   <ExternalLink className="w-4 h-4" /> View booking page
                 </button>
                 <button onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex items-center gap-3">
                   <Pencil className="w-4 h-4" /> Edit
                 </button>
                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex items-center gap-3">
                   <Lock className="w-4 h-4" /> Edit permissions
                 </button>
                 
                 <div className="h-px bg-border my-2" />
                 
                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex items-center gap-3">
                   <Globe className="w-4 h-4" /> Add to website
                 </button>
                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex items-center gap-3">
                   <StickyNote className="w-4 h-4" /> Add internal note
                 </button>
                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex flex-col justify-center gap-1">
                   <div className="flex items-center gap-3"><Globe className="w-4 h-4 invisible" /> Change invitee language</div>
                   <span className="text-text-muted text-[12px] ml-7">English</span>
                 </button>
                 
                 <div className="h-px bg-border my-2" />
                 
                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] font-medium text-text-primary flex items-center gap-3">
                   <Eye className="w-4 h-4" /> Make secret
                 </button>
                 <button onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-[14px] font-bold text-danger flex items-center gap-3 group">
                   <Trash2 className="w-4 h-4 text-danger group-hover:text-red-700" /> Delete
                 </button>
               </div>
             </>
           )}
         </div>
      </div>
    </div>
  );
}

export default EventTypeCard;

