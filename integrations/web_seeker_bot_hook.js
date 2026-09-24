/**
 * Web Seeker Bot - Live Dashboard Integration Client (Node.js / JS)
 */

export class WebSeekerNotifier {
  constructor(dashboardUrl = 'http://localhost:3000', apiSecret = 'seeker_default_secret') {
    this.dashboardUrl = dashboardUrl.replace(/\/$/, '');
    this.apiSecret = apiSecret;
  }

  async syncStudent({ telegramId, name, university, faculty, courses = [] }) {
    try {
      await fetch(`${this.dashboardUrl}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-secret': this.apiSecret,
        },
        body: JSON.stringify({ telegramId, name, university, faculty, courses }),
      });
    } catch (err) {
      console.error('[WebSeeker Hook Error] Failed to sync student:', err.message);
    }
  }

  async sendCheckEvent({
    studentId,
    studentName,
    university,
    faculty,
    course,
    status = 'checked_normal',
    gradeScore,
    latencyMs = 120,
    details,
  }) {
    try {
      await fetch(`${this.dashboardUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-secret': this.apiSecret,
        },
        body: JSON.stringify({
          studentId,
          studentName,
          university,
          faculty,
          course,
          status,
          gradeScore,
          latencyMs,
          details,
        }),
      });
    } catch (err) {
      console.error('[WebSeeker Hook Error] Failed to push event:', err.message);
    }
  }
}
