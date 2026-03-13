import React, { useRef, useEffect } from 'react';
import { User, Star, Link, MoreVertical, Bookmark, HelpCircle, ExternalLink } from 'lucide-react';

function ProfileDropdown({ open, onClose, anchorRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open || !anchorRef?.current || !panelRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    
    panel.style.right = `${window.innerWidth - rect.right}px`;
    panel.style.top = `${rect.bottom + 8}px`;
    panel.style.left = 'auto';
  }, [open, anchorRef]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed z-50 w-[300px] bg-white/95 backdrop-blur-2xl border border-white/60 shadow-modal rounded-2xl animate-dropdown text-left pb-1 overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <h3 className="font-bold text-[#1A2E46] text-[16px] leading-tight mb-1">Kaushal Kumar</h3>
          <p className="text-[14px] text-[#4A6380] flex items-center gap-1 mb-2.5">
            Teams free trial <span className="text-[#006BFF] font-bold cursor-pointer hover:underline">Upgrade</span>
          </p>
          <div className="inline-flex bg-[#EBF0F5] text-[#1A2E46] font-bold text-[13px] px-2.5 py-1 rounded-[6px]">
            14 days left
          </div>
        </div>

        <div className="px-2 pt-3 pb-2 border-b border-border">
          <p className="px-3 mb-1 text-[13px] font-bold text-[#4A6380]">Account settings</p>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <User className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            Profile
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <Star className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            Branding
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <Link className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            My Link
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <MoreVertical className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            All settings
          </button>
        </div>

        <div className="px-2 pt-3 pb-2 border-b border-border">
          <p className="px-3 mb-1 text-[13px] font-bold text-[#4A6380]">Resources</p>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <Bookmark className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            Getting started guide
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <HelpCircle className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            Community
          </button>
        </div>

        <div className="px-2 py-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#1A2E46] font-bold text-[15px]">
            <ExternalLink className="w-[18px] h-[18px] text-[#4A6380] stroke-[2.5]" />
            Visit calendly.com
          </button>
        </div>

      </div>
    </>
  );
}

export default ProfileDropdown;
