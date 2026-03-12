import React from 'react';
import { X, CalendarDays, ChevronDown, Info, Globe, Pencil, Trash2 } from 'lucide-react';

export default function OfferTimesModal({ open, onClose, event }) {
  if (!open || !event) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={onClose} />
      <div className="fixed top-[5vh] left-1/2 -translate-x-1/2 w-full max-w-[640px] bg-white rounded-2xl shadow-modal z-[101] flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
          
          <h2 className="text-[20px] font-extrabold text-text-primary tracking-tight mb-2">Offer time slots in email</h2>
          <div className="flex items-center gap-2 text-[14px] font-medium text-text-secondary">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: event.color || '#7C3AED' }} />
            {event.name}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <p className="text-[15px] font-medium text-text-primary leading-relaxed mb-6">
            Copy time slot suggestions and paste them into an email message to share your availability. Your full booking page link will also be included.
          </p>

          <div className="mb-6">
            <label className="block text-[14px] font-bold text-text-primary mb-2">Offer availability</label>
            <button className="w-full text-left h-12 px-4 border border-border rounded-xl flex items-center justify-between hover:border-text-primary transition-colors bg-white">
              <div className="flex items-center gap-3 text-[15px] font-medium text-text-primary">
                <CalendarDays className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                Next 3 available days
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Preview Container */}
          <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
             <div className="bg-gray-50 px-5 py-4 border-b border-border flex items-center gap-2 text-[15px] font-bold text-text-primary">
               Preview <Info className="w-4 h-4 text-text-muted" strokeWidth={2} />
             </div>
             
             <div className="p-5">
               <label className="block text-[14px] font-bold text-text-primary mb-2">Displayed time zone</label>
               <button className="flex items-center gap-2 text-blue-600 font-bold text-[14px] mb-6 hover:text-blue-800 transition-colors">
                 <Globe className="w-4 h-4" /> India Standard Time <ChevronDown className="w-4 h-4" />
               </button>

               {/* Date Blocks inside Preview */}
               <div className="bg-gray-50/50 rounded-xl p-5 border border-border space-y-8">
                 
                 {/* Day 1 */}
                 <div>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-[15px] font-bold text-text-primary">Friday, March 13</h4>
                     <div className="flex items-center gap-3">
                       <button className="text-text-muted hover:text-text-primary"><Pencil className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
                       <button className="text-text-muted hover:text-text-primary"><Trash2 className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'].map(time => (
                       <div key={time} className="border border-border bg-white rounded-md px-4 py-2 text-[14px] font-semibold text-text-secondary hover:border-gray-400 cursor-pointer">
                         {time}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Day 2 */}
                 <div>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-[15px] font-bold text-text-primary">Monday, March 16</h4>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'].map(time => (
                       <div key={time} className="border border-border bg-white rounded-md px-4 py-2 text-[14px] font-semibold text-text-secondary hover:border-gray-400 cursor-pointer">
                         {time}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Day 3 */}
                 <div>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-[15px] font-bold text-text-primary">Tuesday, March 17</h4>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'].map(time => (
                       <div key={time} className="border border-border bg-white rounded-md px-4 py-2 text-[14px] font-semibold text-text-secondary hover:border-gray-400 cursor-pointer">
                         {time}
                       </div>
                     ))}
                   </div>
                 </div>

               </div>
               
             </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 bg-white border-t border-border flex items-center justify-end z-10 sticky bottom-0 rounded-b-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-2.5 rounded-full transition-colors shadow-button">
            Copy to clipboard
          </button>
        </div>

      </div>
    </>
  );
}
