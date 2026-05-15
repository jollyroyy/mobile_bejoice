import { NextRequest, NextResponse } from 'next/server';

// POST /api/booking-notify
// Receives Cal.com booking data and sends a Cal.com-style email notification
// via the EmailJS REST API to BOTH the team and the customer.

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
    'info@bejoiceshipping-ksa.com',
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
      reply_to:     params.email || 'info@bejoiceshipping-ksa.com',
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
    const body = await req.json() as {
      name?: string; email?: string;
      startTime?: string; endTime?: string; uid?: string;
    };

    const name       = String(body.name      || 'Unknown').slice(0, 200).trim();
    const email      = String(body.email     || '').slice(0, 320).trim();
    const startTime  = String(body.startTime || '').slice(0, 50);
    const endTime    = String(body.endTime   || '').slice(0, 50);
    const bookingUid = String(body.uid       || '').slice(0, 200);

    const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || '';
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
    const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || '';

    if (!serviceId || !templateId || !publicKey) {
      return NextResponse.json({ error: 'EmailJS not configured' }, { status: 503 });
    }

    const dateStr  = fmtDate(startTime);
    const startStr = fmtClock(startTime);
    const endStr   = fmtClock(endTime);
    const whenStr  = (dateStr !== '—' && startStr !== '—')
      ? `${dateStr} | ${startStr} - ${endStr} (Asia/Riyadh)`
      : '—';

    const message = buildMessage(name, email, bookingUid, whenStr);
    const emailParams = { serviceId, templateId, publicKey, name, email, dateStr, message };

    const teamEmail = 'info@bejoiceshipping-ksa.com';
    const hasCustomerEmail = email && email.includes('@') && email !== teamEmail;

    // Always notify the team
    await sendViaEmailJS(teamEmail, emailParams);

    // Also notify the customer if they provided a valid email
    if (hasCustomerEmail) {
      await sendViaEmailJS(email, emailParams).catch(() => {}); // non-fatal
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
