'use client';
import emailjs from '@emailjs/browser'

// ─── EmailJS config — loaded from environment variables only ─────────────────
// Set these in Vercel / Netlify dashboard (Environment Variables section).
// For local dev, create a .env file (gitignored) — see .env.example for the keys needed.
export const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
export const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
export const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// Init EmailJS v4 once
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY)
}

// ─── Sanitisation ─────────────────────────────────────────────────────────────
// Strips all HTML tags and trims whitespace.
// Prevents XSS, HTML injection, email-header injection, and SQL injection patterns.
export function sanitize(value) {
  if (typeof value !== 'string') return String(value ?? '')
  return value
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[\r\n]+/g, ' ')         // collapse newlines (email-header injection)
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // remove non-printable chars
    .trim()
    .slice(0, 2000)                   // hard cap per field
}

export function sanitizeAll(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') {
      out[k] = v
    } else if (Array.isArray(v)) {
      out[k] = v  // preserve arrays — body builders (e.g. containers in Sea) need them intact
    } else {
      out[k] = sanitize(String(v))
    }
  }
  return out
}

// ─── Enhanced sanitizers by field type ──────────────────────────────────────

/** Sanitize a person's name: strip HTML, allow only letters, spaces, hyphens, apostrophes, dots */
export function sanitizeName(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^a-zA-ZÀ-ÿ\u0600-\u06FF\s'.\-]/g, '')
    .trim()
    .slice(0, 100)
}

/** Sanitize general text field (company, origin, destination, etc.) */
export function sanitizeText(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\x20-\x7E\u00A0-\uFFFF\s]/g, '')
    .replace(/['";]*(--|select|insert|update|delete|drop|alter|create|truncate|exec|union|or\s+1=1)/gi, '')
    .trim()
    .slice(0, 200)
}

/** Sanitize multi-line message: strip HTML, remove SQL injection, keep newlines */
export function sanitizeMessage(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\x20-\x7E\u00A0-\uFFFF\s]/g, '')
    .replace(/['";]*(--|select|insert|update|delete|drop|alter|create|truncate|exec|union|or\s+1=1)/gi, '')
    .trim()
    .slice(0, 5000)
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const s = email.trim().toLowerCase()
  if (s.length > 254) return false
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(s)
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  const s = phone.trim()
  if (!/^[+\d\s\-().]+$/.test(s)) return false
  if (s.indexOf('+') > 0) return false
  if (!/^[+\d]/.test(s)) return false
  const digits = s.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/** Validate a person's name: 2-100 chars, no suspicious patterns */
export function isValidName(name) {
  if (!name || typeof name !== 'string') return false
  const s = name.trim()
  if (s.length < 2 || s.length > 100) return false
  if (/[<>{}\\]/.test(s)) return false
  if (/['";]*(--|select|insert|update|delete|drop|alter|create|truncate|exec|union)/gi.test(s)) return false
  return true
}

/** Validate general text (company, city, etc.): 1-200 chars */
export function isValidText(value, min = 1, max = 200) {
  if (!value || typeof value !== 'string') return false
  const s = value.trim()
  if (s.length < min || s.length > max) return false
  if (/[<>{}\\]/.test(s)) return false
  if (/['";]*(--|select|insert|update|delete|drop|alter|create|truncate|exec|union)/gi.test(s)) return false
  return true
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function flag(val) { return val ? '✅ Yes' : '❌ No' }
function row(label, val) { return val ? `• ${label}: ${val}` : '' }

// ─── Per-mode email body builders ────────────────────────────────────────────
function buildSeaBody(d) {
  const containers = d.containers?.map(c => `${c.qty}× ${c.type}`).join(', ') || '—'
  return `
╔══════════════════════════════════════════╗
  SEA FREIGHT QUOTE REQUEST
  Bejoice Group — Private Quote Portal
╚══════════════════════════════════════════╝

👤 CONTACT DETAILS
${row('Name', d.name)}
${row('Company', d.company)}
${row('Email', d.email)}
${row('Phone', d.phone)}

🚢 SHIPMENT ROUTE
${row('Service', d.service)}
${row('Port of Loading', d.origin)}
${row('Port of Discharge', d.destination)}
${row('Cargo Ready Date', d.readyDate)}

📦 CARGO DETAILS
${d.service === 'FCL'
      ? `${row('Containers', containers)}
${row('Commodity', d.commodity)}
${row('Total Weight', d.weight ? d.weight + ' tons' : '')}
${row('Est. Value', d.estValue ? 'USD ' + d.estValue : '')}`
      : `${row('Packages', d.packages)}
${row('Volume (CBM)', d.cbm)}
${row('Gross Weight', d.weight ? d.weight + ' kg' : '')}
${row('Commodity', d.commodity)}
${row('Est. Value', d.estValue ? 'USD ' + d.estValue : '')}`}
• Hazardous / DG: ${flag(d.hazardous)}
• Reefer Required: ${flag(d.reefer)}${d.reefer && d.reeferTemp ? `\n• Required Temp: ${d.reeferTemp}°C` : ''}

🛠 VALUE-ADDED SERVICES
• Customs Clearance: ${flag(d.customs)}
• Cargo Insurance:   ${flag(d.insurance)}
• Origin Pickup:     ${flag(d.pickup)}
• Dest. Delivery:    ${flag(d.delivery)}
${row('Incoterms', d.incoterms)}

${d.notes ? `📝 NOTES\n${d.notes}` : ''}
`.trim()
}

function buildAirBody(d) {
  const dims = (d.length && d.width && d.height)
    ? `${d.length} × ${d.width} × ${d.height} ${d.dimUnit}`
    : ''
  return `
╔══════════════════════════════════════════╗
  AIR FREIGHT QUOTE REQUEST
  Bejoice Group — Private Quote Portal
╚══════════════════════════════════════════╝

👤 CONTACT DETAILS
${row('Name', d.name)}
${row('Company', d.company)}
${row('Email', d.email)}
${row('Phone', d.phone)}

✈️ SHIPMENT ROUTE
${row('Origin Airport', d.origin)}
${row('Destination Airport', d.destination)}
${row('Cargo Ready Date', d.readyDate)}

📦 CARGO DETAILS
${row('Cargo Type', d.cargoType)}
${row('Pieces', d.pieces)}
${row('Weight', d.weight ? d.weight + ' kg' : '')}
${row('Dimensions', dims)}
${row('Commodity', d.commodity)}
• Hazardous / DG:    ${flag(d.hazardous)}
• Lithium Battery:   ${flag(d.lithiumBattery)}
• Perishable:        ${flag(d.perishable)}

🛠 SERVICES
${row('Service Level', d.service)}
• Customs Clearance: ${flag(d.customs)}
• Cargo Insurance:   ${flag(d.insurance)}
• Origin Pickup:     ${flag(d.pickup)}
• Dest. Delivery:    ${flag(d.delivery)}

${d.notes ? `📝 NOTES\n${d.notes}` : ''}
`.trim()
}

function buildLandBody(d) {
  return `
╔══════════════════════════════════════════╗
  ROAD / LAND FREIGHT QUOTE REQUEST
  Bejoice Group — Private Quote Portal
╚══════════════════════════════════════════╝

👤 CONTACT DETAILS
${row('Name', d.name)}
${row('Company', d.company)}
${row('Email', d.email)}
${row('Phone', d.phone)}

🚛 SHIPMENT ROUTE
${row('Service Type', d.service)}
${row('Origin City', d.origin)}
${row('Destination City', d.destination)}
${row('Cargo Ready Date', d.readyDate)}

📦 CARGO DETAILS
${row('Truck Type', d.truckType)}
${row('Weight', d.weight ? d.weight + ' kg' : '')}
${row('Volume (CBM)', d.cbm)}
${row('Pallets', d.pallets)}
${row('Commodity', d.commodity)}
• Hazardous / DG: ${flag(d.hazardous)}
• Reefer Required: ${flag(d.reefer)}${d.reefer && d.reeferTemp ? `\n• Required Temp: ${d.reeferTemp}°C` : ''}

🛠 SERVICES
• Customs Clearance: ${flag(d.customs)}
• Cargo Insurance:   ${flag(d.insurance)}

${d.notes ? `📝 NOTES\n${d.notes}` : ''}
`.trim()
}

function buildCustomsBody(d) {
  return `
╔══════════════════════════════════════════╗
  CUSTOMS CLEARANCE QUOTE REQUEST
  Bejoice Group — Private Quote Portal
╚══════════════════════════════════════════╝

👤 CONTACT DETAILS
${row('Name', d.name)}
${row('Company', d.company)}
${row('Email', d.email)}
${row('Phone', d.phone)}

🛃 CLEARANCE DETAILS
${row('Direction', d.direction)}
${row('Freight Mode', d.freightMode)}
${row('Port/Airport', d.port)}

📦 CARGO DETAILS
${row('Commodity', d.commodity)}
${row('HS Code', d.hsCode)}
${row('Shipment Value', d.shipmentValue ? `${d.currency} ${d.shipmentValue}` : '')}
${row('No. of Packages', d.packages)}
${row('Documents', d.documents)}

🛠 SERVICES REQUIRED
• Duty Payment:      ${flag(d.dutyPayment)}
• Inspection:        ${flag(d.inspection)}
• Storage & Release: ${flag(d.storageRelease)}
• Survey:            ${flag(d.survey)}

${d.notes ? `📝 NOTES\n${d.notes}` : ''}
`.trim()
}

function buildProjectBody(d) {
  const dims = (d.length && d.width && d.height)
    ? `${d.length} × ${d.width} × ${d.height} m`
    : ''
  return `
╔══════════════════════════════════════════╗
  PROJECT CARGO QUOTE REQUEST
  Bejoice Group — Private Quote Portal
╚══════════════════════════════════════════╝

👤 CONTACT DETAILS
${row('Name', d.name)}
${row('Company', d.company)}
${row('Email', d.email)}
${row('Phone', d.phone)}

🏗 PROJECT DETAILS
${row('Project/Cargo Type', d.projectType)}
${row('Origin', d.origin)}
${row('Destination', d.destination)}
${row('Cargo Ready Date', d.readyDate)}
${row('Commodity/Description', d.commodity)}

📐 DIMENSIONS & WEIGHT
${row('Weight', d.weight ? d.weight + ' MT' : '')}
${row('Dimensions', dims)}
${row('No. of Pieces', d.pieces)}

🛠 SPECIAL REQUIREMENTS
• Crane Required:    ${flag(d.craneRequired)}
• Escort Required:   ${flag(d.escort)}
• Permits Assistance:${flag(d.permits)}

${d.notes ? `📝 NOTES\n${d.notes}` : ''}
`.trim()
}

const BODY_BUILDERS = {
  sea: buildSeaBody,
  air: buildAirBody,
  land: buildLandBody,
  customs: buildCustomsBody,
  project: buildProjectBody,
}

const MODE_LABELS = {
  sea: 'Sea Freight', air: 'Air Freight', land: 'Road/Land Freight',
  customs: 'Customs Clearance', project: 'Project Cargo',
}

// sendBookingNotification removed — Cal.com native RSVP handles organizer notification

// ─── Main send function ───────────────────────────────────────────────────────
export async function sendQuoteEmail(mode, rawData, extraServices = []) {
  const d = sanitizeAll(rawData)
  let body = BODY_BUILDERS[mode]?.(d) ?? JSON.stringify(d, null, 2)

  if (extraServices.length > 0) {
    const labels = { sea:'Sea Freight', air:'Air Freight', land:'Road/Land Freight', customs:'Customs Clearance', project:'Project Cargo' }
    const extras = extraServices.map(s => labels[s] || s).join(', ')
    body += `\n\n➕ ALSO INTERESTED IN\n${extras}`
  }

  const templateParams = {
    to_email: 'info@bejoiceshipping-ksa.com',
    reply_to: d.email || 'info@bejoiceshipping-ksa.com',
    from_name: d.name || 'Bejoice Quote System',
    subject: `[Bejoice Quote - Quick Form] ${MODE_LABELS[mode] || mode} — ${d.name || 'Anonymous'}`,
    mode: MODE_LABELS[mode] || mode,
    client_name: d.name || '—',
    company: d.company || '—',
    client_email: d.email || '—',
    phone: d.phone || '—',
    message: body,
  }

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY,
  )
}
