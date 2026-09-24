import React, { useState } from 'react';
import { BotUser, Language, ScheduleType } from '../types';
import { Users, Search, Download, Plus, Sparkles, Calendar, LayoutGrid, Check } from 'lucide-react';

interface UsersViewProps {
  users: BotUser[];
  lang: Language;
  onSimulateUserAction: (user: BotUser, type: ScheduleType) => void;
  onAddUser: (newUser: Partial<BotUser>) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  lang,
  onSimulateUserAction,
  onAddUser,
}) => {
  const [search, setSearch] = useState('');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('جامعة دمشق');
  const [faculty, setFaculty] = useState('كلية الهندسة المعلوماتية');

  const filteredUsers = users.filter((u) => {
    if (filterOnlineOnly && !u.isOnline) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.telegramId.includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      u.university.toLowerCase().includes(q) ||
      u.faculty.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !telegramId.trim()) return;

    onAddUser({
      name: name.trim(),
      telegramId: telegramId.trim(),
      username: username.trim() || undefined,
      university,
      faculty,
      academicYear: 'السنة الجامعية الحالية',
      isOnline: true,
      joinedAt: new Date().toISOString().split('T')[0],
      lastSeen: new Date().toISOString(),
      lastAction: 'bot_start',
      lastActionTitle: 'انضمام وبدء استخدام البوت',
      schedulesCreated: {
        ideal: 0,
        simplified: 0,
        full: 0,
        totalGenerated: 0,
      },
      totalOperations: 1,
      status: 'active',
    });

    setName('');
    setTelegramId('');
    setUsername('');
    setIsAddModalOpen(false);
  };

  const exportCsv = () => {
    const headers = [
      'Telegram ID',
      'Name',
      'Username',
      'Faculty',
      'Status',
      'Joined At',
      'Last Seen',
      'Last Action',
      'Ideal Schedules',
      'Simplified Schedules',
      'Full Schedules',
      'Total Schedules',
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.telegramId}"`,
      `"${u.name}"`,
      `"${u.username || ''}"`,
      `"${u.faculty}"`,
      u.isOnline ? 'Online' : 'Offline',
      `"${u.joinedAt}"`,
      `"${u.lastSeen}"`,
      `"${u.lastActionTitle}"`,
      u.schedulesCreated.ideal,
      u.schedulesCreated.simplified,
      u.schedulesCreated.full,
      u.schedulesCreated.totalGenerated,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bot_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatLastSeen = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Action and Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        
        {/* Title & Count */}
        <div className="flex items-center gap-2 text-white">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm">
            {lang === 'ar' ? 'سجل الطلاب والمستخدمين' : 'Students & Users Directory'}
          </span>
          <span className="text-xs text-slate-400">
            ({filteredUsers.length} {lang === 'ar' ? 'طالب' : 'students'})
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Online Toggle Button */}
          <button
            onClick={() => setFilterOnlineOnly(!filterOnlineOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              filterOnlineOnly
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filterOnlineOnly ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
            <span>{lang === 'ar' ? 'المتصلون الآن فقط' : 'Online Only'}</span>
          </button>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم، @المعرف، أو الكلية...' : 'Search student or ID...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إضافة طالب' : 'Add Student'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
            title={lang === 'ar' ? 'تصدير كملف CSV' : 'Export CSV'}
          >
            <Download className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Main Clean Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">{lang === 'ar' ? 'الطالب / الحساب' : 'Student / Account'}</th>
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'حالة الاتصال' : 'Live Status'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'آخر عملية وتوقيتها' : 'Last Action & Time'}</th>
                <th className="py-3 px-4 text-center text-purple-300 font-semibold">{lang === 'ar' ? 'مثالي' : 'Ideal'}</th>
                <th className="py-3 px-4 text-center text-amber-300 font-semibold">{lang === 'ar' ? 'مبسط' : 'Simplified'}</th>
                <th className="py-3 px-4 text-center text-sky-300 font-semibold">{lang === 'ar' ? 'كافة الأوقات' : 'Full'}</th>
                <th className="py-3 px-4 text-center font-bold text-white">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'إجراء سريع' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    {lang === 'ar' ? 'لا يوجد طلاب مطابقون لمعايير البحث' : 'No matching students found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Name & ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.username && (
                          <span className="text-slate-400 text-[11px] font-normal font-mono">@{u.username}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ID: {u.telegramId} · {u.faculty}
                      </div>
                    </td>

                    {/* Online status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {u.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>{lang === 'ar' ? 'متصل الآن' : 'Online'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          <span>{lang === 'ar' ? 'خامل' : 'Offline'}</span>
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {u.joinedAt}
                    </td>

                    {/* Last action and time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">{u.lastActionTitle}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {formatLastSeen(u.lastSeen)}
                      </div>
                    </td>

                    {/* Ideal schedules count */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-purple-300">
                      {u.schedulesCreated.ideal}
                    </td>

                    {/* Simplified schedules count */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                      {u.schedulesCreated.simplified}
                    </td>

                    {/* Full schedules count */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-sky-300">
                      {u.schedulesCreated.full}
                    </td>

                    {/* Total schedules created */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-white bg-slate-950/40">
                      {u.schedulesCreated.totalGenerated}
                    </td>

                    {/* Fast test button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onSimulateUserAction(u, 'ideal')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        title="تجربة طلب جدول لهذا الطالب"
                      >
                        {lang === 'ar' ? 'تجربة طلب' : 'Test'}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'إضافة طالب إلى النظام' : 'Add Student'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{lang === 'ar' ? 'اسم الطالب' : 'Name'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يزن العبد الله"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">{lang === 'ar' ? 'معرف تيليغرام (Chat ID)' : 'Telegram ID'}</label>
                  <input
                    type="text"
                    required
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="98127492"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">{lang === 'ar' ? 'اسم المستخدم (@Username)' : 'Username'}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="student_user"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{lang === 'ar' ? 'الكلية' : 'Faculty'}</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 text-white rounded text-xs font-semibold"
              >
                {lang === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
