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

// ─── Arabic/English label helpers ──────────────────────────────────────────────
const EN = {
  yes: 'Yes', no: 'No', bejoice: 'Bejoice Group — Private Quote Portal',
  seaHdr: 'SEA FREIGHT QUOTE REQUEST', airHdr: 'AIR FREIGHT QUOTE REQUEST',
  landHdr: 'ROAD / LAND FREIGHT QUOTE REQUEST',
  customsHdr: 'CUSTOMS CLEARANCE QUOTE REQUEST',
  projectHdr: 'PROJECT CARGO QUOTE REQUEST',
  contact: 'CONTACT DETAILS', route: 'SHIPMENT ROUTE',
  cargo: 'CARGO DETAILS', services: 'SERVICES',
  clearance: 'CLEARANCE DETAILS', vaServices: 'VALUE-ADDED SERVICES',
  special: 'SPECIAL REQUIREMENTS', projectD: 'PROJECT DETAILS',
  dimsWeight: 'DIMENSIONS & WEIGHT', notes: 'NOTES',
  alsoInt: 'ALSO INTERESTED IN', name: 'Name', company: 'Company',
  email: 'Email', phone: 'Phone', origin: 'Port of Loading',
  dest: 'Port of Discharge', readyDate: 'Cargo Ready Date',
  service: 'Service', containers: 'Containers', commodity: 'Commodity',
  totWeight: 'Total Weight', estValue: 'Est. Value',
  packages: 'Packages', volume: 'Volume (CBM)', grossWeight: 'Gross Weight',
  hazardous: 'Hazardous / DG', reefer: 'Reefer Required',
  reeferTemp: 'Required Temp', customs: 'Customs Clearance',
  insurance: 'Cargo Insurance', pickup: 'Origin Pickup',
  delivery: 'Dest. Delivery', incoterms: 'Incoterms',
  originAir: 'Origin Airport', destAir: 'Destination Airport',
  cargoType: 'Cargo Type', pieces: 'Pieces', weight: 'Weight',
  dimensions: 'Dimensions', lithium: 'Lithium Battery',
  perishable: 'Perishable', svcLevel: 'Service Level',
  svcType: 'Service Type', originCity: 'Origin City',
  destCity: 'Destination City', truckType: 'Truck Type',
  pallets: 'Pallets', direction: 'Direction',
  freightMode: 'Freight Mode', port: 'Port/Airport',
  hsCode: 'HS Code', shipmentValue: 'Shipment Value',
  numPackages: 'No. of Packages', documents: 'Documents',
  dutyPay: 'Duty Payment', inspection: 'Inspection',
  storageRelease: 'Storage & Release', survey: 'Survey',
  projectType: 'Project/Cargo Type', origin2: 'Origin',
  destination2: 'Destination', commodityDesc: 'Commodity/Description',
  weightMt: 'Weight', dimensionsM: 'Dimensions', numPieces: 'No. of Pieces',
  crane: 'Crane Required', escort: 'Escort Required',
  permits: 'Permits Assistance',
  modeSea: 'Sea Freight', modeAir: 'Air Freight',
  modeLand: 'Road/Land Freight', modeCustoms: 'Customs Clearance',
  modeProject: 'Project Cargo',
  seaQ: 'SEA FREIGHT', airQ: 'AIR FREIGHT', landQ: 'ROAD / LAND FREIGHT',
  customsQ: 'CUSTOMS CLEARANCE', projectQ: 'PROJECT CARGO',
  subject: (mode, name) => `[Bejoice Quote - Quick Form] ${mode} — ${name}`,
}
const AR = {
  yes: 'نعم', no: 'لا', bejoice: 'مجموعة بيجويس — بوابة عروض الأسعار الخاصة',
  seaHdr: 'طلب عرض أسعار الشحن البحري', airHdr: 'طلب عرض أسعار الشحن الجوي',
  landHdr: 'طلب عرض أسعار الشحن البري',
  customsHdr: 'طلب عرض أسعار التخليص الجمركي',
  projectHdr: 'طلب عرض أسعار شحن المشاريع',
  contact: 'بيانات الاتصال', route: 'مسار الشحنة',
  cargo: 'تفاصيل البضاعة', services: 'الخدمات',
  clearance: 'تفاصيل التخليص', vaServices: 'الخدمات الإضافية',
  special: 'المتطلبات الخاصة', projectD: 'تفاصيل المشروع',
  dimsWeight: 'الأبعاد والوزن', notes: 'ملاحظات',
  alsoInt: 'مهتم أيضاً بـ',
  name: 'الاسم', company: 'الشركة', email: 'البريد الإلكتروني',
  phone: 'الهاتف', origin: 'ميناء التحميل', dest: 'ميناء التفريغ',
  readyDate: 'تاريخ تجهيز البضاعة', service: 'الخدمة',
  containers: 'الحاويات', commodity: 'نوع البضاعة',
  totWeight: 'الوزن الإجمالي', estValue: 'القيمة التقديرية',
  packages: 'عدد الطرود', volume: 'الحجم (م³)',
  grossWeight: 'الوزن الإجمالي', hazardous: 'خطرة / بضائع خطرة',
  reefer: 'مبردة مطلوبة', reeferTemp: 'درجة الحرارة المطلوبة',
  customs: 'التخليص الجمركي', insurance: 'تأمين البضاعة',
  pickup: 'شحن من المنشأ', delivery: 'توصيل إلى الوجهة',
  incoterms: 'شروط التجارة (Incoterms)',
  originAir: 'مطار الشحن', destAir: 'مطار الوصول',
  cargoType: 'نوع الشحنة', pieces: 'عدد القطع',
  weight: 'الوزن', dimensions: 'الأبعاد', lithium: 'بطارية ليثيوم',
  perishable: 'قابل للتلف', svcLevel: 'مستوى الخدمة',
  svcType: 'نوع الخدمة', originCity: 'مدينة الشحن',
  destCity: 'مدينة الوصول', truckType: 'نوع الشاحنة',
  pallets: 'المنصات (بالتات)', direction: 'الاتجاه',
  freightMode: 'وسيلة الشحن', port: 'الميناء/المطار',
  hsCode: 'رمز النظام المنسق', shipmentValue: 'قيمة الشحنة',
  numPackages: 'عدد الطرود', documents: 'المستندات',
  dutyPay: 'دفع الرسوم الجمركية', inspection: 'الفحص',
  storageRelease: 'التخزين والإفراج', survey: 'المعاينة',
  projectType: 'نوع المشروع/الشحنة', origin2: 'منشأ',
  destination2: 'الوجهة', commodityDesc: 'السلعة/الوصف',
  weightMt: 'الوزن', dimensionsM: 'الأبعاد', numPieces: 'عدد القطع',
  crane: 'رافعة مطلوبة', escort: 'مرافقة مطلوبة',
  permits: 'مساعدة في التصاريح',
  modeSea: 'شحن بحري', modeAir: 'شحن جوي',
  modeLand: 'شحن بري', modeCustoms: 'تخليص جمركي',
  modeProject: 'شحن مشاريع',
  seaQ: 'شحن بحري', airQ: 'شحن جوي', landQ: 'شحن بري',
  customsQ: 'تخليص جمركي', projectQ: 'شحن مشاريع',
  subject: (mode, name) => `[عرض سعر بيجويس] ${mode} — ${name}`,
}

function L(isAr) { return isAr ? AR : EN }

function flag(isAr, val) { const l = L(isAr); return val ? `✅ ${l.yes}` : `❌ ${l.no}` }
function row(L, label, val) { return val ? `• ${label}: ${val}` : '' }

// ─── Per-mode email body builders ────────────────────────────────────────────
function buildSeaBody(d, isAr) {
  const l = L(isAr)
  const containers = d.containers?.map(c => `${c.qty}× ${c.type}`).join(', ') || '—'
  const r = (label, val) => row(l, label, val)
  return `
╔══════════════════════════════════════════╗
  ${l.seaHdr}
  ${l.bejoice}
╚══════════════════════════════════════════╝

👤 ${l.contact}
${r(l.name, d.name)}
${r(l.company, d.company)}
${r(l.email, d.email)}
${r(l.phone, d.phone)}

🚢 ${l.route}
${r(l.service, d.service)}
${r(l.origin, d.origin)}
${r(l.dest, d.destination)}
${r(l.readyDate, d.readyDate)}

📦 ${l.cargo}
${d.service === 'FCL'
      ? `${r(l.containers, containers)}
${r(l.commodity, d.commodity)}
${r(l.totWeight, d.weight ? d.weight + ' tons' : '')}
${r(l.estValue, d.estValue ? 'USD ' + d.estValue : '')}`
      : `${r(l.packages, d.packages)}
${r(l.volume, d.cbm)}
${r(l.grossWeight, d.weight ? d.weight + ' kg' : '')}
${r(l.commodity, d.commodity)}
${r(l.estValue, d.estValue ? 'USD ' + d.estValue : '')}`}
• ${l.hazardous}: ${flag(isAr, d.hazardous)}
• ${l.reefer}: ${flag(isAr, d.reefer)}${d.reefer && d.reeferTemp ? `\n• ${l.reeferTemp}: ${d.reeferTemp}°C` : ''}

🛠 ${l.vaServices}
• ${l.customs}: ${flag(isAr, d.customs)}
• ${l.insurance}:   ${flag(isAr, d.insurance)}
• ${l.pickup}:     ${flag(isAr, d.pickup)}
• ${l.delivery}:    ${flag(isAr, d.delivery)}
${r(l.incoterms, d.incoterms)}

${d.notes ? `📝 ${l.notes}\n${d.notes}` : ''}
`.trim()
}

function buildAirBody(d, isAr) {
  const l = L(isAr)
  const r = (label, val) => row(l, label, val)
  const dims = (d.length && d.width && d.height)
    ? `${d.length} × ${d.width} × ${d.height} ${d.dimUnit}`
    : ''
  return `
╔══════════════════════════════════════════╗
  ${l.airHdr}
  ${l.bejoice}
╚══════════════════════════════════════════╝

👤 ${l.contact}
${r(l.name, d.name)}
${r(l.company, d.company)}
${r(l.email, d.email)}
${r(l.phone, d.phone)}

✈️ ${l.route}
${r(l.originAir, d.origin)}
${r(l.destAir, d.destination)}
${r(l.readyDate, d.readyDate)}

📦 ${l.cargo}
${r(l.cargoType, d.cargoType)}
${r(l.pieces, d.pieces)}
${r(l.weight, d.weight ? d.weight + ' kg' : '')}
${r(l.dimensions, dims)}
${r(l.commodity, d.commodity)}
• ${l.hazardous}:    ${flag(isAr, d.hazardous)}
• ${l.lithium}:   ${flag(isAr, d.lithiumBattery)}
• ${l.perishable}:        ${flag(isAr, d.perishable)}

🛠 ${l.services}
${r(l.svcLevel, d.service)}
• ${l.customs}: ${flag(isAr, d.customs)}
• ${l.insurance}:   ${flag(isAr, d.insurance)}
• ${l.pickup}:     ${flag(isAr, d.pickup)}
• ${l.delivery}:    ${flag(isAr, d.delivery)}

${d.notes ? `📝 ${l.notes}\n${d.notes}` : ''}
`.trim()
}

function buildLandBody(d, isAr) {
  const l = L(isAr)
  const r = (label, val) => row(l, label, val)
  return `
╔══════════════════════════════════════════╗
  ${l.landHdr}
  ${l.bejoice}
╚══════════════════════════════════════════╝

👤 ${l.contact}
${r(l.name, d.name)}
${r(l.company, d.company)}
${r(l.email, d.email)}
${r(l.phone, d.phone)}

🚛 ${l.route}
${r(l.svcType, d.service)}
${r(l.originCity, d.origin)}
${r(l.destCity, d.destination)}
${r(l.readyDate, d.readyDate)}

📦 ${l.cargo}
${r(l.truckType, d.truckType)}
${r(l.weight, d.weight ? d.weight + ' kg' : '')}
${r(l.volume, d.cbm)}
${r(l.pallets, d.pallets)}
${r(l.commodity, d.commodity)}
• ${l.hazardous}: ${flag(isAr, d.hazardous)}
• ${l.reefer}: ${flag(isAr, d.reefer)}${d.reefer && d.reeferTemp ? `\n• ${l.reeferTemp}: ${d.reeferTemp}°C` : ''}

🛠 ${l.services}
• ${l.customs}: ${flag(isAr, d.customs)}
• ${l.insurance}:   ${flag(isAr, d.insurance)}

${d.notes ? `📝 ${l.notes}\n${d.notes}` : ''}
`.trim()
}

function buildCustomsBody(d, isAr) {
  const l = L(isAr)
  const r = (label, val) => row(l, label, val)
  return `
╔══════════════════════════════════════════╗
  ${l.customsHdr}
  ${l.bejoice}
╚══════════════════════════════════════════╝

👤 ${l.contact}
${r(l.name, d.name)}
${r(l.company, d.company)}
${r(l.email, d.email)}
${r(l.phone, d.phone)}

🛃 ${l.clearance}
${r(l.direction, d.direction)}
${r(l.freightMode, d.freightMode)}
${r(l.port, d.port)}

📦 ${l.cargo}
${r(l.commodity, d.commodity)}
${r(l.hsCode, d.hsCode)}
${r(l.shipmentValue, d.shipmentValue ? `${d.currency} ${d.shipmentValue}` : '')}
${r(l.numPackages, d.packages)}
${r(l.documents, d.documents)}

🛠 ${l.services}
• ${l.dutyPay}:      ${flag(isAr, d.dutyPayment)}
• ${l.inspection}:        ${flag(isAr, d.inspection)}
• ${l.storageRelease}: ${flag(isAr, d.storageRelease)}
• ${l.survey}:            ${flag(isAr, d.survey)}

${d.notes ? `📝 ${l.notes}\n${d.notes}` : ''}
`.trim()
}

function buildProjectBody(d, isAr) {
  const l = L(isAr)
  const r = (label, val) => row(l, label, val)
  const dims = (d.length && d.width && d.height)
    ? `${d.length} × ${d.width} × ${d.height} m`
    : ''
  return `
╔══════════════════════════════════════════╗
  ${l.projectHdr}
  ${l.bejoice}
╚══════════════════════════════════════════╝

👤 ${l.contact}
${r(l.name, d.name)}
${r(l.company, d.company)}
${r(l.email, d.email)}
${r(l.phone, d.phone)}

🏗 ${l.projectD}
${r(l.projectType, d.projectType)}
${r(l.origin2, d.origin)}
${r(l.destination2, d.destination)}
${r(l.readyDate, d.readyDate)}
${r(l.commodityDesc, d.commodity)}

📐 ${l.dimsWeight}
${r(l.weightMt, d.weight ? d.weight + ' MT' : '')}
${r(l.dimensionsM, dims)}
${r(l.numPieces, d.pieces)}

🛠 ${l.special}
• ${l.crane}:    ${flag(isAr, d.craneRequired)}
• ${l.escort}:   ${flag(isAr, d.escort)}
• ${l.permits}:${flag(isAr, d.permits)}

${d.notes ? `📝 ${l.notes}\n${d.notes}` : ''}
`.trim()
}

const BODY_BUILDERS = {
  sea: buildSeaBody,
  air: buildAirBody,
  land: buildLandBody,
  customs: buildCustomsBody,
  project: buildProjectBody,
}

const MODE_LABELS = (isAr) => ({
  sea: isAr ? 'شحن بحري' : 'Sea Freight',
  air: isAr ? 'شحن جوي' : 'Air Freight',
  land: isAr ? 'شحن بري' : 'Road/Land Freight',
  customs: isAr ? 'تخليص جمركي' : 'Customs Clearance',
  project: isAr ? 'شحن مشاريع' : 'Project Cargo',
})

// sendBookingNotification removed — Cal.com native RSVP handles organizer notification

// ─── Main send function ───────────────────────────────────────────────────────
export async function sendQuoteEmail(mode, rawData, extraServices = [], isAr = false) {
  const d = sanitizeAll(rawData)
  let body = BODY_BUILDERS[mode]?.(d, isAr) ?? JSON.stringify(d, null, 2)
  const ml = MODE_LABELS(isAr)
  const l = L(isAr)

  if (extraServices.length > 0) {
    const extras = extraServices.map(s => ml[s] || s).join(', ')
    body += `\n\n➕ ${l.alsoInt}\n${extras}`
  }

  const templateParams = {
    to_email: 'info@bejoiceshipping-ksa.com',
    reply_to: d.email || 'info@bejoiceshipping-ksa.com',
    from_name: d.name || (isAr ? 'نظام عروض أسعار بيجويس' : 'Bejoice Quote System'),
    subject: isAr
      ? `[عرض سعر بيجويس - نموذج سريع] ${ml[mode] || mode} — ${d.name || 'مجهول'}`
      : `[Bejoice Quote - Quick Form] ${ml[mode] || mode} — ${d.name || 'Anonymous'}`,
    mode: ml[mode] || mode,
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
