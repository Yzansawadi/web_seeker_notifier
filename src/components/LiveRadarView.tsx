import React, { useState } from 'react';
import { BotActivityLog, Language, ScheduleType } from '../types';
import { Activity, Trash2, Filter } from 'lucide-react';

interface LiveRadarViewProps {
  activities: BotActivityLog[];
  lang: Language;
  onClear: () => void;
  onSimulateSchedule: (type: ScheduleType) => void;
}

export const LiveRadarView: React.FC<LiveRadarViewProps> = ({
  activities,
  lang,
  onClear,
  onSimulateSchedule,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = activities.filter((act) => {
    if (filterType === 'all') return true;
    return act.scheduleType === filterType;
  });

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Feed Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-white">
            {lang === 'ar' ? 'سجل العمليات الحية الفوري' : 'Real-time Operations Feed'}
          </span>
          <span className="text-xs text-slate-400">
            ({filtered.length} {lang === 'ar' ? 'عملية مسجلة' : 'logged'})
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setFilterType('ideal')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'ideal' ? 'bg-purple-900/80 text-purple-200 font-medium' : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              {lang === 'ar' ? 'مثالي' : 'Ideal'}
            </button>
            <button
              onClick={() => setFilterType('simplified')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'simplified' ? 'bg-amber-900/80 text-amber-200 font-medium' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              {lang === 'ar' ? 'مبسط' : 'Simplified'}
            </button>
            <button
              onClick={() => setFilterType('full')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterType === 'full' ? 'bg-sky-900/80 text-sky-200 font-medium' : 'text-slate-400 hover:text-sky-300'
              }`}
            >
              {lang === 'ar' ? 'شامل' : 'Full'}
            </button>
          </div>

          {/* Clear Log */}
          {activities.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
              title={lang === 'ar' ? 'مسح السجل المؤقت' : 'Clear Log'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Operations Feed List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {lang === 'ar' ? 'لا توجد عمليات مسجلة حالياً في هذا التصنيف' : 'No operations recorded yet'}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((act) => (
              <div
                key={act.id}
                className="p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/40 transition-colors"
              >
                
                {/* Left: Time & Student details */}
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-mono text-slate-400 text-xs shrink-0 pt-0.5 sm:pt-0">
                    {formatTime(act.timestamp)}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        {act.userName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({act.telegramId})
                      </span>
                      {act.faculty && (
                        <span className="text-[11px] text-slate-400 hidden md:inline">
                          · {act.faculty}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {act.details}
                    </p>
                  </div>
                </div>

                {/* Right: Operation Type Label */}
                <div className="shrink-0">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                    act.scheduleType === 'ideal'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                      : act.scheduleType === 'simplified'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                      : act.scheduleType === 'full'
                      ? 'bg-sky-950/80 text-sky-300 border border-sky-800/50'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {act.actionTitleAr}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
