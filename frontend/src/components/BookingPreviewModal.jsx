import React from 'react';
import { X, Clock, Video, Globe, CalendarDays, ChevronDown } from 'lucide-react';

export default function BookingPreviewModal({ open, onClose, event }) {
  if (!open || !event) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={onClose} />
      <div className="fixed top-[5vh] left-1/2 -translate-x-1/2 w-full max-w-[1040px] bg-white rounded-2xl shadow-modal z-[101] flex flex-col animate-in zoom-in-95 h-[90vh]">
        
        {/* Header Ribbon - Optional, matching Calendly's clean modal look */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 z-10 transition-colors">
          <X className="w-6 h-6 stroke-[1.5]" />
        </button>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden rounded-2xl">
          
          {/* Left Column (Meeting Details & Form) */}
          <div className="w-full md:w-[42%] p-8 md:p-10 border-r border-border bg-white overflow-y-auto custom-scrollbar flex flex-col">
             
             <div className="text-[13px] font-bold text-text-secondary mb-1">Meeting Details</div>
             <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight mb-6 flex items-center gap-2">
               {event.name}
               <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
               </svg>
             </h1>
             
             <div className="flex flex-col gap-3 font-semibold text-text-primary text-[15px] mb-8">
               <div className="flex items-center gap-3 text-blue-600">
                 <Clock className="w-5 h-5" strokeWidth={2} />
                 {event.duration} min
                 <ChevronDown className="w-4 h-4 text-text-muted ml-auto" />
               </div>
               <div className="flex items-center gap-3 text-blue-600">
                 <Video className="w-5 h-5 text-[#00897B]" strokeWidth={2} /> {/* Google Meet colors */}
                 Google Meet web conference
                 <ChevronDown className="w-4 h-4 text-text-muted ml-auto" />
               </div>
             </div>

             <div className="mb-8">
               <div className="text-[14px] font-bold text-text-secondary mb-3">Hosts</div>
               <div className="bg-[#F3F4F6] rounded-xl p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-white">
                      K
                    </div>
                    <span className="text-[14px] font-semibold text-text-primary">Kaushal Kumar (you)</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-text-secondary text-[13px] font-bold">
                   <Globe className="w-4 h-4" /> IST
                 </div>
               </div>
             </div>

             <div className="flex-1">
                <div className="text-[14px] font-bold text-text-secondary mb-4">Invitee details</div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-bold text-text-primary mb-1">Name</label>
                    <input className="w-full h-11 border border-border rounded-lg px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-text-primary mb-1">Email</label>
                    <input className="w-full h-11 border border-border rounded-lg px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                  
                  <button className="text-[14px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    + Add guests
                  </button>

                  <div className="pt-2">
                    <label className="block text-[14px] font-bold text-text-primary mb-1">Contact questions</label>
                  </div>
                </div>
             </div>

             <div className="pt-8 mt-auto">
               <button className="w-full bg-[#0069FF] hover:bg-blue-700 text-white font-bold text-[15px] h-[46px] rounded-full transition-colors shadow-button">
                 Book meeting
               </button>
             </div>
          </div>

          {/* Right Column (Calendar / Time Slots) */}
          <div className="flex-1 bg-white p-8 md:p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
             
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-[20px] font-extrabold text-text-primary">Select a time to book</h2>
               <button className="text-[13px] font-bold text-text-primary border border-border rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                 <CalendarDays className="w-4 h-4" /> Override available times
               </button>
             </div>

             <div className="flex items-center gap-2 text-[13px] font-semibold text-text-secondary mb-10">
                <Globe className="w-4 h-4" /> Time zone display: <span className="text-blue-600 cursor-pointer">India Standard Time (11:32pm) <ChevronDown className="w-3 h-3 inline pb-0.5" /></span>
             </div>

             {/* Internal split: Calendar vs Slots */}
             <div className="flex gap-10 flex-1">
                
                {/* Calendar Side */}
                <div className="flex-1 max-w-[340px]">
                  <div className="flex items-center justify-between mb-6 px-4">
                    <button className="text-text-muted hover:bg-gray-100 p-2 rounded-full"><ChevronDown className="w-5 h-5 rotate-90" /></button>
                    <span className="text-[16px] font-medium text-text-primary">March 2026</span>
                    <button className="text-blue-600 bg-blue-50 p-2 rounded-full"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                       <div key={d} className="text-[11px] font-bold text-text-secondary mb-2">{d}</div>
                    ))}
                    
                    {[...Array(31)].map((_, i) => {
                       const isSelected = i === 19; // 20th
                       const isAvailable = [15, 16, 17, 18, 19, 23, 24, 25, 26, 29, 30].includes(i);
                       return (
                         <div key={i} className="flex justify-center py-1">
                           <div className={`w-11 h-11 flex items-center justify-center rounded-full text-[15px] transition-colors cursor-pointer
                             ${isSelected ? 'bg-[#0069FF] text-white font-bold' : 
                               isAvailable ? 'text-blue-600 font-bold bg-blue-50/50 hover:bg-blue-100' : 'text-text-primary hover:bg-gray-100 font-medium'
                             }
                           `}>
                             {i + 1}
                           </div>
                         </div>
                       );
                    })}
                  </div>
                </div>

                {/* Slots Side */}
                <div className="w-[260px] flex flex-col items-center">
                   <div className="text-[16px] font-medium text-text-primary mb-6 w-full text-center">Friday, March 20</div>
                   
                   <div className="flex flex-col gap-3 w-full overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                     {['9:00am', '9:30am', '10:00am', '10:30am', '11:00am', '11:30am', '12:00pm', '12:30pm'].map(time => (
                       <button key={time} className="w-full border border-[#0069FF]/30 text-[#0069FF] font-bold text-[15px] py-3 rounded-[4px] hover:border-[#0069FF] hover:border-2 hover:bg-blue-50 transition-all">
                         {time}
                       </button>
                     ))}
                   </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </>
  );
}
