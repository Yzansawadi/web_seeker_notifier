import React, { useState, useMemo } from 'react';
import { BotActivityLog, Language } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, CalendarDays, Zap } from 'lucide-react';

interface OperationsTimelineChartProps {
  activities: BotActivityLog[];
  lang: Language;
}

type TimeRange = 'hours' | 'recent' | 'days';

export const OperationsTimelineChart: React.FC<OperationsTimelineChartProps> = ({
  activities,
  lang,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('hours');
  const [activeSeries, setActiveSeries] = useState<string>('all');

  // Compute timeline data points based on selected range
  const chartData = useMemo(() => {
    const now = new Date();

    if (timeRange === 'recent') {
      // Last 30 minutes in 5-minute buckets
      const buckets: { [key: string]: { time: string; ideal: number; simplified: number; full: number; total: number } } = {};
      for (let i = 25; i >= 0; i -= 5) {
        const d = new Date(now.getTime() - i * 60 * 1000);
        const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        buckets[label] = { time: label, ideal: 0, simplified: 0, full: 0, total: 0 };
      }

      // Populate from activities
      activities.forEach((act) => {
        const actTime = new Date(act.timestamp);
        const diffMins = (now.getTime() - actTime.getTime()) / (1000 * 60);
        if (diffMins <= 30 && diffMins >= 0) {
          // find nearest bucket
          const roundedMin = Math.floor(actTime.getMinutes() / 5) * 5;
          const bucketDate = new Date(actTime);
          bucketDate.setMinutes(roundedMin, 0, 0);
          const label = bucketDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (buckets[label]) {
            buckets[label].total += 1;
            if (act.scheduleType === 'ideal') buckets[label].ideal += 1;
            else if (act.scheduleType === 'simplified') buckets[label].simplified += 1;
            else if (act.scheduleType === 'full') buckets[label].full += 1;
          }
        }
      });

      return Object.values(buckets);
    }

    if (timeRange === 'days') {
      // Last 7 days calculated from real activities
      const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = lang === 'ar' ? daysAr : daysEn;

      const dayMap: { [day: string]: { ideal: number; simplified: number; full: number; total: number } } = {};
      days.forEach(d => {
        dayMap[d] = { ideal: 0, simplified: 0, full: 0, total: 0 };
      });

      activities.forEach(act => {
        const d = new Date(act.timestamp);
        const dayName = days[d.getDay()];
        if (dayMap[dayName]) {
          if (act.scheduleType === 'ideal') dayMap[dayName].ideal += 1;
          else if (act.scheduleType === 'simplified') dayMap[dayName].simplified += 1;
          else if (act.scheduleType === 'full') dayMap[dayName].full += 1;
          dayMap[dayName].total += 1;
        }
      });

      return days.map(d => ({
        time: d,
        ideal: dayMap[d].ideal,
        simplified: dayMap[d].simplified,
        full: dayMap[d].full,
        total: dayMap[d].total,
      }));
    }

    // Default: Hours of the day calculated from real activities
    const hours = [
      '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ];

    const hourMap: { [h: string]: { ideal: number; simplified: number; full: number; total: number } } = {};
    hours.forEach(h => {
      hourMap[h] = { ideal: 0, simplified: 0, full: 0, total: 0 };
    });

    activities.forEach(act => {
      const d = new Date(act.timestamp);
      const h = d.getHours();
      const nearestHour = Math.min(22, Math.max(8, Math.floor(h / 2) * 2));
      const label = `${nearestHour < 10 ? '0' : ''}${nearestHour}:00`;
      if (hourMap[label]) {
        if (act.scheduleType === 'ideal') hourMap[label].ideal += 1;
        else if (act.scheduleType === 'simplified') hourMap[label].simplified += 1;
        else if (act.scheduleType === 'full') hourMap[label].full += 1;
        hourMap[label].total += 1;
      }
    });

    return hours.map(h => ({
      time: h,
      ideal: hourMap[h].ideal,
      simplified: hourMap[h].simplified,
      full: hourMap[h].full,
      total: hourMap[h].total,
    }));
  }, [activities, timeRange, lang]);

  // Peak operations computation
  const peak = useMemo(() => {
    return Math.max(...chartData.map(d => d.total));
  }, [chartData]);

  const totalOpsInRange = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.total, 0);
  }, [chartData]);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-white">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{label}</span>
            </span>
            <span className="font-mono text-cyan-300">
              {payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0)} {lang === 'ar' ? 'عملية' : 'ops'}
            </span>
          </div>
          
          <div className="space-y-1 pt-1 font-mono">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="font-sans font-medium">{entry.name}:</span>
                </span>
                <span className="font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 mb-6">
      
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        
        {/* Title & Peak Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                {lang === 'ar' ? 'مخطط اتجاهات نشاط العمليات (Operations Timeline)' : 'Operations Activity Timeline'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                <Zap className="w-3 h-3" />
                <span>{lang === 'ar' ? `الذروة: ${peak} عملية` : `Peak: ${peak} ops`}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'تحليل بياني مباشر لتدفق طلبات الجداول المثالية والمبسطة والشاملة على مدار الوقت'
                : 'Real-time visual flow of schedule generation requests over time'}
            </p>
          </div>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('recent')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === 'recent'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'آخر 30 دقيقة' : 'Last 30m'}
          </button>
          <button
            onClick={() => setTimeRange('hours')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === 'hours'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'ساعات اليوم' : 'Today (Hours)'}
          </button>
          <button
            onClick={() => setTimeRange('days')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === 'days'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'أيام الأسبوع' : 'Past 7 Days'}
          </button>
        </div>

      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5">
          <span className="text-slate-400 block text-[11px] mb-0.5">
            {lang === 'ar' ? 'إجمالي النشاط في النطاق' : 'Total Operations'}
          </span>
          <span className="text-lg font-bold font-mono text-white">
            {totalOpsInRange}
          </span>
        </div>

        <div className="bg-slate-950/60 border border-purple-900/30 rounded-lg p-2.5">
          <span className="text-purple-300 block text-[11px] mb-0.5">
            {lang === 'ar' ? 'جدول مواد' : 'Course Schedules'}
          </span>
          <span className="text-lg font-bold font-mono text-purple-400">
            {chartData.reduce((acc, d) => acc + d.ideal, 0)}
          </span>
        </div>

        <div className="bg-slate-950/60 border border-amber-900/30 rounded-lg p-2.5">
          <span className="text-amber-300 block text-[11px] mb-0.5">
            {lang === 'ar' ? 'جدول اوقات' : 'Time Schedules'}
          </span>
          <span className="text-lg font-bold font-mono text-amber-400">
            {chartData.reduce((acc, d) => acc + d.simplified, 0)}
          </span>
        </div>

        <div className="bg-slate-950/60 border border-sky-900/30 rounded-lg p-2.5">
          <span className="text-sky-300 block text-[11px] mb-0.5">
            {lang === 'ar' ? 'جدول كل المواد' : 'All Courses Schedules'}
          </span>
          <span className="text-lg font-bold font-mono text-sky-400">
            {chartData.reduce((acc, d) => acc + d.full, 0)}
          </span>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSimplified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />

            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => {
                if (value === 'ideal') return <span className="text-purple-300 font-medium">{lang === 'ar' ? 'جدول مواد' : 'Course Schedule'}</span>;
                if (value === 'simplified') return <span className="text-amber-300 font-medium">{lang === 'ar' ? 'جدول اوقات' : 'Time Schedule'}</span>;
                if (value === 'full') return <span className="text-sky-300 font-medium">{lang === 'ar' ? 'جدول كل المواد' : 'All Courses Schedule'}</span>;
                return value;
              }}
            />

            <Area
              type="monotone"
              dataKey="ideal"
              name="ideal"
              stroke="#c084fc"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIdeal)"
              activeDot={{ r: 5, stroke: '#e879f9', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="simplified"
              name="simplified"
              stroke="#fbbf24"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSimplified)"
              activeDot={{ r: 5, stroke: '#fde047', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="full"
              name="full"
              stroke="#38bdf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFull)"
              activeDot={{ r: 5, stroke: '#7dd3fc', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
