import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// POST /api/booking-notify
// 1. Sends a plain-text notification email via EmailJS (existing flow)
// 2. Sends a proper .ics calendar invite via SMTP so Outlook shows Accept/Decline

const TEAM_EMAIL = 'info@bejoiceshipping-ksa.com';

function fmtDate(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      timeZone: 'Asia/Riyadh',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch (_) { return iso; }
}

function fmtClock(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso)
      .toLocaleTimeString('en-US', {
        timeZone: 'Asia/Riyadh',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
      .replace(' AM', 'am')
      .replace(' PM', 'pm');
  } catch (_) { return iso; }
}

/** Convert ISO 8601 → ICS UTC timestamp e.g. 20240516T093000Z */
function toICSDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildICS(params: {
  uid: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
}) {
  const dtStart  = toICSDate(params.startTime);
  const dtEnd    = toICSDate(params.endTime);
  const dtstamp  = toICSDate(new Date().toISOString());
  const uid      = (params.uid || `${Date.now()}`) + '@bejoiceshipping-ksa.com';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bejoice Shipping KSA//Freight Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Freight Consultation — ${params.name}`,
    // Booking system is the organiser so the team member appears as attendee → gets Accept/Decline
    `ORGANIZER;CN=Bejoice Booking:mailto:booking@bejoiceshipping-ksa.com`,
    // Team email: RSVP=TRUE → Outlook renders Accept/Decline buttons
    `ATTENDEE;CN=Freight Expert;ROLE=CHAIR;RSVP=TRUE:mailto:${TEAM_EMAIL}`,
  ];

  if (params.email && params.email.includes('@') && params.email !== TEAM_EMAIL) {
    lines.push(`ATTENDEE;CN=${params.name};ROLE=REQ-PARTICIPANT;RSVP=FALSE:mailto:${params.email}`);
  }

  lines.push(
    `DESCRIPTION:Booked by ${params.name} (${params.email || '—'}).\\nManage at https://app.cal.com/bookings/upcoming`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  );

  return lines.join('\r\n');
}

async function sendCalendarInvite(params: {
  uid: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) throw new Error('SMTP credentials not configured');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // STARTTLS on port 587
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
  });

  const icsContent = buildICS(params);
  const dateStr    = fmtDate(params.startTime);
  const startStr   = fmtClock(params.startTime);
  const endStr     = fmtClock(params.endTime);

  await transporter.sendMail({
    from:    `"Bejoice Booking" <${smtpUser}>`,
    to:      TEAM_EMAIL,
    subject: `[Booking] Freight Consultation — ${params.name} · ${dateStr}`,
    text: [
      'A new consultation has been booked.',
      '',
      `Who:   ${params.name} (${params.email || '—'})`,
      `When:  ${dateStr} | ${startStr} – ${endStr} (Asia/Riyadh)`,
      '',
      'Accept or decline using the calendar invite attached.',
      'Manage booking: https://app.cal.com/bookings/upcoming',
    ].join('\n'),
    // Embed .ics as alternative MIME part — Outlook renders inline Accept/Decline
    alternatives: [{
      contentType: 'text/calendar; method=REQUEST; charset=UTF-8',
      content: Buffer.from(icsContent, 'utf-8'),
    }],
    // Also attach as a file for clients that don't process the alternative part
    attachments: [{
      filename: 'invite.ics',
      content:  Buffer.from(icsContent, 'utf-8'),
      contentType: 'text/calendar; method=REQUEST; charset=UTF-8',
    }],
  });
}

function buildMessage(name: string, email: string, bookingUid: string, whenStr: string) {
  return [
    'A new event has been scheduled.',
    '',
    '─────────────────────────────────────────',
    '',
    'What',
    `Freight expert consultation between Freight Expert and ${name}`,
    '',
    'When',
    whenStr,
    '',
    'Who',
    'Freight Expert  ·  Organizer',
    TEAM_EMAIL,
    '',
    `${name}  ·  Guest`,
    email || '—',
    bookingUid ? `\nBooking ID: ${bookingUid}` : '',
    '',
    '─────────────────────────────────────────',
    '',
    'Need to make a change?',
    'Reschedule or Cancel: https://app.cal.com/bookings/upcoming',
  ].filter(l => l !== undefined).join('\n');
}

async function sendViaEmailJS(
  toEmail: string,
  params: { serviceId: string; templateId: string; publicKey: string;
            name: string; email: string; dateStr: string; message: string }
) {
  const payload = {
    service_id:  params.serviceId,
    template_id: params.templateId,
    user_id:     params.publicKey,
    template_params: {
      to_email:     toEmail,
      reply_to:     params.email || TEAM_EMAIL,
      from_name:    'Bejoice Booking',
      subject:      `[Bejoice Booking - Cal.com] ${params.name} — ${params.dateStr}`,
      mode:         'Book a Call',
      client_name:  params.name,
      company:      '—',
      client_email: params.email || '—',
      phone:        '—',
      message:      params.message,
    },
  };

  const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`EmailJS ${r.status}: ${text}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    // Support both postMessage format and Cal.com native webhook format
    const calPayload = (body.triggerEvent && body.payload)
      ? (body.payload as Record<string, unknown>)
      : body;

    const attendees = (calPayload.attendees as Array<{name?:string;email?:string}> | undefined);
    const firstAttendee = Array.isArray(attendees) ? (attendees[0] ?? {}) : {};

    const name       = String(firstAttendee.name  || (calPayload.name  as string) || 'Unknown').slice(0, 200).trim();
    const email      = String(firstAttendee.email || (calPayload.email as string) || '').slice(0, 320).trim();
    const startTime  = String((calPayload.startTime as string) || '').slice(0, 50);
    const endTime    = String((calPayload.endTime   as string) || '').slice(0, 50);
    const bookingUid = String((calPayload.uid       as string) || '').slice(0, 200);

    const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || '';
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
    const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || '';

    const dateStr  = fmtDate(startTime);
    const startStr = fmtClock(startTime);
    const endStr   = fmtClock(endTime);
    const whenStr  = (dateStr !== '—' && startStr !== '—')
      ? `${dateStr} | ${startStr} - ${endStr} (Asia/Riyadh)`
      : '—';

    const message = buildMessage(name, email, bookingUid, whenStr);

    // ── 1. Send plain notification via EmailJS (existing flow) ──────────────
    if (serviceId && templateId && publicKey) {
      const emailParams = { serviceId, templateId, publicKey, name, email, dateStr, message };
      await sendViaEmailJS(TEAM_EMAIL, emailParams).catch(() => {}); // non-fatal

      const hasCustomerEmail = email && email.includes('@') && email !== TEAM_EMAIL;
      if (hasCustomerEmail) {
        await sendViaEmailJS(email, emailParams).catch(() => {});
      }
    }

    // ── 2. Send .ics calendar invite via SMTP so Outlook shows Accept/Decline ─
    if (startTime && endTime) {
      await sendCalendarInvite({ uid: bookingUid, startTime, endTime, name, email })
        .catch((err) => {
          console.error('[booking-notify] calendar invite failed:', err);
          // Non-fatal — booking notification already sent above
        });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
