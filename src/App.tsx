/**
 * Web Seeker Schedule Bot - Operations Center & Telemetry Tower
 * Clean, simplified dashboard:
 * 1. General stats numbers at the top
 * 2. Visual operations timeline chart (Recharts)
 * 3. Cards for each student (Active/Online sorted at the top, Inactive at the bottom)
 * 4. Zero buttons in the top header
 * 5. Schedule names: جدول مواد · جدول اوقات · جدول كل المواد
 */

import React, { useState, useEffect } from 'react';
import { BotActivityLog, BotUser, SystemStats } from './types';
import { Header } from './components/Header';
import { StatsStrip } from './components/StatsStrip';
import { OperationsTimelineChart } from './components/OperationsTimelineChart';
import { StudentCardsView } from './components/StudentCardsView';
import { fetchActivities, fetchStats, fetchUsers, initialStats } from './services/api';

export default function App() {
  // Core Data Stores
  const [activities, setActivities] = useState<BotActivityLog[]>([]);
  const [users, setUsers] = useState<BotUser[]>([]);
  const [stats, setStats] = useState<SystemStats>(initialStats);
  const [showTimeline, setShowTimeline] = useState(true);

  // Always Arabic RTL
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  // Initial Fetch
  useEffect(() => {
    async function initData() {
      const [acts, usrs, sts] = await Promise.all([
        fetchActivities(),
        fetchUsers(),
        fetchStats(),
      ]);

      if (acts.length > 0) setActivities(acts);
      if (usrs.length > 0) setUsers(usrs);
      if (sts) setStats(sts);
    }
    initData();
  }, []);

  // Handler for receiving activity logs (from SSE stream)
  const handleIncomingActivity = (act: BotActivityLog) => {
    setActivities((prev) => [act, ...prev.slice(0, 199)]);

    // Update users & mark active
    setUsers((prevUsers) => {
      const exists = prevUsers.find((u) => u.telegramId === act.telegramId);
      if (exists) {
        return prevUsers.map((u) => {
          if (u.telegramId === act.telegramId) {
            const updated = {
              ...u,
              isOnline: true,
              lastSeen: act.timestamp,
              lastAction: act.action,
              lastActionTitle: act.actionTitleAr,
              totalOperations: u.totalOperations + 1,
              schedulesCreated: { ...u.schedulesCreated },
            };
            if (act.scheduleType === 'ideal') {
              updated.schedulesCreated.ideal += 1;
              updated.schedulesCreated.totalGenerated += 1;
            } else if (act.scheduleType === 'simplified') {
              updated.schedulesCreated.simplified += 1;
              updated.schedulesCreated.totalGenerated += 1;
            } else if (act.scheduleType === 'full') {
              updated.schedulesCreated.full += 1;
              updated.schedulesCreated.totalGenerated += 1;
            }
            return updated;
          }
          return u;
        });
      } else {
        const newUser: BotUser = {
          id: `usr-${Date.now().toString().slice(-4)}`,
          telegramId: act.telegramId,
          name: act.userName,
          username: act.username,
          university: act.university || 'جامعة دمشق',
          faculty: act.faculty || 'كلية الهندسة المعلوماتية',
          academicYear: 'السنة الجامعية الحالية',
          isOnline: true,
          joinedAt: act.timestamp.split('T')[0],
          lastSeen: act.timestamp,
          lastAction: act.action,
          lastActionTitle: act.actionTitleAr,
          schedulesCreated: {
            ideal: act.scheduleType === 'ideal' ? 1 : 0,
            simplified: act.scheduleType === 'simplified' ? 1 : 0,
            full: act.scheduleType === 'full' ? 1 : 0,
            totalGenerated: act.scheduleType ? 1 : 0,
          },
          totalOperations: 1,
          status: 'active',
        };
        return [newUser, ...prevUsers];
      }
    });

    // Update aggregated stats
    setStats((prev) => {
      const scheduleBreakdown = { ...prev.scheduleBreakdown };
      if (act.scheduleType === 'ideal') {
        scheduleBreakdown.ideal += 1;
        scheduleBreakdown.totalGenerated += 1;
      } else if (act.scheduleType === 'simplified') {
        scheduleBreakdown.simplified += 1;
        scheduleBreakdown.totalGenerated += 1;
      } else if (act.scheduleType === 'full') {
        scheduleBreakdown.full += 1;
        scheduleBreakdown.totalGenerated += 1;
      }

      return {
        ...prev,
        totalOperationsToday: prev.totalOperationsToday + 1,
        totalSchedulesCreated: scheduleBreakdown.totalGenerated,
        scheduleBreakdown,
      };
    });
  };

  // Connect to SSE stream (Server-Sent Events) from /api/stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (e) => {
        try {
          const newAct: BotActivityLog = JSON.parse(e.data);
          handleIncomingActivity(newAct);
        } catch {
          // ignore parse errors
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // SSE not available
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Header (Clean, Zero buttons) */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* 2. General Numbers First (الارقام العامة اولا) */}
        <StatsStrip
          stats={stats}
        />

        {/* 3. Operations Timeline Chart (Recharts) */}
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            مخطط تدفق ونشاط العمليات بمرور الوقت:
          </div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showTimeline ? 'إخفاء المخطط ▲' : 'إظهار المخطط البياني ▼'}
          </button>
        </div>

        {showTimeline && (
          <OperationsTimelineChart
            activities={activities}
            lang="ar"
          />
        )}

        {/* 4. Student Cards: Active at top, Inactive at bottom (بطاقات باسم كل طالب) */}
        <StudentCardsView
          users={users}
        />

      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 font-medium">Web Seeker Schedule Bot</span>
            <span>·</span>
            <span>لوحة المراقبة المباشرة لنشاط الطلاب والجداول</span>
          </div>

          <div className="text-slate-500">
            تحديث مباشر وتلقائي للنشاط وحالة الاتصال
          </div>
        </div>
      </footer>

    </div>
  );
}
