import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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
  const dtStart = toICSDate(params.startTime);
  const dtEnd   = toICSDate(params.endTime);
  const dtstamp = toICSDate(new Date().toISOString());
  const uid     = (params.uid || `${Date.now()}`) + '@bejoiceshipping-ksa.com';

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
    `ORGANIZER;CN=Bejoice Booking:mailto:${TEAM_EMAIL}`,
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not configured');

  const resend = new Resend(apiKey);
  const icsContent = buildICS(params);
  const dateStr  = fmtDate(params.startTime);
  const startStr = fmtClock(params.startTime);
  const endStr   = fmtClock(params.endTime);

  await resend.emails.send({
    from: 'Bejoice Booking <booking@bejoiceshipping-ksa.com>',
    to:   [TEAM_EMAIL],
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
    attachments: [{
      filename:    'invite.ics',
      content:     Buffer.from(icsContent, 'utf-8').toString('base64'),
      contentType: 'text/calendar; method=REQUEST; charset=UTF-8',
    }],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    // Support both postMessage format and Cal.com native webhook format
    const calPayload = (body.triggerEvent && body.payload)
      ? (body.payload as Record<string, unknown>)
      : body;

    const attendees    = (calPayload.attendees as Array<{name?:string;email?:string}> | undefined);
    const firstAttendee = Array.isArray(attendees) ? (attendees[0] ?? {}) : {};

    const name       = String(firstAttendee.name  || (calPayload.name  as string) || 'Unknown').slice(0, 200).trim();
    const email      = String(firstAttendee.email || (calPayload.email as string) || '').slice(0, 320).trim();
    const startTime  = String((calPayload.startTime as string) || '').slice(0, 50);
    const endTime    = String((calPayload.endTime   as string) || '').slice(0, 50);
    const bookingUid = String((calPayload.uid       as string) || '').slice(0, 200);

    // .ics calendar invite via Resend — Outlook Accept/Decline (non-fatal)
    // Cal.com native emails handle organizer + guest booking confirmations
    if (startTime && endTime) {
      await sendCalendarInvite({ uid: bookingUid, startTime, endTime, name, email })
        .catch((err) => {
          console.error('[booking-notify] calendar invite failed:', err);
        });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
