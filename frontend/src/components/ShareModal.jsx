import React from 'react';
import { X, AlertTriangle, Bold, Italic, Underline, List, ListOrdered, Link, Undo, Redo, ChevronDown } from 'lucide-react';

export default function ShareModal({ open, onClose, event }) {
  if (!open || !event) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-2xl shadow-modal z-[101] flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
          
          <h2 className="text-[20px] font-extrabold text-text-primary tracking-tight mb-2">Sharing: {event.name}</h2>
          <div className="flex items-center gap-2 text-[14px] font-semibold text-text-secondary">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: event.color || '#7C3AED' }} />
            {event.name}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[15px] font-bold text-text-primary">Share via email</h3>
             <div className="text-[13px] font-medium text-text-secondary flex items-center gap-1.5">
               From: <button className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1">Connect your email <ChevronDown className="w-4 h-4" /></button>
             </div>
          </div>

          <div className="bg-[#FFF3E0] border border-[#FFCF99] rounded-xl p-4 flex items-start gap-4 mb-6 text-[#E65100]">
            <AlertTriangle className="w-[18px] h-[18px] mt-0.5" strokeWidth={2.5} />
            <span className="text-[15px] font-medium leading-relaxed">Connect your email account to send available times.</span>
          </div>

          <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden mb-6 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
             
             {/* To field */}
             <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center text-[15px] text-text-primary w-full gap-2">
                   <span className="text-text-muted font-medium w-[30px]">To:</span>
                   <input 
                     type="text" 
                     placeholder="add contact or email address" 
                     className="w-full bg-transparent focus:outline-none placeholder:text-text-secondary text-text-primary font-medium" 
                   />
                </div>
                <div className="flex items-center gap-4 text-[14px] font-bold text-text-primary ml-4">
                   <button className="hover:text-blue-600 transition-colors">Cc</button>
                   <button className="hover:text-blue-600 transition-colors">Bcc</button>
                </div>
             </div>

             {/* Subject field */}
             <div className="flex items-center px-4 py-3 border-b border-border text-[15px]">
                <span className="text-text-muted font-medium w-auto mr-3">Subject:</span>
                <input 
                  type="text" 
                  defaultValue={`Schedule ${event.name}`}
                  className="w-full bg-transparent focus:outline-none text-text-primary font-semibold" 
                />
             </div>

             {/* formatting toolbar */}
             <div className="flex items-center gap-1 px-4 py-2 border-b border-border text-text-secondary">
               <button className="p-1.5 hover:bg-gray-100 rounded-md"><Bold className="w-[18px] h-[18px]" strokeWidth={2} /></button>
               <button className="p-1.5 hover:bg-gray-100 rounded-md"><Italic className="w-[18px] h-[18px]" strokeWidth={2} /></button>
               <button className="p-1.5 hover:bg-gray-100 rounded-md mr-2"><Underline className="w-[18px] h-[18px]" strokeWidth={2} /></button>

               <button className="p-1.5 hover:bg-gray-100 rounded-md"><List className="w-[18px] h-[18px]" strokeWidth={2} /></button>
               <button className="p-1.5 hover:bg-gray-100 rounded-md mr-2"><ListOrdered className="w-[18px] h-[18px]" strokeWidth={2} /></button>

               <button className="p-1.5 hover:bg-gray-100 rounded-md mr-2 text-text-muted"><Link className="w-[18px] h-[18px]" strokeWidth={2} /></button>

               <button className="p-1.5 hover:bg-gray-100 rounded-md"><Undo className="w-[18px] h-[18px]" strokeWidth={2} /></button>
               <button className="p-1.5 hover:bg-gray-100 rounded-md"><Redo className="w-[18px] h-[18px]" strokeWidth={2} /></button>
             </div>

             {/* Textarea */}
             <textarea 
               className="w-full h-[220px] p-4 bg-transparent border-none focus:outline-none text-[15px] text-text-primary leading-relaxed resize-none font-medium custom-scrollbar"
               defaultValue={`Hello,\n\nI look forward to connecting. Feel free to share some times you're available, or choose a time that works best for you on my booking page.\n\nThanks,\nKaushal Kumar`}
             />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" className="w-[18px] h-[18px] border-border rounded text-blue-600 focus:ring-blue-500 transition-colors" />
             <span className="text-[14px] font-medium text-text-primary group-hover:text-blue-800 transition-colors flex items-center gap-1">
               Send reminder to schedule if recipients haven't scheduled in <span className="text-blue-600 flex items-center font-bold">3 days <ChevronDown className="w-3.5 h-3.5" /></span>
             </span>
          </label>
        </div>
      </div>
    </>
  );
}
