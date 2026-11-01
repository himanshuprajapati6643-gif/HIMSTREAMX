"""
HIMSTREAMX Security & Notification Service
Developed by Himanshu Prajapati (2026)
Handles real-time asynchronous security email alerts when any user logs in or registers.
"""
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from backend.config import settings

AUDIT_LOG_FILE = Path(__file__).resolve().parent / "security_audit.log"

def log_audit_event(event_line: str):
    """Appends an event to the persistent security audit log file."""
    try:
        with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] {event_line}\n")
    except Exception as e:
        print(f"⚠️ Failed to write audit log: {e}")

def send_login_notification(
    user_id: str,
    user_name: str,
    user_email: str,
    role: str,
    ip_address: str = "127.0.0.1",
    user_agent: str = "Unknown Browser",
    action: str = "Login"
):
    """
    Dispatches an asynchronous security notification email to the administrator
    whenever any user authenticates or signs up on HIMSTREAMX.
    """
    recipient = settings.ADMIN_NOTIFICATION_EMAIL
    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    subject = f"🔔 HIMSTREAMX Alert: User {action} ({user_email})"

    # Plaintext message
    text_body = f"""
=====================================================
HIMSTREAMX OTT + MUSIC PLATFORM - SECURITY ALERT
=====================================================

Action:           User {action}
Name:             {user_name}
Email:            {user_email}
User ID:          {user_id}
Role:             {role}
Timestamp:        {timestamp}
Client IP:        {ip_address}
User Agent:       {user_agent}

Platform:         HIMSTREAMX v{settings.VERSION}
Created by:       Himanshu Prajapati
=====================================================
"""

    # HTML message
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e0e0e0; margin: 0; padding: 20px; }}
            .container {{ max-width: 560px; margin: 0 auto; background: #13151b; border: 1px solid rgba(86, 226, 234, 0.25); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ background: linear-gradient(135deg, #0b0c10, #1f2833); padding: 24px; border-bottom: 2px solid #56e2ea; text-align: center; }}
            .header h2 {{ margin: 0; color: #56e2ea; font-size: 22px; letter-spacing: 1px; }}
            .header span {{ color: #ff3366; font-weight: 700; }}
            .body {{ padding: 24px; }}
            .badge {{ display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: {'#ffb703' if role == 'ADMIN' else '#56e2ea'}; color: #000; }}
            .info-table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
            .info-table td {{ padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }}
            .info-table td.label {{ color: #8892b0; width: 35%; font-weight: 600; }}
            .info-table td.val {{ color: #ffffff; }}
            .footer {{ padding: 16px 24px; background: #0b0c10; font-size: 12px; color: #667; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>HIM<span>STREAMX</span> Security Alert</h2>
                <p style="margin: 6px 0 0; color: #8892b0; font-size: 13px;">Real-Time User Authentication Telemetry</p>
            </div>
            <div class="body">
                <p style="font-size: 15px; margin-top: 0;">Hello <strong>Himanshu Prajapati</strong>,</p>
                <p style="font-size: 14px; color: #cbd5e1;">A user has successfully <strong>{action.lower()}</strong> into the HIMSTREAMX streaming platform.</p>
                
                <table class="info-table">
                    <tr><td class="label">Action:</td><td class="val"><strong style="color: #56e2ea;">{action}</strong></td></tr>
                    <tr><td class="label">User Name:</td><td class="val">{user_name}</td></tr>
                    <tr><td class="label">Email Address:</td><td class="val"><strong>{user_email}</strong></td></tr>
                    <tr><td class="label">User Role:</td><td class="val"><span class="badge">{role}</span></td></tr>
                    <tr><td class="label">Client IP:</td><td class="val"><code>{ip_address}</code></td></tr>
                    <tr><td class="label">Timestamp:</td><td class="val">{timestamp}</td></tr>
                    <tr><td class="label">Device/Agent:</td><td class="val" style="font-size: 12px; word-break: break-all;">{user_agent}</td></tr>
                </table>
            </div>
            <div class="footer">
                &copy; 2026 HIMSTREAMX Platform &bull; Developed by Himanshu Prajapati
            </div>
        </div>
    </body>
    </html>
    """

    # Record in persistent audit log
    audit_entry = f"EVENT={action} USER={user_email} ROLE={role} IP={ip_address} UA={user_agent}"
    log_audit_event(audit_entry)

    # If live SMTP is configured, send the real email via standard library smtplib
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM_EMAIL
            msg["To"] = recipient

            part1 = MIMEText(text_body, "plain", "utf-8")
            part2 = MIMEText(html_body, "html", "utf-8")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [recipient], msg.as_string())

            print(f"[EMAIL DISPATCHED]: Live notification email delivered to {recipient} for {user_email} ({action}).")
            return True
        except Exception as smtp_err:
            print(f"[SMTP WARNING]: Failed to send email via {settings.SMTP_HOST}: {smtp_err}")
            # Do not re-raise; logging in audit is preserved
            return False
    else:
        # Development / Zero-Config fallback: structured local telemetry
        print(f"[LOGIN EMAIL NOTIFICATION DISPATCHED TO: {recipient}]")
        print(f"   -> Event: User {action} | Name: {user_name} | Email: {user_email} | Role: {role} | IP: {ip_address}")
        return True
