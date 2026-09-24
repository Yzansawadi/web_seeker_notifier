// Core domain types for Web Seeker Schedule Bot Telemetry & Command Center

export type ScheduleType = 'ideal' | 'simplified' | 'full';

export const SCHEDULE_NAMES = {
  ideal: 'جدول مواد',
  simplified: 'جدول اوقات',
  full: 'جدول كل المواد',
} as const;

export type UserActionType = 
  | 'generate_ideal_schedule'      // جدول مواد
  | 'generate_simplified_schedule' // جدول اوقات
  | 'view_all_courses_schedule'    // جدول كل المواد
  | 'filter_course_time'           // استعلام عن توقيت مادة
  | 'export_schedule_pdf'          // تصدير الجدول
  | 'bot_start'                    // بدء استخدام البوت
  | 'change_department';           // تغيير القسم أو السنة

export interface BotActivityLog {
  id: string;
  userId: string;
  telegramId: string;
  userName: string;
  username?: string;
  action: UserActionType;
  actionTitleAr: string;
  scheduleType?: ScheduleType;
  details: string;
  university?: string;
  faculty?: string;
  timestamp: string;
  latencyMs: number;
}

export interface ScheduleStatsBreakdown {
  ideal: number;       // جداول مثالية تم إنشاؤها
  simplified: number;  // جداول مبسطة
  full: number;        // جداول كاملة لجميع الأوقات
  totalGenerated: number;
}

export interface BotUser {
  id: string;
  telegramId: string;
  username?: string;
  name: string;
  university: string;
  faculty: string;
  academicYear: string;
  isOnline: boolean;              // هل المستخدم متصل / نشط الآن
  joinedAt: string;               // تاريخ انضمام المستخدم للبوت
  lastSeen: string;               // تاريخ وتوقيت آخر عملية
  lastAction: UserActionType;     // ماهي آخر عملية قام بها
  lastActionTitle: string;
  schedulesCreated: ScheduleStatsBreakdown; // كم جدول من كل نوع قام بإنشائه
  totalOperations: number;        // إجمالي العمليات
  status: 'active' | 'idle' | 'blocked';
}

export interface SystemStats {
  totalUsersCount: number;        // عدد المستخدمين الكلي
  onlineUsersCount: number;       // المستخدمون المتصلون الآن
  totalOperationsToday: number;   // إجمالي العمليات اليوم
  totalSchedulesCreated: number;  // إجمالي الجداول المنشأة
  scheduleBreakdown: ScheduleStatsBreakdown; // التوزيع التفصيلي للجداول
  operationsPerMinute: number;
  averageResponseTimeMs: number;
  systemUptime: string;
  botStatus: 'connected' | 'idle' | 'warning';
  lastHeartbeat: string;
}

export type TabType = 'live_activity' | 'users' | 'schedules' | 'analytics' | 'integration';
export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
