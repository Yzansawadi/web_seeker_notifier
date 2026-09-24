import React, { useState, useMemo } from 'react';
import { BotUser, SCHEDULE_NAMES } from '../types';
import { Search, Clock, Calendar, CheckCircle2, User, ChevronDown } from 'lucide-react';

interface StudentCardsViewProps {
  users: BotUser[];
}

export const StudentCardsView: React.FC<StudentCardsViewProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline'>('all');

  // Sort: Active (Online) cards FIRST at the top, inactive (Offline) at the bottom
  const sortedAndFilteredUsers = useMemo(() => {
    return [...users]
      .filter((u) => {
        if (filterMode === 'online' && !u.isOnline) return false;
        if (filterMode === 'offline' && u.isOnline) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.telegramId.includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          u.lastActionTitle.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Priority 1: Online status (true first, false later)
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;

        // Priority 2: Most recent lastSeen date
        const timeA = new Date(a.lastSeen).getTime() || 0;
        const timeB = new Date(b.lastSeen).getTime() || 0;
        return timeB - timeA;
      });
  }, [users, searchTerm, filterMode]);

  const onlineCount = useMemo(() => users.filter((u) => u.isOnline).length, [users]);
  const offlineCount = users.length - onlineCount;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search and Quick Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        
        {/* Title and stats count */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">بطاقات الطلاب والمستخدمين</h3>
            <p className="text-xs text-slate-400">
              مرتبة حسب النشاط: الطلاب المتصلون أولاً بالأعلى، وغير المتصلين بالأسفل
            </p>
          </div>
        </div>

        {/* Search input & filter toggles */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Filter Pill */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({users.length})
            </button>
            <button
              onClick={() => setFilterMode('online')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                filterMode === 'online'
                  ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/80'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>متصل الآن ({onlineCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('offline')}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'offline'
                  ? 'bg-slate-800 text-slate-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              غير متصل ({offlineCount})
            </button>
          </div>

          {/* Search Field */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم الطالب أو المعرف..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

        </div>

      </div>

      {/* Cards Grid */}
      {sortedAndFilteredUsers.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400 mb-1">
            <User className="w-5 h-5" />
          </div>
          {users.length === 0 ? (
            <>
              <p className="font-semibold text-slate-300">لا توجد بيانات حالياً — بانتظار نشاط الطلاب على البوت</p>
              <p className="text-xs text-slate-500 max-w-md">
                لوحة المراقبة متصلة وجاهزة لاستقبال الأحداث. بمجرد استخدام أي طالب للبوت، ستظهر بطاقته فوراً هنا.
              </p>
            </>
          ) : (
            <p className="font-medium text-slate-400">لا يوجد طلاب مطابقون لمعايير البحث الحالية</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAndFilteredUsers.map((user) => (
            <div
              key={user.id}
              className={`rounded-xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                user.isOnline
                  ? 'bg-slate-900/95 border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-90 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              
              {/* Card Header: Student Name & Online Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-white text-base leading-snug">
                      {user.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-slate-400 font-mono">
                      {user.username && <span className="text-cyan-400 font-medium">@{user.username}</span>}
                      <span>ID: {user.telegramId}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">انضم: {user.joinedAt}</span>
                    </div>
                  </div>

                  {/* Online / Offline Status Badge */}
                  <div className="shrink-0">
                    {user.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 shadow-sm">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span>متصل الآن</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span>غير متصل</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Action Section (اخر اجراء) */}
                <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">آخر إجراء:</span>
                    <span className="font-mono flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{formatTime(user.lastSeen)}</span>
                    </span>
                  </div>
                  <div className="text-xs font-medium text-cyan-300 line-clamp-1">
                    {user.lastActionTitle}
                  </div>
                </div>
              </div>

              {/* Schedule Counts Section (عدد كل جدول) */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium flex items-center justify-between">
                  <span>عدد الجداول المنشأة:</span>
                  <span className="font-mono text-white font-bold">
                    الإجمالي: {user.schedulesCreated.totalGenerated}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  
                  {/* جدول مواد */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-purple-900/30">
                    <span className="text-[10px] text-purple-300 block mb-0.5 leading-tight">
                      جدول مواد
                    </span>
                    <span className="font-mono font-bold text-sm text-purple-400">
                      {user.schedulesCreated.ideal}
                    </span>
                  </div>

                  {/* جدول اوقات */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-amber-900/30">
                    <span className="text-[10px] text-amber-300 block mb-0.5 leading-tight">
                      جدول اوقات
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {user.schedulesCreated.simplified}
                    </span>
                  </div>

                  {/* جدول كل المواد */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-sky-900/30">
                    <span className="text-[10px] text-sky-300 block mb-0.5 leading-tight">
                      جدول كل المواد
                    </span>
                    <span className="font-mono font-bold text-sm text-sky-400">
                      {user.schedulesCreated.full}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
