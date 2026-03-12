import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Calendar({ currentMonth, selectedDate, onMonthChange, onDateSelect, availableDays }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const start = startOfWeek(monthStart, { weekStartsOn: 0 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  const isDisabled = (day) => {
    if (!isSameMonth(day, monthStart)) return true;
    if (isBefore(day, today.setHours(0, 0, 0, 0))) return true;
    if (availableDays && !availableDays.includes(day.getDay())) return true;
    return false;
  };

  const handlePrev = () => onMonthChange(subMonths(currentMonth, 1));
  const handleNext = () => onMonthChange(addMonths(currentMonth, 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-[17px] font-bold text-text-primary capitalize tracking-tight w-32 text-center">
          {format(monthStart, 'MMMM yyyy')}
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-xs font-semibold text-text-muted mb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
          <div key={d} className="text-center tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-sm font-medium">
        {days.map((day) => {
          const disabled = isDisabled(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const todayFlag = isToday(day);

          let cls =
            'w-10 h-10 md:w-11 md:h-11 mx-auto flex items-center justify-center rounded-full transition-all duration-fast cursor-pointer relative font-bold';
          
          if (disabled) {
            cls += ' text-gray-300 font-normal cursor-not-allowed';
          } else if (selected) {
            cls += ' bg-blue-primary text-white shadow-button ring-4 ring-blue-100';
          } else {
            cls += ' text-blue-primary bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95';
            if (todayFlag) {
              cls += ' ring-2 ring-blue-primary/40';
            }
          }

          return (
            <div key={day.toISOString()} className="flex items-center justify-center relative">
               <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onDateSelect(day)}
                  className={cls}
                >
                  {format(day, 'd')}
                </button>
                {todayFlag && !selected && !disabled && (
                  <div className="absolute bottom-[2px] w-1 h-1 rounded-full bg-blue-primary" />
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;

