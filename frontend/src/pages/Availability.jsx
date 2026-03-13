import React, { useMemo, useState } from 'react';
import { availabilityApi } from '../api';
import { useAvailability } from '../hooks/useAvailability';
import Toggle from '../components/ui/Toggle';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = (() => {
  const times = [];
  for (let h = 0; h < 24; h += 1) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
})();

function Availability() {
  const { data, loading, error, reload, setData, setError } = useAvailability();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [newOverride, setNewOverride] = useState(null);

  const rulesByDay = useMemo(() => {
    const byDay = new Map();
    (data.rules || []).forEach((r) => byDay.set(r.day_of_week, r));
    return byDay;
  }, [data.rules]);

  const [timezone, setTimezone] = useState(data.schedule?.timezone || 'Asia/Kolkata');

  const handleToggleDay = (dayIndex) => {
    const existing = rulesByDay.get(dayIndex) || {
      schedule_id: data.schedule?.id,
      day_of_week: dayIndex,
      start_time: '09:00',
      end_time: '17:00',
      is_available: false,
    };
    const next = {
      ...existing,
      is_available: !existing.is_available,
    };
    const rules = DAYS.map((_, idx) => rulesByDay.get(idx) || {
      day_of_week: idx,
      start_time: '09:00',
      end_time: '17:00',
      is_available: idx >= 1 && idx <= 5,
    });
    rules[dayIndex] = next;
    setData((prev) => ({ ...prev, rules }));
  };

  const handleTimeChange = (dayIndex, field, value) => {
    const rules = DAYS.map((_, idx) => rulesByDay.get(idx) || {
      day_of_week: idx,
      start_time: '09:00',
      end_time: '17:00',
      is_available: idx >= 1 && idx <= 5,
    });
    const rule = rules[dayIndex];
    rules[dayIndex] = { ...rule, [field]: value };
    setData((prev) => ({ ...prev, rules }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        timezone,
        rules: (data.rules || DAYS.map((_, idx) => ({
          day_of_week: idx,
          start_time: '09:00',
          end_time: '17:00',
          is_available: idx >= 1 && idx <= 5,
        }))).map((r) => ({
          day_of_week: r.day_of_week,
          start_time: r.start_time.slice(0, 5),
          end_time: r.end_time.slice(0, 5),
          is_available: r.is_available,
        })),
      };
      const res = await availabilityApi.update(payload);
      setData(res.data || res);
      showToast({ message: 'Availability saved successfully.', type: 'success' });
    } catch (e) {
      setError(e.message);
      showToast({ message: e.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOverride = async () => {
    if (!newOverride?.override_date) {
      showToast({ message: 'Please select a date', type: 'error' });
      return;
    }
    try {
      await availabilityApi.addOverride({
        override_date: newOverride.override_date,
        is_available: newOverride.is_available,
        start_time: newOverride.is_available ? newOverride.start_time : null,
        end_time: newOverride.is_available ? newOverride.end_time : null,
      });
      showToast({ message: 'Date override added', type: 'success' });
      setNewOverride(null);
      reload();
    } catch (e) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const handleDeleteOverride = async (id) => {
    try {
      await availabilityApi.deleteOverride(id);
      showToast({ message: 'Override removed', type: 'success' });
      reload();
    } catch (e) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Availability</h1>
          <p className="text-sm font-medium text-text-secondary mt-1">Configure your default schedule for new meetings.</p>
        </div>
        <Button onClick={handleSave} loading={saving} size="lg" className="shadow-button w-full sm:w-auto px-8">
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="bg-dangerLight/20 border border-danger/20 rounded-xl p-4 text-sm font-medium text-danger flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={reload} className="hover:bg-danger/10 text-danger hover:text-danger">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-border p-8">
           <Skeleton className="h-6 w-32 mb-8" />
           <div className="space-y-4">
             {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
           </div>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-[24px] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="font-semibold text-text-primary text-base">Weekly Hours</div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-text-secondary">
                Timezone:
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-white text-text-primary focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-primary transition-all duration-fast"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
          
          <div className="divide-y divide-border/60">
            {DAYS.map((day, idx) => {
              const rule = rulesByDay.get(idx) || {
                day_of_week: idx,
                start_time: '09:00',
                end_time: '17:00',
                is_available: idx >= 1 && idx <= 5,
              };
              return (
                <div key={day} className="px-4 py-4 sm:px-8 sm:py-5 bg-white transition-colors hover:bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 min-w-[140px]">
                      <Toggle
                        checked={rule.is_available}
                        onChange={() => handleToggleDay(idx)}
                      />
                      <span
                        className={`text-base font-semibold uppercase tracking-wide text-xs ${
                          rule.is_available ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex items-center">
                      {rule.is_available ? (
                        <div className="flex items-center gap-3">
                          <select
                            value={rule.start_time.slice(0, 5)}
                            onChange={(e) => handleTimeChange(idx, 'start_time', e.target.value)}
                            className="h-10 px-3 text-sm font-bold rounded-lg border border-border bg-white text-text-primary focus:outline-none hover:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-primary transition-all duration-fast"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-text-secondary font-medium px-1">-</span>
                          <select
                            value={rule.end_time.slice(0, 5)}
                            onChange={(e) => handleTimeChange(idx, 'end_time', e.target.value)}
                            className="h-10 px-3 text-sm font-bold rounded-lg border border-border bg-white text-text-primary focus:outline-none hover:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-primary transition-all duration-fast"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-text-muted">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Overrides Section */}
      {!loading && !error && (
        <div className="bg-white border border-border rounded-[24px] shadow-sm flex flex-col mt-8">
          <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
            <div className="font-semibold text-text-primary text-base">Date Overrides</div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewOverride({ override_date: '', is_available: false, start_time: '09:00', end_time: '17:00' })}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Date
            </Button>
          </div>
          
          <div className="divide-y divide-border/60">
            {newOverride && (
              <div className="px-8 flex items-center gap-4 py-5 bg-blue-50/30">
                <input
                  type="date"
                  className="h-10 px-3 text-sm rounded-lg border border-border"
                  value={newOverride.override_date}
                  onChange={(e) => setNewOverride({ ...newOverride, override_date: e.target.value })}
                />
                <select
                  className="h-10 px-3 text-sm rounded-lg border border-border"
                  value={newOverride.is_available ? 'available' : 'unavailable'}
                  onChange={(e) => setNewOverride({ ...newOverride, is_available: e.target.value === 'available' })}
                >
                  <option value="unavailable">Unavailable</option>
                  <option value="available">Available</option>
                </select>
                
                {newOverride.is_available && (
                  <div className="flex items-center gap-2">
                    <select
                      value={newOverride.start_time}
                      onChange={(e) => setNewOverride({ ...newOverride, start_time: e.target.value })}
                      className="h-10 px-3 text-sm rounded-lg border border-border"
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span>-</span>
                    <select
                      value={newOverride.end_time}
                      onChange={(e) => setNewOverride({ ...newOverride, end_time: e.target.value })}
                      className="h-10 px-3 text-sm rounded-lg border border-border"
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
                
                <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" onClick={handleAddOverride}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setNewOverride(null)}>Cancel</Button>
                </div>
              </div>
            )}
            
            {data.overrides?.length === 0 && !newOverride && (
              <div className="p-8 text-center text-sm text-text-muted">No date overrides added yet.</div>
            )}
            
            {(data.overrides || []).map((o) => (
              <div key={o.id} className="px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="font-semibold text-text-primary">
                    {new Date(o.override_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div>
                    {o.is_available ? (
                      <span className="text-text-secondary text-sm">Available from {o.start_time?.slice(0, 5)} to {o.end_time?.slice(0, 5)}</span>
                    ) : (
                      <span className="text-sm font-medium text-text-muted">Unavailable</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteOverride(o.id)}
                  className="p-2 text-danger hover:bg-dangerLight/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Availability;

