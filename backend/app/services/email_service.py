"""
email_service.py — SMTP email notifications for AarogyaLekha.

Reads config from environment variables:
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

If any config is missing the functions log a warning and return silently,
so the application never crashes due to missing email config.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def _get_smtp_config():
    """Read SMTP config from environment at call time."""
    return {
        "host": os.environ.get("SMTP_HOST", ""),
        "port": int(os.environ.get("SMTP_PORT", "587")),
        "user": os.environ.get("SMTP_USER", ""),
        "password": os.environ.get("SMTP_PASSWORD", ""),
    }


def _send_html_email(to: str, subject: str, html_body: str):
    """Low-level send. Logs warning and returns if SMTP is not configured."""
    cfg = _get_smtp_config()
    if not (cfg["host"] and cfg["user"] and cfg["password"]):
        logger.warning("SMTP not configured — email to %s skipped.", to)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = cfg["user"]
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
            server.ehlo()
            server.starttls()
            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["user"], to, msg.as_string())
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def send_scheduling_email(to: str, appointment_data: dict):
    """Send appointment confirmation email."""
    doctor = appointment_data.get("assigned_doctor_name", "N/A")
    department = appointment_data.get("department", "N/A")
    wait = appointment_data.get("predicted_wait_minutes", "N/A")
    patient = appointment_data.get("patient_name", "Patient")

    html = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;
                border:1px solid #E1EAF5;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1E88E5,#1565C0);padding:28px 24px;color:#fff;">
            <h2 style="margin:0 0 4px;">🏥 Appointment Confirmed</h2>
            <p style="margin:0;opacity:0.9;font-size:14px;">AarogyaLekha Hospital Co-ordination System</p>
        </div>
        <div style="padding:24px;">
            <p>Hello <strong>{patient}</strong>,</p>
            <p>Your appointment has been <strong>scheduled</strong>. Here are the details:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px 0;color:#5C6B8A;">Doctor</td>
                    <td style="padding:8px 0;font-weight:600;">{doctor}</td></tr>
                <tr><td style="padding:8px 0;color:#5C6B8A;">Department</td>
                    <td style="padding:8px 0;font-weight:600;">{department}</td></tr>
                <tr><td style="padding:8px 0;color:#5C6B8A;">Est. Wait Time</td>
                    <td style="padding:8px 0;font-weight:600;">{wait} minutes</td></tr>
            </table>
            <p style="color:#5C6B8A;font-size:13px;">
                Please arrive 10 minutes before your estimated time.
                If you need to reschedule, contact the hospital.
            </p>
        </div>
        <div style="background:#F0F6FF;text-align:center;padding:14px;font-size:12px;color:#90A4AE;">
            AarogyaLekha &copy; 2026
        </div>
    </div>
    """
    _send_html_email(to, "✅ Appointment Confirmed — AarogyaLekha", html)


def send_rescheduling_email(to: str, appointment_data: dict, reason: str):
    """Send rescheduling notification email."""
    patient = appointment_data.get("patient_name", "Patient")
    doctor = appointment_data.get("assigned_doctor_name", "N/A")
    department = appointment_data.get("department", "N/A")

    html = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;
                border:1px solid #E1EAF5;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#FB8C00,#E65100);padding:28px 24px;color:#fff;">
            <h2 style="margin:0 0 4px;">⚠️ Appointment Rescheduled</h2>
            <p style="margin:0;opacity:0.9;font-size:14px;">AarogyaLekha Hospital Co-ordination System</p>
        </div>
        <div style="padding:24px;">
            <p>Hello <strong>{patient}</strong>,</p>
            <p>Your appointment with <strong>Dr. {doctor}</strong> ({department})
               has been <strong>rescheduled</strong>.</p>
            <div style="background:#FFF3E0;border-left:4px solid #FB8C00;padding:12px 16px;
                        border-radius:6px;margin:16px 0;">
                <strong>Reason:</strong> {reason}
            </div>
            <p>We sincerely apologise for the inconvenience.
               A hospital representative will contact you with the updated timing.</p>
        </div>
        <div style="background:#F0F6FF;text-align:center;padding:14px;font-size:12px;color:#90A4AE;">
            AarogyaLekha &copy; 2026
        </div>
    </div>
    """
    _send_html_email(to, "⚠️ Appointment Rescheduled — AarogyaLekha", html)


def send_password_reset_email(to: str, temp_password: str):
    """Send temporary password email."""
    html = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;
                border:1px solid #E1EAF5;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1E88E5,#1565C0);padding:28px 24px;color:#fff;">
            <h2 style="margin:0 0 4px;">🔑 Password Reset</h2>
            <p style="margin:0;opacity:0.9;font-size:14px;">AarogyaLekha Hospital Co-ordination System</p>
        </div>
        <div style="padding:24px;">
            <p>Your password has been reset. Use the temporary password below to log in,
               then change it immediately.</p>
            <div style="background:#E3F2FD;padding:16px;border-radius:8px;text-align:center;
                        font-size:20px;font-weight:700;letter-spacing:2px;margin:16px 0;">
                {temp_password}
            </div>
            <p style="color:#5C6B8A;font-size:13px;">
                If you did not request this reset, please contact the hospital admin.
            </p>
        </div>
        <div style="background:#F0F6FF;text-align:center;padding:14px;font-size:12px;color:#90A4AE;">
            AarogyaLekha &copy; 2026
        </div>
    </div>
    """
    _send_html_email(to, "🔑 Password Reset — AarogyaLekha", html)
