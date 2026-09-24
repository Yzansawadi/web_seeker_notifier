"""
Web Seeker Bot - Live Dashboard Integration Client
=================================================
هذا الملف يربط بوت التيليغرام الأصلي (web_seeker_bot) بالمنصة الجديدة مباشرة
دون الحاجة لأي بوت وسيط على الإطلاق!

طريقة الاستخدام في 3 أسطر فقط داخل مشروع البوت الخاص بك:
--------------------------------------------------------
from web_seeker_bot_hook import WebSeekerNotifier

# 1. قم بتهيئة المنبه مع رابط موقعك على Render
notifier = WebSeekerNotifier(
    dashboard_url="https://your-app.onrender.com", # أو http://localhost:3000 أثناء التجربة
    api_secret="YOUR_BOT_SECRET"
)

# 2. عند تسجيل طالب جديد أو تعديل بياناته
notifier.sync_student(
    telegram_id="98271635",
    name="أحمد العلي",
    university="جامعة دمشق",
    faculty="كلية الهندسة المعلوماتية",
    courses=["هندسة البرمجيات 2", "الذكاء الصنعي"]
)

# 3. عند فحص موقع الكلية أو ظهور علامة جديدة
notifier.send_check_event(
    student_id="98271635",
    student_name="أحمد العلي",
    university="جامعة دمشق",
    faculty="كلية الهندسة المعلوماتية",
    course="هندسة البرمجيات 2",
    status="new_grade", # 'new_grade' عند صدور نتيجة، أو 'checked_normal' عند الفحص الروتيني
    grade_score="86/100 (ناجح)",
    latency_ms=142,
    details="تم صدور ملف درجات المقرر بنجاح"
)
"""

import threading
import requests
import json
import time
from typing import List, Optional

class WebSeekerNotifier:
    def __init__(self, dashboard_url: str, api_secret: Optional[str] = None):
        self.dashboard_url = dashboard_url.rstrip("/")
        self.api_secret = api_secret or "seeker_default_secret"
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "x-bot-secret": self.api_secret,
            "User-Agent": "WebSeekerBot/2.0"
        })

    def _async_post(self, endpoint: str, payload: dict):
        """إرسال غير متزامن في خيط منفصل حتى لا يتعطل البوت مطلقاً"""
        def worker():
            try:
                url = f"{self.dashboard_url}{endpoint}"
                self.session.post(url, json=payload, timeout=4)
            except Exception as e:
                # تسجيل الخطأ بهدوء دون كسر عمل البوت
                print(f"[WebSeeker Hook Error] Failed to reach dashboard: {e}")

        t = threading.Thread(target=worker, daemon=True)
        t.start()

    def sync_student(
        self,
        telegram_id: str,
        name: str,
        university: str = "جامعة دمشق",
        faculty: str = "كلية الهندسة",
        courses: Optional[List[str]] = None
    ):
        """تسجيل أو تحديث بيانات الطالب في المنصة"""
        payload = {
            "telegramId": str(telegram_id),
            "name": name,
            "university": university,
            "faculty": faculty,
            "courses": courses or []
        }
        self._async_post("/api/students", payload)

    def send_check_event(
        self,
        student_id: str,
        student_name: str,
        university: str,
        faculty: str,
        course: str,
        status: str = "checked_normal", # 'new_grade' | 'checked_normal' | 'site_down' | 'retry'
        grade_score: Optional[str] = None,
        latency_ms: int = 150,
        details: Optional[str] = None
    ):
        """إرسال تقرير فحص مباشر (كل ثانية أو عند كل محاولة)"""
        payload = {
            "studentId": str(student_id),
            "studentName": student_name,
            "university": university,
            "faculty": faculty,
            "course": course,
            "status": status,
            "gradeScore": grade_score,
            "latencyMs": latency_ms,
            "details": details or ("🎉 نتيجة جديدة!" if status == "new_grade" else "فحص روتيني ناجح")
        }
        self._async_post("/api/events", payload)


# كود تجريبي سريع
if __name__ == "__main__":
    client = WebSeekerNotifier("http://localhost:3000")
    print("Testing connection to Web Seeker Live Dashboard...")
    client.send_check_event(
        student_id="TEST-100",
        student_name="تجربة ربط سريعة",
        university="جامعة دمشق",
        faculty="الهندسة المعلوماتية",
        course="مقرر تجريبي",
        status="new_grade",
        grade_score="95/100 (ممتاز)",
        latency_ms=110,
        details="فحص تجريبي للربط مع المنصة الحية"
    )
    time.sleep(1)
    print("Done! Check your dashboard screen to see the live event.")
