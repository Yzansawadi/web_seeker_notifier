# Web Seeker Live - Student Bot Operations Center & Notification Tower
منظومة المراقبة المركزية ونظام الإشعارات المباشر فائق السرعة لبوت الطلاب `web_seeker_bot`

---

## 🌟 نبذة عن النظام
تم تصميم هذا المشروع ليكون حلاً جذرياً لمشاكل نظام الإشعارات السابق في بوت التيليغرام، حيث تم استبدال الواجهة البرمجية المعقدة والهشة لمنبهات التيليغرام بلوحة تحكم ويب احترافية منفصلة تماماً، تعمل على مدار الساعة، وتعرض كافة الإحصائيات والفحوصات في كل ثانية مع تنبيهات صوتية ومرئية فورية فور صدور أي علامة أو نتيجة امتحانية.

---

## 🚀 خطوات الرفع على GitHub والربط بمنصة Render

### الخطوة 1: الرفع على مستودع جديد في GitHub
1. افتح حسابك على [GitHub](https://github.com) وأنشئ مستودعاً جديداً باسم:
   `web-seeker-live-dashboard` (Public أو Private حسب رغبتك).
2. في مجلد هذا المشروع على جهازك، نفّذ الأوامر التالية:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for web seeker live dashboard"
   git branch -M main
   git remote add origin https://github.com/Yzansawadi/web-seeker-live-dashboard.git
   git push -u origin main
   ```

### الخطوة 2: النشر على منصة Render
1. سجّل الدخول إلى [Render.com](https://render.com).
2. انقر على **New +** ثم اختر **Web Service**.
3. اربط حساب GitHub واختر المستودع `web-seeker-live-dashboard`.
4. أدخل الإعدادات التالية (أو سيتعرف Render عليها تلقائياً من ملف `render.yaml`):
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. انقر على **Create Web Service**.
6. خلال دقيقتين ستمنحك Render رابطاً مجانياً بصيغة:
   `https://web-seeker-live.onrender.com`

---

## 🔌 ربط بوت الطلاب (web_seeker_bot) بالمنصة الجديدة في 3 أسطر فقط!

انسخ ملف `integrations/web_seeker_bot_hook.py` إلى مجلد بوتك الأصلي، وأضف ما يلي:

```python
from web_seeker_bot_hook import WebSeekerNotifier

# 1. تهيئة الرابط
notifier = WebSeekerNotifier("https://web-seeker-live.onrender.com")

# 2. عند صدور علامة أو عند الفحص الدوري
notifier.send_check_event(
    student_id="98271635",
    student_name="أحمد العلي",
    university="جامعة دمشق",
    faculty="كلية الهندسة المعلوماتية",
    course="هندسة البرمجيات 2",
    status="new_grade",           # أو 'checked_normal' للفحص الروتيني
    grade_score="86/100 (ناجح)",  # اختياري عند صدور علامة
    latency_ms=140
)
```

---

## ⚡ مميزات لوحة التحكم ($1000 Standard)
1. **رادار مباشر ثانية بثانية (Sub-second Live Stream)**:
   - بث مباشر بتقنية Server-Sent Events (SSE) يعرض كل طالب وكل عملية فحص وموقع الكلية المستهدف فوراً.
2. **نظام إنذار صوتي ومرئي ذكي (Audio Chime & Visual Flash)**:
   - نغمة إنذار نقية فور التقاط البوت لأي علامة جديدة مع قصاصات احتفالية وتنبيه متصفح.
3. **مراقبة سيرفرات الجامعات (Portal Health & Uptime)**:
   - فحص استجابة مواقع الجامعات (دمشق، تشرين، البعث، الافتراضية، حلب) وسرعة استجابتها بالمللي ثانية ومعدل التوقف.
4. **دليل وسجلات الطلاب والمشتركين**:
   - قاعدة بيانات بجميع الطلاب، المواد المشتركين بها، وعدد الفحوصات المنفذة لكل طالب.
5. **محاكي فوري مدمج (Live Simulator)**:
   - إمكانية تشغيل دفق بيانات تجريبي بضغطة زر لاختبار سرعة الموقع وكفاءته دون انتظار.
6. **دعم كامل للغتين (العربية والإنجليزية) والوضع المظلم/الفاتح**.
