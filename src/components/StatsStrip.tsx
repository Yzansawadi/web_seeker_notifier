import React from 'react';
import { SystemStats } from '../types';
import { Users, Calendar, Layers } from 'lucide-react';

interface StatsStripProps {
  stats: SystemStats;
}

export const StatsStrip: React.FC<StatsStripProps> = ({ stats }) => {
  return (
    <div className="space-y-3 mb-6">
      
      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Online Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>المتصلون الآن</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
            {stats.onlineUsersCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            طلاب متصلون ويستخدمون البوت حالياً
          </p>
        </div>

        {/* 2. Total Registered Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>إجمالي مستخدمي البوت</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tracking-tight">
            {stats.totalUsersCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إجمالي الطلاب المسجلين
          </p>
        </div>

        {/* 3. Total Schedules Created */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>إجمالي الجداول المنشأة</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400 tracking-tight">
            {stats.totalSchedulesCreated}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            كافة الجداول التي تم إنشاؤها
          </p>
        </div>

        {/* 4. Schedule Breakdown: جدول مواد · جدول اوقات · جدول كل المواد */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-slate-400 text-xs mb-1.5 flex items-center justify-between">
            <span>توزيع أنواع الجداول</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-slate-950/90 rounded-lg p-2 border border-purple-900/40">
              <span className="text-[11px] text-purple-300 block mb-0.5 font-medium">جدول مواد</span>
              <span className="font-mono text-base font-bold text-purple-400">
                {stats.scheduleBreakdown.ideal}
              </span>
            </div>

            <div className="bg-slate-950/90 rounded-lg p-2 border border-amber-900/40">
              <span className="text-[11px] text-amber-300 block mb-0.5 font-medium">جدول اوقات</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {stats.scheduleBreakdown.simplified}
              </span>
            </div>

            <div className="bg-slate-950/90 rounded-lg p-2 border border-sky-900/40">
              <span className="text-[11px] text-sky-300 block mb-0.5 font-medium">جدول كل المواد</span>
              <span className="font-mono text-base font-bold text-sky-400">
                {stats.scheduleBreakdown.full}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
