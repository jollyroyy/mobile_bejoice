import { NextRequest, NextResponse } from 'next/server';

// POST /api/booking-notify
// Receives Cal.com booking data and sends an email notification via EmailJS REST.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string;
      email?: string;
      startTime?: string;
      endTime?: string;
      uid?: string;
    };

    const { name = '', email = '', startTime = '', endTime = '', uid = '' } = body;

    const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || '';
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
    const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || '';

    if (!serviceId || !templateId || !publicKey) {
      return NextResponse.json({ error: 'EmailJS not configured' }, { status: 503 });
    }

    const payload = {
      service_id:  serviceId,
      template_id: templateId,
      user_id:     publicKey,
      template_params: {
        from_name:    name,
        from_email:   email,
        start_time:   startTime,
        end_time:     endTime,
        booking_uid:  uid,
        message:      `Booking confirmed for ${name} (${email}) — ${startTime}`,
      },
    };

    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: text }, { status: r.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
