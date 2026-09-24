import { BotActivityLog, BotUser, ScheduleType, SystemStats } from '../types';

export const initialStats: SystemStats = {
  totalUsersCount: 0,
  onlineUsersCount: 0,
  totalOperationsToday: 0,
  totalSchedulesCreated: 0,
  scheduleBreakdown: {
    ideal: 0,
    simplified: 0,
    full: 0,
    totalGenerated: 0,
  },
  operationsPerMinute: 0,
  averageResponseTimeMs: 0,
  systemUptime: '100%',
  botStatus: 'connected',
  lastHeartbeat: new Date().toISOString(),
};

export async function fetchStats(): Promise<SystemStats> {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return initialStats;
}

export async function fetchActivities(): Promise<BotActivityLog[]> {
  try {
    const res = await fetch('/api/activities');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return [];
}

export async function fetchUsers(): Promise<BotUser[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return [];
}

export async function triggerSimulateSchedule(scheduleType: ScheduleType = 'ideal'): Promise<{ activity: BotActivityLog; user: BotUser } | null> {
  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleType }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return null;
}

export async function sendWebhookActivity(payload: {
  telegramId: string;
  userName: string;
  username?: string;
  action: string;
  actionTitle?: string;
  scheduleType?: ScheduleType;
  details?: string;
  university?: string;
  faculty?: string;
  academicYear?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
