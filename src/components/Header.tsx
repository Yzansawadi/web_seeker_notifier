import React from 'react';
import { Calendar } from 'lucide-react';

interface HeaderProps {
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Name & Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">Web Seeker</span>
              <span className="text-slate-500 text-sm hidden sm:inline">|</span>
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">لوحة مراقبة البوت</span>
            </div>
            <p className="text-xs text-slate-400">
              متابعة مباشرة لنشاط الطلاب وحالة الاتصال والجداول المنشأة
            </p>
          </div>
        </div>

        {/* Live Status Indicator (No buttons) */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/70 px-3 py-1.5 rounded-lg border border-emerald-800/60 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>البوت متصل ويعمل لحظياً</span>
          </span>
        </div>

      </div>
    </header>
  );
};
