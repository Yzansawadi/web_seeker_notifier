import React, { useState } from 'react';
import { Language, ScheduleType } from '../types';
import { Terminal, Copy, Check, Send, X, ShieldCheck } from 'lucide-react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSendTestWebhook: (payload: {
    telegramId: string;
    userName: string;
    username?: string;
    action: string;
    actionTitle?: string;
    scheduleType?: ScheduleType;
    details?: string;
    university?: string;
    faculty?: string;
  }) => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSendTestWebhook,
}) => {
  if (!isOpen) return null;

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick test state
  const [simName, setSimName] = useState('طالب تجريبي');
  const [simId, setSimId] = useState('98124012');
  const [simType, setSimType] = useState<ScheduleType>('ideal');
  const [testSent, setTestSent] = useState(false);

  const endpointUrl = `${window.location.origin}/api/events`;

  const pythonSnippet = `# كود ربط بوتك (aiogram أو python-telegram-bot) بالمنصة
import requests

SERVER_URL = "${endpointUrl}"

def notify_tower(telegram_id, user_name, schedule_type, details=""):
    """دالة خفيفة تُستدعى عند توليد أي جدول لإرسال التقرير فوراً"""
    try:
        requests.post(SERVER_URL, json={
            "telegramId": str(telegram_id),
            "userName": user_name,
            "scheduleType": schedule_type,  # 'ideal' أو 'simplified' أو 'full'
            "action": f"generate_{schedule_type}_schedule",
            "details": details
        }, timeout=2)
    except Exception as e:
        print(f"Error sending telemetry: {e}")

# مثال الاستخدام داخل البوت:
# notify_tower(message.from_user.id, message.from_user.full_name, "ideal", "توليد جدول 5 مواد بدون تعارض")`;

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    onSendTestWebhook({
      telegramId: simId,
      userName: simName,
      scheduleType: simType,
      action: simType === 'ideal' ? 'generate_ideal_schedule' :
              simType === 'simplified' ? 'generate_simplified_schedule' : 'view_all_courses_schedule',
      actionTitle: simType === 'ideal' ? 'توليد جدول مثالي' :
                   simType === 'simplified' ? 'إنشاء جدول مبسط' : 'استعراض كافة الأوقات',
      details: simType === 'ideal' ? 'طلب تجربة توليد جدول مثالي' : 'طلب جدول دراسي تجريبي',
      university: 'جامعة دمشق',
      faculty: 'كلية الهندسة المعلوماتية',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-sm">
                {lang === 'ar' ? 'ربط بوت التيليغرام بالمنصة (Webhook)' : 'Connect Telegram Bot (Webhook)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'أرسل بيانات كل عملية يجريها الطالب في البوت لتظهر هنا فوراً' : 'Send student actions to update the dashboard instantly'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint URL Box */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-medium">
            {lang === 'ar' ? 'رابط استقبال الأحداث (POST Endpoint):' : 'Endpoint URL (POST):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={endpointUrl}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-cyan-300 focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(endpointUrl, setCopiedUrl)}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 shrink-0 flex items-center gap-1"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Python Snippet */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">
              {lang === 'ar' ? 'كود بايثون للإضافة داخل البوت:' : 'Python integration snippet:'}
            </label>
            <button
              onClick={() => copyToClipboard(pythonSnippet, setCopiedCode)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{lang === 'ar' ? 'نسخ الكود' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
            {pythonSnippet}
          </pre>
        </div>

        {/* Test Simulator Section */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              {lang === 'ar' ? 'تجربة إرسال حدث يدوي للتأكد من الرصد:' : 'Quick Test Dispatch:'}
            </span>
            {testSent && (
              <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                ✓ {lang === 'ar' ? 'تم الإرسال وتحديث الرادار فوراً!' : 'Dispatched successfully!'}
              </span>
            )}
          </div>

          <form onSubmit={handleTest} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              placeholder="اسم الطالب"
              className="bg-slate-900 border border-slate-800 rounded p-2 text-white"
            />
            <input
              type="text"
              value={simId}
              onChange={(e) => setSimId(e.target.value)}
              placeholder="معرف تيليغرام"
              className="bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono"
            />
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value as ScheduleType)}
              className="bg-slate-900 border border-slate-800 rounded p-2 text-white"
            >
              <option value="ideal">✨ مثالي</option>
              <option value="simplified">📅 مبسط</option>
              <option value="full">📊 شامل</option>
            </select>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded p-2 flex items-center justify-center gap-1 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>{lang === 'ar' ? 'إرسال تجربة' : 'Send Test'}</span>
            </button>
          </form>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
