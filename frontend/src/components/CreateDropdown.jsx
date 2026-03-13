import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * The dropdown panel that lists all event creation options.
 * Renders as a portaled fixed panel anchored to `anchorRef`.
 *
 * Props:
 *  open        – boolean
 *  onClose     – function
 *  anchorRef   – ref to the trigger button (for positioning)
 *  side        – 'left' | 'right'  (which side of the anchor to open on)
 */
function CreateDropdown({ open, onClose, anchorRef, side = 'right' }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Position the panel relative to its anchor button
  useEffect(() => {
    if (!open || !anchorRef?.current || !panelRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    const panelW = 380;

    if (side === 'left') {
      // Sidebar: open to the RIGHT of the anchor
      panel.style.left = `${rect.right + 8}px`;
      panel.style.top = `${rect.top}px`;
    } else {
      // Dashboard header: open below + align right edge
      panel.style.right = `${window.innerWidth - rect.right}px`;
      panel.style.top = `${rect.bottom + 8}px`;
      panel.style.left = 'auto';
    }
  }, [open, anchorRef, side]);

  if (!open) return null;

  const go = (path) => { onClose(); navigate(path); };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed z-50 w-[380px] bg-white/95 backdrop-blur-2xl border border-white/60 shadow-modal rounded-[12px] animate-dropdown text-left pb-1 overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3">
          <h3 className="font-bold text-[#1A2E46] text-[15px] mb-3">Event type</h3>

          <button type="button" onClick={() => go('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[#006BFF] text-[15.5px]">One-on-one</span>
            <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
              <span>1 host</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>1 invitee</span>
            </div>
            <span className="text-[14.5px] text-[#4A6380] mt-0.5">Good for coffee chats, 1:1 interviews, etc.</span>
          </button>

          <button type="button" onClick={() => go('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[#006BFF] text-[15.5px]">Group</span>
            <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
              <span>1 host</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>Multiple invitees</span>
            </div>
            <span className="text-[14.5px] text-[#4A6380] mt-0.5">Webinars, online classes, etc.</span>
          </button>

          <button type="button" onClick={() => go('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[#006BFF] text-[15.5px]">Round robin</span>
            <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
              <span>Rotating hosts</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>1 invitee</span>
            </div>
            <span className="text-[14.5px] text-[#4A6380] mt-0.5">Distribute meetings between team members</span>
          </button>

          <button type="button" onClick={() => go('/event-types/new')} className="w-full text-left mb-2 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[#006BFF] text-[15.5px]">Collective</span>
            <div className="flex items-center gap-2 text-[15px] text-[#1A2E46] mt-0.5 tracking-tight">
              <span>Multiple hosts</span> <ArrowRight className="w-4 h-4 stroke-[1.5]" /> <span>1 invitee</span>
            </div>
            <span className="text-[14.5px] text-[#4A6380] mt-0.5">Panel interviews, group sales calls, etc.</span>
          </button>
        </div>

        <div className="border-t border-[#E5E7EB] px-5 pt-4 pb-3">
          <h3 className="font-bold text-[#1A2E46] text-[15px] mb-3">More ways to meet</h3>

          <button type="button" onClick={() => go('/event-types/new')} className="w-full text-left mb-4 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[#006BFF] text-[15.5px]">One-off meeting</span>
            <span className="text-[14.5px] text-[#4A6380] mt-0.5">Offer time outside your normal schedule</span>
          </button>

          <button type="button" onClick={() => go('/event-types/new')} className="w-full text-left mb-2 flex flex-col hover:bg-[#F8F9FA] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <span className="font-bold text-[#006BFF] text-[15.5px]">Meeting poll</span>
            <span className="text-[14.5px] text-[#4A6380] mt-0.5">Let invitees vote on a time to meet</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateDropdown;
