import React from 'react';
import Skeleton from './ui/Skeleton';
import Button from './ui/Button';

function TimeSlotPicker({ slots, loading, selectedSlot, onSelectSlot, onConfirmSlot }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-border">
        <p className="text-sm font-medium text-text-secondary">
          No available times for this date.
        </p>
        <p className="text-xs text-text-muted mt-1">Try selecting another day.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
      {slots.map((slot) => {
        const isSelected = selectedSlot && selectedSlot.startISO === slot.startISO;
        if (isSelected) {
          return (
            <div
              key={slot.startISO}
              className="w-full flex items-center gap-2 rounded-xl border border-blue-primary bg-blue-50/50 p-1.5 animate-fade-in shadow-button"
            >
              <div className="flex-1 text-sm font-bold text-blue-900 text-center">{slot.start}</div>
              <Button
                size="md"
                onClick={() => onConfirmSlot && onConfirmSlot(slot)}
                className="text-sm px-6 font-bold shadow-sm"
              >
                Next
              </Button>
            </div>
          );
        }
        return (
          <button
            key={slot.startISO}
            type="button"
            onClick={() => onSelectSlot(slot)}
            className="w-full py-3.5 text-sm rounded-xl border border-blue-200 bg-white text-center font-bold text-blue-600 hover:border-blue-primary hover:bg-blue-primary hover:text-white hover:shadow-button hover:-translate-y-0.5 transition-all duration-fast"
          >
            {slot.start}
          </button>
        );
      })}
    </div>
  );
}

export default TimeSlotPicker;

