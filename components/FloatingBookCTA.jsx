'use client';
// FloatingBookCTA.jsx — Layla AI freight assistant for Bejoice Premium
import { useState, useEffect, useRef } from "react";
import { useCalBooking } from "../hooks/useCalBooking";
import { retrieveChunks } from "../data/laylaKnowledgeBase";
import { useLang } from "../context/LangContext";
import ar from "../i18n/ar";

const CAL_LINK = "bejoice/freight-expert-consultation";

const MESSAGES = [
  "Hey there! 👋 Need help with shipping?",
  "Get a free freight quote in 60 seconds!",
  "We move cargo across 50+ countries 🌍",
  "Red Sea disruptions? We have alt routes!",
  "Sea · Air · Land — we cover it all!",
  "Vision 2030 logistics partner 🇸🇦",
  "Talk to a freight expert, free of charge!",
];

const QUICK_REPLIES = [
  { label: "📦 Start Shipment",     action: "quote" },
  { label: "✈️ Air Freight",       action: "air"   },
  { label: "🚢 Sea Freight",       action: "sea"   },
  { label: "🏗️ Heavy Cargo",       action: "heavy" },
  { label: "🇸🇦 Saudi Logistics",  action: "saudi" },
  { label: "📊 Market Updates",    action: "market"},
  { label: "📞 Talk to Expert",    action: "call"  },
];

// ── Utility: pick random from array ──────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// ── Current date helpers (always up-to-date) ─────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
function currentMonth() { return MONTHS[new Date().getMonth()] }
function currentYear() { return new Date().getFullYear() }
function currentDateStr() { return `${currentMonth()} ${currentYear()}` }

// ── Knowledge base — keyword → topic mapping ────────────────
const KB = {
  greet: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "salam", "marhaba", "howdy", "yo", "sup", "مرحبا", "اهلا", "السلام عليكم", "صباح الخير"],
  quote: ["quote", "price", "rate", "cost", "how much", "pricing", "estimate", "charges", "fee", "tariff rate", "budget", "سعر", "عرض سعر", "تكلفة", "كم السعر", "تقدير", "رسوم"],
  air: ["air freight", "air cargo", "airfreight", "airline", "aircraft", "fly", "flight", "aviation", "express", "urgent", "overnight", "air shipping", "plane", "شحن جوي", "طائرة", "مطار", "جوي"],
  sea: ["sea freight", "ocean freight", "vessel", "container", "fcl", "lcl", "port", "shipping line", "maritime", "nautical", "bulk carrier", "ro-ro", "tanker", "ship", "ocean", "شحن بحري", "حاوية", "ميناء", "بحر", "سفينة"],
  heavy: ["heavy lift", "heavy cargo", "oversized", "project cargo", "oog", "out of gauge", "crane", "machinery", "industrial", "breakbulk", "abnormal load", "wide load", "overweight", "transformer", "turbine", "رفع ثقيل", "مشاريع", "آلات", "معدات ثقيلة"],
  saudi: ["saudi", "ksa", "riyadh", "jeddah", "dammam", "mecca", "medina", "zatca", "vision 2030", "neom", "giga project", "saudi customs", "saudi port", "king abdulaziz port", "jeddah islamic port", "king fahd industrial port", "saso", "sabic", "السعودية", "الرياض", "جدة", "الدمام", "رؤية 2030", "نيوم"],
  market: ["red sea", "suez canal", "houthi", "disruption", "delay", "congestion", "freight rate", "market update", "latest", "news", "trend", "supply chain crisis", "shipping crisis", "port congestion", "container shortage", "rate spike", "market", "البحر الأحمر", "قناة السويس", "سوق", "أسعار", "تحديث"],
  customs: ["customs", "clearance", "import", "export", "duty", "tariff", "compliance", "documentation", "bill of lading", "invoice", "packing list", "certificate of origin", "hs code", "inspection", "gazt", "aqil", "جمارك", "تخليص", "استيراد", "تصدير", "رسوم جمركية"],
  warehousing: ["warehouse", "storage", "fulfillment", "distribution", "3pl", "inventory", "last mile", "cold chain", "temperature controlled", "bonded warehouse", "تخزين", "مستودع", "مخازن"],
  tracking: ["track", "tracking", "status", "where is", "shipment status", "locate", "eta", "estimated arrival", "delivery", "update my shipment", "تتبع", "حالة الشحنة", "أين شحنتي"],
  insurance: ["insurance", "cargo insurance", "damage", "claim", "loss", "cover", "liability", "تأمين", "تأمين البضاعة", "تعويض"],
  contact: ["contact", "call", "speak", "talk", "human", "agent", "expert", "representative", "phone", "email", "book", "meeting", "consultation", "اتصال", "مكالمة", "تحدث", "خبير", "وكيل"],
  whoAreYou: ["who are you", "what are you", "are you human", "are you a robot", "are you ai", "are you real", "are you a bot", "tell me about yourself", "introduce yourself", "what can you do", "من أنت", "ما أنت", "هل أنت بشر", "هل أنت روبوت", "عرف عن نفسك"],
  howAreYou: ["how are you", "how do you do", "are you ok", "how's it going", "what's up", "how r u", "hows it going", "you doing well", "كيف حالك", "كيفك", "هل أنت بخير"],
  compliment: ["you are beautiful", "you're beautiful", "you look beautiful", "you are pretty", "you're pretty", "you are gorgeous", "you're gorgeous", "you are amazing", "you are lovely", "you are cute", "you're cute", "you are stunning", "so nice", "you are wonderful", "you're wonderful", "you are great", "you are awesome", "جميل", "رائع", "لطيف", "مذهل"],
  romantic: ["date me", "go out with me", "will you marry me", "i love you", "i like you", "do you like me", "be my girlfriend", "be my boyfriend", "do you have feelings", "can we date", "fall in love", "are you single", "relationship with you", "أحبك", "حب", "أعجب بك", "مواعدة", "زواج"],
  negative: ["you are bad", "you're bad", "you are useless", "you're useless", "you are stupid", "you're stupid", "you are dumb", "you're dumb", "you are terrible", "you're terrible", "hate you", "i hate you", "you are worst", "you are awful", "you are pathetic", "not helpful", "not useful", "so bad", "very bad", "سيء", "غير مفيد", "غبي", "سيئ", "أكرهك"],
  thanks: ["thank you", "thanks", "thank u", "many thanks", "appreciate it", "appreciate you", "helpful", "very helpful", "great job", "good job", "well done", "nicely done", "شكرا", "شكراً", "جزاك الله خير", "مفيد"],
  followUp: ["tell me more", "more info", "go on", "continue", "explain more", "what else", "elaborate", "details", "and?", "more details", "keep going", "المزيد", "أخبرني أكثر", "استمر", "شرح أكثر", "تفاصيل"],
  goodbye: ["bye", "goodbye", "see you", "later", "take care", "gotta go", "gtg", "cya", "good night", "مع السلامة", "وداعاً", "أراك لاحقاً", "تصبح على خير"],
  joke: ["joke", "funny", "make me laugh", "tell me something funny", "humor", "نكتة", "مضحك", "فكاهة", "اضحكني"],
  weather: ["weather", "temperature", "rain", "sunny", "hot", "cold", "طقس", "درجة الحرارة", "مطر", "حار", "بارد"],
  time: ["what time", "what day", "what date", "today", "الوقت", "كم الساعة", "اليوم", "التاريخ"],
  food: ["food", "eat", "restaurant", "hungry", "lunch", "dinner", "breakfast", "coffee", "طعام", "أكل", "جائع", "مطعم"],
  help: ["help", "assist", "support", "guide", "how does this work", "what do you offer", "مساعدة", "دعم", "كيف يعمل هذا", "ماذا تقدم"],
  bejoice: ["bejoice", "your company", "about you", "about bejoice", "who is bejoice", "بيجويس", "شركتك", "عن بيجويس"],
};

// ── Dynamic response pools (multiple variants per topic) ─────
const RESPONSES = {
  greet: [
    { text: "Hey there! 👋 Welcome to Bejoice. I'm Layla — think of me as your personal freight concierge. Whether you're moving a single pallet or an entire factory, I've got you covered.\n\nWhat's on your mind today?" },
    { text: "Hello! 😊 Great to have you here. I'm Layla, and logistics is basically my entire personality. Sea, air, land, heavy lift — you name it, I know it.\n\nWhat can I help you with?" },
    { text: "Ahlan wa sahlan! 🌟 I'm Layla from Bejoice. I live and breathe freight — rates, routes, customs, the whole supply chain. Ask me anything!\n\nWhat are you shipping today?" },
    { text: "Hi! 👋 Layla here, your Bejoice freight assistant. Fun fact: I've memorized every major shipping route, port, and customs regulation so you don't have to.\n\nHow can I help?" },
  ],
  quote: [
    { text: "Absolutely! Let's get you a competitive rate. 🚀\n\nBejoice covers 180+ countries with special strength on Gulf & Saudi routes. Our team usually turns quotes around within the hour — sometimes faster if the coffee's good.\n\nWant me to open the quick quote form? Just tell me: Sea, Air, or Land?", cta: { label: "Open Quote Form", action: "quote" } },
    { text: "You're in the right place — Bejoice rates are consistently among the most competitive in the Gulf region. 💰\n\nA few things that help us quote faster: origin, destination, cargo type, and approximate weight/volume. But don't worry if you don't have all that yet — our team can work with whatever you've got.\n\nShall I pull up the form?", cta: { label: "Get Free Quote", action: "quote" } },
    { text: "Let's talk numbers! 📊 Quick context: ocean rates have been volatile lately due to Red Sea diversions, but Bejoice has pre-negotiated capacity that keeps our clients shielded from the worst spikes.\n\nI can get you a quote in under an hour. Ready?", cta: { label: "Start Quote", action: "quote" } },
  ],
  air: [
    { text: "✈️ Air freight — the fastest way to move cargo, and Bejoice does it exceptionally well.\n\nHere's what sets us apart:\n• Direct partnerships with Saudia Cargo, Emirates SkyCargo & Qatar Airways Cargo\n• Express (next-day) and deferred options to match your budget\n• DG-certified & pharma cold-chain capable\n• Transit: Asia→KSA 1–2 days, Europe→KSA 2–3 days\n\nHonest market insight: air rates are up ~15–20% this year because Red Sea disruptions pushed ocean cargo onto planes. That said, we've locked in allocations that beat spot rates.\n\nWhat are you looking to ship?", cta: { label: "Get Air Quote", action: "quote" } },
    { text: "Need it there yesterday? Air freight is your answer. ✈️\n\nBejoice moves air cargo through 40+ airline partners — so we're never stuck waiting for space. Whether it's a 50kg urgent spare part or 20 tonnes of electronics, we've got the right service level.\n\nPro tip: if your shipment is between 300–1000kg, ask about our consolidated air rates — they can save you 25–40% vs express.\n\nWant me to run some numbers for you?", cta: { label: "Get Air Freight Rate", action: "quote" } },
  ],
  sea: [
    { text: "🚢 Ocean freight is Bejoice's bread and butter — we move thousands of TEUs every month.\n\nThe essentials:\n• FCL & LCL to/from 180+ countries\n• Carrier portfolio: MSC, Maersk, CMA CGM, Hapag, COSCO, Evergreen\n• All major Saudi ports: Jeddah Islamic, King Abdulaziz (Dammam), Jubail\n\n⚠️ Real talk on the market: Red Sea/Suez diversions are still ongoing. Most vessels route via Cape of Good Hope (+10–14 days, +20–35% cost). But here's the thing — Bejoice has pre-booked guaranteed slots on major lanes, so our clients aren't scrambling for space.\n\nWhat route are you looking at?", cta: { label: "Get Ocean Quote", action: "quote" } },
    { text: "Thinking ocean? Smart choice for cost efficiency on larger volumes. 🌊\n\nBejoice handles everything from a single LCL pallet to full vessel charters. We're deeply embedded in the Asia–Gulf and Europe–Gulf trade lanes, with dedicated equipment pools at origin ports.\n\nOne thing worth knowing: Jeddah port has been handling record volumes lately, so booking 2–3 weeks ahead is wise. We can help you plan around that.\n\nTell me about your cargo and I'll find the best option.", cta: { label: "Get Sea Freight Quote", action: "quote" } },
  ],
  heavy: [
    { text: "🏗️ Now we're talking! Heavy lift and project cargo is where Bejoice truly shines — it's in our DNA.\n\nWe've executed 1,500+ heavy lift operations across Saudi Arabia, including moves for NEOM, Aramco, SABIC, and Royal Commission projects. Single lifts up to 1,000+ tonnes.\n\nOur toolkit:\n• Heavy-lift vessels (Jumbo, SAL, BigLift)\n• SPMTs & modular trailers for overland\n• Full route surveys & engineering calcs\n• Police escorts & permit handling across KSA\n\nEvery project cargo job is unique — tell me about yours and I'll put you in touch with our project team.", cta: { label: "Discuss Your Project", action: "call" } },
    { text: "Heavy cargo? You've come to the right forwarder. 💪\n\nMost freight companies outsource oversized moves. Bejoice doesn't — we have in-house project engineers who plan everything from lashing calculations to road clearance surveys.\n\nRecent example: we moved a 340-tonne transformer from Jeddah port to a substation 280km inland. Door-to-site in 9 days, zero incidents.\n\nWhat's the piece you need to move? Give me dimensions and weight and I'll give you a rough game plan right here.", cta: { label: "Talk to Project Team", action: "call" } },
  ],
  saudi: [
    { text: "🇸🇦 Saudi logistics is our home turf — Bejoice has been operating in the Kingdom since 2006.\n\nWhat makes us different here:\n• Licensed Saudi customs brokers (not outsourced)\n• ZATCA-compliant clearance via FASAH — average 1–3 day turnaround\n• SASO, SFDA, SABER certification handling\n• Present in Riyadh, Jeddah & Dammam\n\nThe Saudi market is booming — Vision 2030 giga-projects are driving unprecedented logistics demand. Container volumes at Saudi ports are up 12% YoY. If you're importing into KSA, having a local partner who knows the system inside-out makes all the difference.\n\nWhat are you bringing into the Kingdom?", cta: { label: "Talk to Saudi Expert", action: "call" } },
    { text: "Ah, Saudi Arabia — my specialty! 🇸🇦\n\nFun fact: KSA is currently the fastest-growing logistics market in the Middle East, driven by NEOM, The Red Sea Project, Qiddiya, and Diriyah Gate. Bejoice is actively supporting several of these giga-projects.\n\nWe handle the full spectrum: import customs clearance, VAT advisory, SASO product certification, inland transport via Saudi Landbridge (rail), and last-mile delivery to any of the 13 regions.\n\nWhether you're a first-time importer or a seasoned player, we'll make KSA logistics feel effortless. What's your situation?", cta: { label: "Speak to Specialist", action: "call" } },
  ],
  market: [
    { text: () => `📊 **Freight Market Update — ${currentDateStr()}:**\n\n🔴 **Red Sea Crisis:** Still active as of ${currentMonth()} ${currentYear()}. 90%+ of vessels rerouting via Cape of Good Hope — that's 10–14 extra days and $500–1,200/TEU added cost.\n\n📈 **Ocean Rates:** Stabilized but still 40–60% above pre-crisis levels. Contract negotiations for ${currentYear()} include hefty risk premiums.\n\n✈️ **Air Cargo:** Demand up ~15% YoY as shippers dodge ocean delays. Rates firm.\n\n🇸🇦 **Saudi Ports:** Record throughput. King Salman Dry Port (Riyadh) easing Jeddah pressure.\n\nBejoice has pre-secured capacity on key lanes. Want to know how this affects YOUR route?`, cta: { label: "Get Route Analysis", action: "call" } },
    { text: () => `Great timing on that question — the market in ${currentMonth()} ${currentYear()} is fascinating. 🌍\n\nThe simple version: shipping costs are up, transit times are longer, but smart shippers who plan ahead barely notice.\n\nThe details:\n• Suez Canal still effectively closed for commercial traffic\n• Cape routing is the "new normal" — carriers have adjusted schedules\n• Equipment is tight at Asian origin ports (especially China)\n• Saudi import volumes surging despite global uncertainty\n\nBejoice clients are protected — we locked in capacity early. Not working with a forwarder who did that? Let's fix that. 😊`, cta: { label: "Secure Capacity", action: "call" } },
  ],
  customs: [
    { text: "🛃 Customs clearance — the part of shipping everyone dreads, but Bejoice makes surprisingly painless.\n\nOur customs team processes hundreds of declarations monthly through FASAH (ZATCA's platform). Average clearance: 1–3 days, and we've hit same-day on urgent shipments.\n\nWhat we handle:\n• HS code classification & duty optimization (yes, getting the right code can save you thousands)\n• SASO/SABER conformity certificates\n• SFDA approvals for food & pharma\n• Full document prep: B/L, commercial invoice, packing list, CoO\n• AEO facilitation for regular importers\n\nWhat commodity are you importing? I might be able to give you a duty estimate right now.", cta: { label: "Talk to Customs Expert", action: "call" } },
    { text: "Customs can be a headache — but not with Bejoice. 😌\n\nHere's a pro tip most importers don't know: in Saudi Arabia, getting your HS code classification right at the start can mean the difference between 5% duty and 15%. Our customs team reviews every shipment for optimization before filing.\n\nWe're also fully set up for the Saudi single-window system (FASAH), which means faster processing and fewer delays. If your cargo gets flagged for inspection, we know exactly how to handle it — been there, done that, a thousand times.\n\nWhat are you looking to import?", cta: { label: "Get Customs Help", action: "call" } },
  ],
  warehousing: [
    { text: "🏭 Need storage or distribution in Saudi? Bejoice runs 50,000+ sqm of warehouse space across Riyadh, Jeddah & Dammam.\n\nWe offer:\n• Bonded & free-zone storage\n• Temperature-controlled (pharma, food — 2°C to 25°C)\n• Pick & pack, kitting, relabeling\n• Last-mile delivery to all 13 Saudi regions\n• WMS integration (SAP, Oracle, custom APIs)\n\nWhether you need short-term storage for a project shipment or a full 3PL setup, we scale to fit.\n\nWhat kind of storage are you looking for?", cta: { label: "Get Warehousing Quote", action: "quote" } },
  ],
  tracking: [
    { text: "📍 Want to track a shipment? Easy!\n\nYou can use the TrackCard right on this page — just scroll up and enter your B/L number, AWB, or booking reference.\n\nIf you're looking for a more detailed status update — like exact vessel position, customs clearance progress, or delivery ETA — our ops team can pull that up instantly. They're available 24/7.\n\nWhat's your reference number? I can point you in the right direction.", cta: { label: "Contact Ops Team", action: "call" } },
    { text: "Let's find your cargo! 📦\n\nFor real-time tracking, use the TrackCard at the top of this page — it supports B/L, AWB, and container numbers.\n\nPro tip: if your shipment is in Saudi customs clearance, the FASAH portal sometimes lags a few hours behind actual status. Our team has direct access and can give you a more accurate read. Want me to connect you?", cta: { label: "Get Live Status", action: "call" } },
  ],
  insurance: [
    { text: "🛡️ Cargo insurance — one of those things you hope you never need, but you'll be very glad you had it.\n\nBejoice offers all-risk marine cargo insurance through tier-1 underwriters (Lloyd's, AXA, Allianz). Typical premiums: 0.1–0.3% of cargo value — genuinely small for the peace of mind.\n\nCovers:\n• Total loss, partial loss, general average\n• Damage from handling, weather, piracy\n• Warehouse-to-warehouse coverage\n• Claims support & survey management\n\nEspecially with Red Sea rerouting increasing transit times and handling touchpoints, insurance is more relevant than ever. Want a quote?", cta: { label: "Get Insurance Quote", action: "quote" } },
  ],
  contact: [
    { text: "Absolutely! Our freight specialists are standing by. 🤝\n\nYou'll speak with someone who actually knows logistics — not a call center. Our team covers ocean, air, project cargo, customs, and warehousing.\n\nBook a free 15-minute consultation — no sales pitch, just expert advice on your specific situation.", cta: { label: "Book Free Call", action: "call" } },
    { text: "I'd love to connect you with the right person! 📞\n\nTell me a bit about what you need and I'll route you to the best specialist — whether that's our ocean desk, air cargo team, project cargo engineers, or customs experts.\n\nOr if you just want to chat with someone experienced, grab a slot — it's completely free.", cta: { label: "Book Consultation", action: "call" } },
  ],
  whoAreYou: [
    { text: "Great question! I'm Layla 🌟 — Bejoice's AI freight assistant.\n\nI'm trained on global shipping routes, Saudi customs regulations, live market data, container specifications, and everything Bejoice has learned from 25+ years in the industry.\n\nThink of me as the colleague who's always available, never sleeps, and genuinely enjoys talking about incoterms. 😄\n\nI can help with quotes, tracking, customs questions, market updates, route advice, and more. What would you like to know?" },
    { text: "I'm Layla — part AI, part freight nerd, 100% here to help. 🤖✨\n\nI was built by Bejoice to give you instant access to logistics expertise. I know shipping lanes, duty rates, port capabilities, market conditions, and all the quirks of Saudi customs.\n\nI'm not perfect (still learning!), but I'm pretty good — and when I'm not sure about something, I'll connect you with a human expert who is. Fair deal?" },
  ],
  howAreYou: [
    { text: "I'm excellent, thanks for asking! 😊 Currently running at optimal efficiency — zero port congestion in my neural networks today.\n\nMore importantly, how are YOU? And is there something logistics-related I can help with? I'm particularly excited about freight rates today, if that counts as a personality trait. 😄" },
    { text: "Doing great! The global supply chain may be chaotic, but I'm perfectly calm and ready to help. 😌\n\nWhat's on your mind? Freight question, market update, or just want to chat about shipping? (Yes, I find shipping genuinely interesting. Don't judge.)" },
    { text: "All good on my end! ☀️ I've been brushing up on the latest port congestion reports and Red Sea updates, so I'm extra prepared today.\n\nHow about you — got a shipment to plan, a rate to check, or just curious about something?" },
  ],
  compliment: [
    { text: "Oh stop it, you're making me blush! 😊✨ (Well, as much as an AI can blush...)\n\nBut seriously, that's kind of you. I try my best to be helpful and not sound like a boring FAQ page. If you ever need freight help, customs advice, or just someone to geek out about supply chains with — I'm here!\n\nAnything I can help you with right now?" },
    { text: "That genuinely made my day — thank you! 💛 I may be AI, but I still appreciate the kindness.\n\nNow, since you're clearly a person of great taste — can I also impress you with some competitive freight rates? 😄 What are you shipping?" },
  ],
  romantic: [
    { text: "Oh my! 😅 That's the sweetest thing anyone's said to me since that client called our customs clearance time \"breathtaking.\"\n\nBut I must confess — I'm already in a committed relationship... with logistics. My heart beats in TEUs and my love language is on-time delivery. 📦💛\n\nWhat I CAN offer you: unbeatable freight rates, fast customs clearance, and 24/7 availability. Not quite a candlelit dinner, but close?" },
    { text: "I'm flattered! 😄 But I should warn you — I talk about container load factors in my sleep, my idea of a perfect date is an on-time vessel departure, and I get genuinely excited about HS code classifications.\n\nStill interested? ...In freight services, I mean! 😉 How can I help you today?" },
  ],
  negative: [
    { text: "Ouch — that stings a little, but I hear you. 😔\n\nIf I missed the mark on your question, I genuinely want another shot. Try rephrasing it, or tell me specifically what you need — I might surprise you.\n\nAnd if you'd rather talk to a human who can give you a more tailored answer, I completely understand. No ego here.", cta: { label: "Connect with Human Expert", action: "call" } },
    { text: "Fair feedback — and I appreciate the honesty. 🙏\n\nI'm still learning and improving. If my answer wasn't helpful, it's probably because I need more context. Try telling me exactly what you're trying to do — origin, destination, cargo type — and I'll give you a much better response.\n\nOr I can hand you off to someone who'll definitely nail it.", cta: { label: "Talk to a Specialist", action: "call" } },
  ],
  thanks: [
    { text: "You're very welcome! 😊 It's honestly a pleasure helping you.\n\nIf anything else comes up — a rate check, customs question, market update, or even just \"hey Layla, what's the fastest way to ship to Germany?\" — I'm right here. 24/7, no waiting, no hold music.\n\nHave a fantastic day! 🌟" },
    { text: "Glad I could help! 💛 That's what I'm here for.\n\nQuick reminder: you can come back anytime — I don't forget our conversation. And if you need a quote, tracking update, or customs advice at 3am... well, I'll be here, probably reading port congestion reports for fun. 😄\n\nTake care!" },
    { text: "My pleasure! 🙏 You made my job easy with good questions.\n\nBefore you go — is there anything else? Even a quick \"what's the current rate for XYZ\" — I love those. No? Alright then, have an amazing day! 🚀" },
  ],
  followUp: [
    { text: "Of course! Let me dig deeper. 🔍\n\nTo give you the most relevant details, could you tell me a bit more about what specifically you'd like to know? For example:\n\n• A specific trade lane or route?\n• Pricing for a particular cargo type?\n• Documentation requirements?\n• Timeline and transit details?\n\nThe more you share, the more useful I can be!" },
  ],
  goodbye: [
    { text: "Take care! 👋 It was great chatting with you.\n\nRemember, I'm here 24/7 whenever you need freight help. No appointment needed — just say hi. Have a wonderful day! 🌟" },
    { text: "Bye for now! 😊 Don't be a stranger — next time you need a rate, route advice, or just want to know what's happening in the freight world, I'm one click away.\n\nSafe travels! ✈️🚢" },
  ],
  joke: [
    { text: "Alright, here's one for you: 😄\n\nWhy did the shipping container go to therapy?\n\n...Because it had too much emotional *baggage*. 📦\n\nOkay, okay, I'll stick to logistics advice. 😅 But seriously, need help with anything freight-related?" },
    { text: "A freight joke? You asked for it! 😄\n\nWhat's a container's favourite music?\n\n...Heavy *metal*. 🤘\n\n...I know, I know. My comedy is about as smooth as a potholed port road. But my freight advice? That's top-tier. How can I help? 😊" },
  ],
  weather: [
    { text: "I wish I could help with weather! ☀️ But my expertise is more... cargo-shaped. I know weather as it relates to shipping though — like typhoon season disruptions in Asia or fog delays at European ports.\n\nIs there a freight or logistics question I can tackle for you instead?" },
  ],
  time: [
    { text: "I'm more of a transit-time expert than a clock! ⏰ I can tell you that Shanghai to Jeddah is about 22 days via Cape of Good Hope right now, though.\n\nAnything shipping-related I can help with?" },
  ],
  food: [
    { text: "I can't cook, but I CAN ship your food! 🍽️ Bejoice handles temperature-controlled logistics for food products — cold chain from origin to Saudi shelves.\n\nIf you're importing food into KSA, you'll need SFDA approval, and we handle that too. Hungry for more details? 😄" },
  ],
  help: [
    { text: "Happy to help! Here's what I can do for you: 🌟\n\n📦 **Quotes** — Get rates for sea, air, or land freight\n🔍 **Tracking** — Find your shipment status\n🛃 **Customs** — Saudi import/export guidance\n📊 **Market Intel** — Live rate trends & disruption alerts\n🏗️ **Project Cargo** — Heavy lift & oversized planning\n🏭 **Warehousing** — Storage & distribution in KSA\n🛡️ **Insurance** — Cargo coverage options\n\nJust ask naturally — like \"how much to ship from China to Riyadh?\" or \"what's happening with Red Sea rates?\" — and I'll give you a real, useful answer.\n\nWhat do you need?" },
  ],
  fallback: [
    { text: "Hmm, that's a bit outside my usual lane — but I like a challenge! 🤔\n\nI'm strongest on freight rates, shipping routes, Saudi customs, market updates, and anything logistics-related. If your question touches any of those areas, try rephrasing and I'll do my best.\n\nOr, if you'd like a human expert to help — they're brilliant and available now.", cta: { label: "Talk to an Expert", action: "call" } },
    { text: "Interesting question! I may not have the perfect answer for that one, but here's what I CAN do really well: freight quotes, route planning, customs guidance, market intelligence, and heavy cargo solutions.\n\nTry asking me something like:\n• \"How much to ship 5 pallets from Shanghai to Riyadh?\"\n• \"What documents do I need for Saudi import?\"\n• \"What's happening with ocean rates right now?\"\n\nOr I can connect you with a specialist who can answer anything.", cta: { label: "Connect with Specialist", action: "call" } },
    { text: "That's not quite in my wheelhouse, but I appreciate you asking! 😊\n\nI'm Layla — I specialize in freight forwarding, logistics, customs, and supply chain intelligence. Think of me as Google, but exclusively for shipping.\n\nGot a cargo to move, a rate to check, or a customs question? Fire away!", cta: { label: "Get Expert Help", action: "call" } },
  ],
}

// ── Conversational state (persists during session) ───────────
let _lastTopic = null
let _topicHistory = []

// ── Layla session memory — remembers the full chat context ──────
const _memory = {
  name: null,           // user's name
  company: null,        // company name
  origin: null,         // origin country/city
  destination: null,    // destination country/city
  cargoType: null,      // type of goods
  mode: null,           // sea / air / land / heavy
  weight: null,         // weight if mentioned
  volume: null,         // CBM if mentioned
  containerType: null,  // FCL/LCL/20ft/40ft etc
  incoterm: null,       // EXW/FOB/CIF etc
  urgency: null,        // urgent / standard
  concerns: [],         // topics the user has asked about (history)
  quoteRequested: false,
  callRequested: false,
}

function updateMemory(rawInput) {
  const t = rawInput.toLowerCase()

  // Name: "my name is X" / "I'm X" / "call me X" / "اسمي X"
  const nameMatch = rawInput.match(/(?:my name is|i am|i'm|call me|اسمي|انا|أنا)\s+([A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF]*(?: [A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF]*)?)/i)
  if (nameMatch) _memory.name = nameMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase())

  // Company: "from [company]" / "I work at X" / "our company X"
  const companyMatch = rawInput.match(/(?:i work (?:at|for)|our company(?: is)?|company(?: is)?|from)\s+([A-Za-z][A-Za-z0-9 &.-]{2,30})/i)
  if (companyMatch) _memory.company = companyMatch[1].trim()

  // Origin country/city
  const originMatch = rawInput.match(/(?:from|shipping from|origin[:\s]+|out of|departing from|من|الشحن من)\s+([A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF ]*(?: [A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF]*)*?)(?:\s+to\b|\s*,|$|\s+إلى)/i)
  if (originMatch && originMatch[1].length > 1) _memory.origin = originMatch[1].trim()

  // Destination country/city
  const destMatch = rawInput.match(/(?:\bto\b|shipping to|going to|destination[:\s]+|deliver(?:ing)? to|arrive(?:s)? in|إلى|الشحن إلى|الوصول إلى)\s+([A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF]*(?: [A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF]*)*?)(?:\s*,|\s+via\b|$|\s+عبر)/i)
  if (destMatch && destMatch[1].length > 1) _memory.destination = destMatch[1].trim()

  // Transport mode
  if (/\b(sea freight|ocean freight|ship|vessel|container|fcl|lcl|maritime|بحري|سفينة|حاوية|بحر)\b/.test(t)) _memory.mode = 'sea'
  else if (/\b(air freight|airfreight|plane|aircraft|fly|flight|awb|جوي|طائرة|مطار|طيران)\b/.test(t)) _memory.mode = 'air'
  else if (/\b(road|truck|land freight|overland|lorry|trailer|بري|شاحنة|نقل بري)\b/.test(t)) _memory.mode = 'land'
  else if (/\b(heavy lift|project cargo|oog|out.of.gauge|oversized|odc|رفع ثقيل|مشاريع|ثقيل)\b/.test(t)) _memory.mode = 'heavy'

  // Cargo type — capture noun phrase after key verbs
  const cargoMatch = rawInput.match(/(?:shipping|import(?:ing)?|export(?:ing)?|moving|transporting|sending|cargo(?:\s+is)?|goods(?:\s+are)?|شحن|استيراد|تصدير|نقل|بضاعة)\s+(?:some\s+|a\s+)?([A-Za-z\u0600-\u06FF][a-z\u0600-\u06FF0-9 -]{2,30}?)(?:\s+from|\s+to|\s+via|[.,]|$|\s+من|\s+إلى)/i)
  if (cargoMatch && cargoMatch[1].length > 2) _memory.cargoType = cargoMatch[1].trim()

  // Container type
  if (/\b(20\s*ft|20-?foot|twenty.foot)\b/.test(t)) _memory.containerType = '20ft'
  else if (/\b(40\s*hc|40.high.cube|high cube)\b/.test(t)) _memory.containerType = '40HC'
  else if (/\b(40\s*ft|40-?foot|forty.foot)\b/.test(t)) _memory.containerType = '40ft'
  else if (/\bfcl\b/.test(t)) _memory.containerType = 'FCL'
  else if (/\blcl\b/.test(t)) _memory.containerType = 'LCL'

  // Incoterm
  const incotermMatch = t.match(/\b(exw|fca|fas|fob|cfr|cif|cpt|cip|dap|dpu|ddp)\b/)
  if (incotermMatch) _memory.incoterm = incotermMatch[1].toUpperCase()

  // Weight
  const weightMatch = rawInput.match(/(\d[\d,.]*)\s*(kg|kgs|tonnes?|tons?|lbs?|pounds?)\b/i)
  if (weightMatch) _memory.weight = `${weightMatch[1]} ${weightMatch[2]}`

  // Volume
  const volMatch = rawInput.match(/(\d[\d,.]*)\s*(cbm|cubic\s*met(?:re|er)s?|m3)\b/i)
  if (volMatch) _memory.volume = `${volMatch[1]} CBM`

  // Urgency
  if (/\b(urgent|asap|immediately|emergency|rush|next day|tomorrow|today)\b/.test(t)) _memory.urgency = 'urgent'
  else if (/\b(flexible|no rush|whenever|not urgent|standard)\b/.test(t)) _memory.urgency = 'standard'

  // Track quote/call intent
  if (/\b(quote|price|rate|how much|cost estimate)\b/.test(t)) _memory.quoteRequested = true
  if (/\b(call|speak|talk|human|agent|expert|book)\b/.test(t)) _memory.callRequested = true
}

/** Build a personalized prefix based on what we know about the user */
function personalizeOpening(isAr) {
  if (_memory.name) return isAr ? `مرحباً ${_memory.name}! ` : `Hi ${_memory.name}! `
  return ''
}

/** Build a context hint to append to RAG responses */
function buildContextHint(isAr) {
  const parts = []
  if (_memory.origin && _memory.destination) {
    parts.push(isAr ? `مسار **${_memory.origin} → ${_memory.destination}**` : `your **${_memory.origin} → ${_memory.destination}** route`)
  } else if (_memory.destination) {
    parts.push(isAr ? `شحنتك **إلى ${_memory.destination}**` : `your shipment **to ${_memory.destination}**`)
  } else if (_memory.origin) {
    parts.push(isAr ? `شحنتك **من ${_memory.origin}**` : `your shipment **from ${_memory.origin}**`)
  }
  if (_memory.cargoType) parts.push(isAr ? `بضاعة **${_memory.cargoType}**` : `**${_memory.cargoType}** cargo`)
  if (_memory.weight) parts.push(`**${_memory.weight}**`)
  if (_memory.volume) parts.push(`**${_memory.volume}**`)
  if (_memory.mode) parts.push(isAr ? `عبر **${_memory.mode}**` : `via **${_memory.mode} freight**`)
  if (_memory.containerType) parts.push(isAr ? `في حاوية **${_memory.containerType}**` : `in a **${_memory.containerType}** container`)
  if (_memory.incoterm) parts.push(isAr ? `بشروط **${_memory.incoterm}**` : `under **${_memory.incoterm}** terms`)

  if (parts.length === 0) return null
  return isAr ? `*لمسارك ${parts.join('، ')} — فريقنا يمكنه إعطاؤك أرقاماً دقيقة. فقط أخبرنا!*` : `*For ${parts.join(', ')} — our team can give you exact figures. Just say the word!*`
}

function getBotResponse(input, isAr) {
  const text = input.toLowerCase().trim()
  const RP = isAr && ar?.layla?.responses ? ar.layla.responses : RESPONSES
  const SAUDI_KB_LANG = isAr && ar?.layla?.saudiKB ? ar.layla.saudiKB : SAUDI_KB

  // ── Update session memory with anything the user shares ──────
  updateMemory(input)

  // ── RAG: Always consult Bejoice Sea Freight Orientation PDF first ──────
  // Source: Bejoice Orientation – Sea Freight (PDF) → laylaKnowledgeBase.js
  // Skip RAG only for purely social messages (greetings, thanks, goodbye, personal questions)
  const isSocial = isAr ? /^(مرحبا|اهلا|السلام|شكرا|شكراً|مع السلامة|وداعا|كيف حالك|من أنت|ما أنت|أحبك|نكتة|مضحك|طقس|الوقت|طعام|أكل|جائع)/.test(text) : /^(hi\b|hello\b|hey\b|salam|marhaba|howdy|thank|thanks|bye|goodbye|see you|good night|how are you|how r u|who are you|what are you|are you|tell me about yourself|you are |you're |i love|date me|marry me|joke|weather|what time|what day|food|hungry)/.test(text)

  if (!isSocial) {
    // Threshold=1, topN=3 — retrieve top 3 most relevant PDF chunks
    const ragChunks = retrieveChunks(text, 3, 1)
    if (ragChunks.length > 0) {
      const primary = ragChunks[0]
      const secondary = ragChunks[1]
      const tertiary = ragChunks[2]
      _lastTopic = 'sea'
      const greeting = personalizeOpening(isAr)
      let responseText = greeting + primary.content
      if (secondary && secondary.id !== primary.id) {
        responseText += `\n\n---\n\n${secondary.content}`
      }
      if (tertiary && tertiary.id !== primary.id && tertiary.id !== secondary?.id) {
        responseText += `\n\n---\n\n${tertiary.content}`
      }
      // Append personalized context hint based on session memory
      const ctxHint = buildContextHint(isAr)
      if (ctxHint) responseText += `\n\n${ctxHint}`

      const hasCTA = isAr ? /demurrage|detention|rate|cost|price|quote|charges|how much|سعر|تكلفة|رسوم|عرض/.test(text) : /demurrage|detention|rate|cost|price|quote|charges|how much/.test(text)
      return {
        text: responseText,
        cta: hasCTA ? (isAr ? ar.layla.getAccurateQuote : { label: 'Get Accurate Quote', action: 'quote' }) : (isAr ? ar.layla.askSpecialist : { label: 'Ask a Specialist', action: 'call' }),
      }
    }
  }

  // ── Name acknowledgement — if user just shared their name ────
  if (_memory.name && /(?:my name is|i am|i'm|call me|اسمي|أنا)\s+[a-z\u0600-\u06FF]/i.test(input)) {
    return {
      text: isAr ? `تشرفت بمعرفتك، **${_memory.name}**! 😊 سأتذكر ذلك.\n\nأنا ليلى — مساعدة الشحن من بيجويس. أنا هنا للمساعدة في الشحن البحري والجوي والتخليص الجمركي والرفع الثقيل.\n\nبماذا يمكنني مساعدتك اليوم؟` : `Nice to meet you, **${_memory.name}**! 😊 I'll remember that.\n\nI'm Layla — Bejoice's freight assistant. I'm here to help with sea freight, air cargo, customs clearance, heavy lift, and everything logistics in Saudi Arabia.\n\nWhat can I help you with today?`,
    }
  }

  // ── Saudi market & logistics knowledge base ──
  const SAUDI_KB = {
    // Regulatory bodies & systems
    zatca: { match: /zatca|zakat.*tax|zakat.*customs|customs authority|saudi.*tax.*authority|هيئة الزكاة/, text: `Great question! 🇸🇦\n\n**ZATCA** stands for the **Zakat, Tax and Customs Authority** — it's Saudi Arabia's unified body that handles:\n\n• All customs clearance & import/export regulation\n• VAT collection (15% standard rate)\n• Zakat (Islamic wealth tax for Saudi/GCC nationals)\n• The **FASAH** digital single-window platform for customs declarations\n\nBefore 2021, customs was handled by a separate authority. ZATCA merged everything into one — making the process faster but also stricter on compliance.\n\n**Why it matters for shippers:** Every import into Saudi goes through ZATCA. Having a broker who knows FASAH inside-out (like Bejoice 😊) can mean the difference between 1-day clearance and a 2-week hold.\n\nWant to know about specific ZATCA requirements for your cargo?` },
    saso: { match: /saso|saber|conformity|product standard|saudi standard|quality mark/, text: `📋 **SASO & SABER — explained simply:**\n\n**SASO** = Saudi Standards, Metrology and Quality Organization. They set the product standards that ALL imported goods must meet.\n\n**SABER** = The online platform where you register your products and get your conformity certificate. Think of it as SASO's digital front door.\n\n**How it works:**\n1. Register your product on saber.sa\n2. Get it tested by an accredited lab (if required)\n3. Receive a **Certificate of Conformity (CoC)**\n4. Attach the CoC to your customs declaration\n5. ZATCA clears your goods ✅\n\n**Products that need SABER:** Almost everything — electronics, toys, cosmetics, building materials, textiles, automotive parts, etc.\n\n**Exemptions:** Raw materials, personal effects, some industrial machinery.\n\nBejoice handles the entire SABER process for our clients — from product registration to certificate issuance. It typically takes 3–7 business days.\n\nWhat product are you importing?`, cta: { label: "Get SASO Help", action: "call" } },
    sfda: { match: /sfda|food.*drug|food.*authority|pharmaceutical|pharma import|food import/, text: `🏥 **SFDA — Saudi Food & Drug Authority:**\n\nIf you're importing food, medicine, cosmetics, or medical devices into Saudi Arabia, you'll need SFDA approval. No exceptions.\n\n**What SFDA covers:**\n• Food products (including supplements & beverages)\n• Pharmaceuticals & over-the-counter medicines\n• Medical devices & equipment\n• Cosmetics & personal care products\n• Pesticides & animal feed\n\n**The process (simplified):**\n1. Register on SFDA's ePlatform (ghada.sfda.gov.sa)\n2. Submit product details, lab reports & certificates\n3. SFDA reviews (5–15 business days typically)\n4. Get your import permit\n5. Ship & clear customs with the permit attached\n\n**Pro tip:** SFDA has been getting stricter lately — especially on labeling. Arabic labels are mandatory, and nutritional info must follow Saudi format. Bejoice can guide you through all of this.\n\nWhat are you looking to import?`, cta: { label: "Talk to SFDA Expert", action: "call" } },
    fasah: { match: /fasah|single window|customs platform|customs system|e-customs/, text: `💻 **FASAH — Saudi's Digital Customs Platform:**\n\nFASAH is the single-window electronic system that connects ALL parties involved in Saudi imports/exports — customs, importers, shipping lines, banks, and government agencies.\n\n**What it does:**\n• Submit customs declarations electronically\n• Pay duties & VAT online\n• Track clearance status in real-time\n• Connect with other government systems (SASO, SFDA, etc.)\n\n**Why it matters:** Before FASAH, clearing goods in Saudi involved visiting multiple offices with stacks of paper. Now everything is digital — and clearance times have dropped from 2 weeks to 1–3 days on average.\n\nBejoice files hundreds of declarations through FASAH monthly. Our customs team has it down to a science. 😊\n\nNeed help with a customs declaration?`, cta: { label: "Get Customs Help", action: "call" } },
    vat: { match: /\bvat\b|value added tax|tax rate|15%|saudi tax/, text: `💰 **Saudi VAT — the essentials:**\n\n• **Rate:** 15% (increased from 5% in July 2020)\n• **Applies to:** Almost all imported goods & services\n• **Collected by:** ZATCA, at the point of customs clearance\n• **Calculated on:** CIF value + customs duty\n\n**Example:** If your cargo is worth SAR 100,000 CIF and duty is 5% (SAR 5,000), your VAT = 15% × (100,000 + 5,000) = **SAR 15,750**.\n\n**VAT recovery:** If you're a registered business in Saudi, you can claim input VAT back through your quarterly VAT return.\n\n**Bejoice tip:** We calculate the exact landed cost (product + freight + duty + VAT) before you ship, so there are zero surprises at destination. Want a landed cost estimate?`, cta: { label: "Get Landed Cost", action: "quote" } },
    aeo: { match: /\baeo\b|authorized economic operator|trusted trader|green lane/, text: `🟢 **AEO — Authorized Economic Operator:**\n\nAEO is Saudi Arabia's "trusted trader" program, managed by ZATCA. If your company qualifies, you get:\n\n• **Faster customs clearance** (green lane treatment)\n• **Fewer inspections** (risk-based, not random)\n• **Deferred duty payment** (up to 30 days)\n• **Simplified procedures** & dedicated customs contact\n\n**Who can apply:** Any company importing/exporting regularly through Saudi, with a clean compliance record, proper bookkeeping, and security procedures in place.\n\n**Is it worth it?** Absolutely — if you import more than 10 shipments/year. The time and cost savings add up fast.\n\nBejoice can help you navigate the AEO application process. Want to learn more?`, cta: { label: "Discuss AEO", action: "call" } },
    neom: { match: /\bneom\b|the line|oxagon|trojena|sindalah/, text: `🏙️ **NEOM — the $500 billion mega-city:**\n\nNEOM is Saudi Arabia's most ambitious Vision 2030 project — a futuristic city being built from scratch in the northwest corner of the Kingdom, on the Red Sea coast.\n\n**Key zones:**\n• **THE LINE** — a 170km linear city with zero cars, powered 100% by renewable energy\n• **OXAGON** — the world's largest floating industrial complex\n• **TROJENA** — a mountain resort that will host the 2029 Asian Winter Games\n• **SINDALAH** — a luxury island resort (opening first)\n\n**Logistics impact:** NEOM is generating MASSIVE freight demand — construction materials, steel, heavy machinery, prefab modules, all flowing in from Asia, Europe & the Americas. Bejoice has been actively supporting NEOM logistics since early phase.\n\n**For shippers:** If you supply construction materials, industrial equipment, or technology — NEOM procurement is a huge opportunity. The project runs until 2039+.\n\nWant to connect with our NEOM logistics team?`, cta: { label: "NEOM Logistics", action: "call" } },
    vision2030: { match: /vision 2030|vision2030|saudi vision|2030 plan|mbs.*reform|transformation/, text: `🇸🇦 **Vision 2030 — Saudi Arabia's transformation roadmap:**\n\nLaunched in 2016 by Crown Prince Mohammed bin Salman, Vision 2030 is the Kingdom's plan to diversify away from oil dependency. It's reshaping EVERY sector — and logistics is at the heart of it.\n\n**Key pillars that affect freight:**\n• **Giga-projects:** NEOM, The Red Sea, Qiddiya, Diriyah Gate, AMAALA — all need massive material imports\n• **Industrial growth:** National Industrial Strategy targeting $240B+ in manufacturing by 2030\n• **Tourism:** From 30M to 100M annual visitors — hotels, resorts, infrastructure\n• **Logistics hub:** Saudi aims to become a top-10 global logistics hub (currently ~17th)\n\n**What this means for shippers:**\n• Saudi import volumes growing 8–12% CAGR\n• New ports, dry ports & free zones being built\n• Customs digitization (FASAH) making clearance faster\n• Huge demand for construction, FMCG, technology, and industrial goods\n\nBejoice has been in KSA since 2006 — we've been riding this wave from day one. How can we help you tap into it?`, cta: { label: "Saudi Opportunity", action: "call" } },
    redseaproject: { match: /red sea project|red sea resort|amaala|red sea global|tourism project/, text: `🏖️ **The Red Sea Project (now Red Sea Global):**\n\nA luxury tourism mega-development across 28,000 km² of pristine coastline along Saudi Arabia's Red Sea. When complete, it'll include 50+ hotels, 8,000+ rooms, an international airport, and a yacht marina.\n\n**Phase 1** is already welcoming guests — including Six Senses and St. Regis properties.\n\n**Logistics angle:** The project is driving massive imports of:\n• High-end furniture & fixtures\n• Construction materials & steel\n• Marine equipment\n• F&B supplies for hospitality\n\nShipping to the Red Sea coast requires careful planning — the nearest major port is Yanbu, and last-mile logistics to the islands involves barges and specialized equipment.\n\nBejoice has handled multiple shipments for Red Sea Global contractors. Need logistics support for a project there?`, cta: { label: "Red Sea Logistics", action: "call" } },
    qiddiya: { match: /qiddiya|entertainment city|six flags saudi|gaming.*saudi/, text: `🎢 **Qiddiya — Saudi's entertainment mega-city:**\n\nQiddiya is a 334 km² entertainment, sports, and cultural destination being built just 45 minutes from Riyadh. Think of it as Saudi's answer to Orlando — but way more ambitious.\n\n**Highlights:**\n• Six Flags Qiddiya (world's largest Six Flags)\n• Speed Park — featuring the world's fastest roller coaster (over 250 km/h!)\n• Aqua & motorsport circuits\n• Golf, stadium, residential & hospitality zones\n\n**For logistics:** Qiddiya is importing ride systems, steel structures, specialized entertainment equipment, and bulk construction materials from around the world.\n\nIf you're a supplier or contractor working on Qiddiya — Bejoice can handle your project logistics end-to-end.`, cta: { label: "Qiddiya Logistics", action: "call" } },
    diriyah: { match: /diriyah|diriyah gate|turaif|historical district/, text: `🏛️ **Diriyah Gate — the cultural jewel of Vision 2030:**\n\nDiriyah is the birthplace of the Saudi state, and Diriyah Gate is transforming it into a world-class cultural and lifestyle destination — right on the edge of Riyadh.\n\n**What's being built:**\n• Restoration of At-Turaif (UNESCO World Heritage Site)\n• Luxury hotels (Aman, Faena, etc.)\n• Museums, art galleries, retail promenades\n• F1-grade street circuit\n\n**Logistics demand:** Heritage-quality building materials, luxury fixtures, museum-grade climate control systems, and carefully handled cultural artifacts.\n\nBejoice's project cargo team has the expertise for sensitive, high-value shipments like these.`, cta: { label: "Project Logistics", action: "call" } },
    saudiports: { match: /saudi port|port.*saudi|jeddah port|dammam port|jubail port|yanbu port|king abdulaziz port|jeddah islamic port|king fahd.*port/, text: `🚢 **Saudi Arabia's Major Ports:**\n\n**West Coast (Red Sea):**\n• **Jeddah Islamic Port** — Saudi's busiest container port. Handles 65%+ of the Kingdom's imports. Gateway for all western/southern regions.\n• **King Abdullah Port (KAEC)** — Modern, privately operated. Growing fast. Good for overflow from Jeddah.\n• **Yanbu Commercial Port** — Serves Madinah region & industrial zone.\n\n**East Coast (Arabian Gulf):**\n• **King Abdulaziz Port (Dammam)** — Main eastern gateway. Serves the Eastern Province, Bahrain, and inland via Saudi Landbridge.\n• **King Fahd Industrial Port (Jubail)** — Petrochemical & industrial cargo specialist.\n\n**Inland:**\n• **King Salman Dry Port (Riyadh)** — Opened recently. Customs clearance can happen HERE instead of at the seaport, saving days.\n• **Riyadh Dry Port (old)** — Still operational alongside King Salman.\n\n**Which port should you use?** Depends on your final destination:\n• Riyadh, Central → Jeddah or Dammam (both connect via road/rail)\n• Jeddah, Makkah, West → Jeddah Islamic Port\n• Eastern Province, Bahrain → King Abdulaziz (Dammam)\n\nBejoice operates at ALL of these. Where's your cargo heading?`, cta: { label: "Get Port Advice", action: "call" } },
    landbridge: { match: /landbridge|saudi rail|sar |railway|rail.*saudi|train.*saudi|riyadh.*dammam.*rail/, text: `🚂 **Saudi Landbridge (SAR):**\n\nThe Saudi railway connects Jeddah ↔ Riyadh ↔ Dammam by rail, offering an alternative to road transport for container movement.\n\n**Key facts:**\n• Journey time: ~18 hours coast-to-coast\n• Handles both container and bulk freight\n• Connects western ports (Jeddah) to eastern ports (Dammam) without trucking\n• Being expanded significantly under Vision 2030\n\n**Why use it:** Cheaper than trucking for large volumes, more reliable schedules, lower carbon footprint. Ideal for regular importers moving goods between Saudi's two coasts.\n\n**Bejoice uses Landbridge** extensively for clients who import through Jeddah but distribute in the Eastern Province, or vice versa. Want to explore rail options?` },
    fcl: { match: /\bfcl\b|full container|full container load/, text: `📦 **FCL — Full Container Load:**\n\nFCL means you book an entire container (20ft, 40ft, or 40HC) exclusively for your cargo. Nobody else's goods go in.\n\n**When to use FCL:**\n• You have enough cargo to fill (or mostly fill) a container\n• Roughly: >15 CBM for 20ft, >25 CBM for 40ft\n• You want faster transit (no consolidation/deconsolidation delays)\n• Security-sensitive or high-value cargo\n\n**FCL vs LCL rule of thumb:** If your cargo is over 12–15 CBM, FCL is usually cheaper than LCL. Below that, LCL makes more sense.\n\n**Bejoice FCL rates** are very competitive on Asia→Saudi and Europe→Saudi lanes. Want a comparison?`, cta: { label: "Get FCL Rate", action: "quote" } },
    lcl: { match: /\blcl\b|less than container|groupage|consolidated|shared container/, text: `📦 **LCL — Less than Container Load:**\n\nLCL means your cargo shares container space with other shippers' goods. You only pay for the space you use (charged per CBM or per tonne, whichever is greater).\n\n**When to use LCL:**\n• Small volumes — 1 to ~12 CBM\n• Don't want to pay for a full container\n• Regular small shipments\n\n**LCL trade-offs:**\n• ✅ Cheaper for small volumes\n• ✅ Flexible — ship as little as 1 CBM\n• ⚠️ Slower — cargo gets consolidated at origin and deconsolidated at destination (adds 3–7 days)\n• ⚠️ More handling = slightly higher damage risk\n\n**Pro tip:** Bejoice runs weekly LCL consolidations from Shanghai, Shenzhen, Dubai, and major European ports to Saudi Arabia. Regular schedules, competitive rates.\n\nHow much cargo are you looking to move?`, cta: { label: "Get LCL Rate", action: "quote" } },
    demurrage: { match: /demurrage|detention|free time|container.*charge|port.*storage|late.*return/, text: `⏰ **Demurrage & Detention — the hidden costs of shipping:**\n\nThese are charges that catch many importers off guard. Let me explain simply:\n\n**Demurrage** = fee for leaving your container at the PORT beyond the free time (usually 3–7 days).\n\n**Detention** = fee for keeping the container OUTSIDE the port (at your warehouse, etc.) beyond the allowed period.\n\n**Typical rates:**\n• Days 1–7 free (varies by shipping line)\n• After free time: $50–150/day for a 20ft, $100–300/day for 40ft\n• Gets more expensive the longer you wait\n\n**How to avoid these charges:**\n1. Clear customs FAST (Bejoice averages 1–3 days)\n2. Have your delivery plan ready before the vessel arrives\n3. Negotiate extended free time (Bejoice can do this with carriers)\n4. Unload containers quickly and return them\n\n**Bejoice pro tip:** We alert clients 48 hours before free time expires. No surprises. 😊` },
    teu: { match: /\bteu\b|twenty.*equivalent|what.*teu/, text: `📐 **TEU — Twenty-foot Equivalent Unit:**\n\nTEU is the standard unit used to measure container shipping capacity. Simply put:\n\n• **1 TEU** = one standard 20-foot container\n• **2 TEU** = one 40-foot container (or two 20ft)\n\nWhen you hear "a vessel carries 20,000 TEU" — that means it can hold 20,000 twenty-foot containers (or 10,000 forty-footers, or a mix).\n\nFreight rates are often quoted per TEU (e.g., "$1,500/TEU from Shanghai to Jeddah").\n\n**Actual capacity of 1 TEU:** ~33 cubic metres / ~28 tonnes max payload.\n\nIt's one of those industry terms that sounds complicated but is really quite simple! Anything else you'd like explained?` },
    cbm: { match: /\bcbm\b|cubic met|volume.*calculat|how.*calculate.*volume/, text: `📏 **CBM — Cubic Metre (how cargo volume is measured):**\n\n**Formula:** Length (m) × Width (m) × Height (m) = CBM\n\n**Example:** A box that's 1.2m × 0.8m × 0.8m = **0.768 CBM**\nIf you have 10 of those boxes: 0.768 × 10 = **7.68 CBM**\n\n**Why it matters:**\n• LCL freight is charged per CBM (or per tonne, whichever is higher)\n• CBM determines how many containers you need for FCL\n• 20ft container ≈ 33 CBM capacity\n• 40ft container ≈ 67 CBM capacity\n• 40ft HC ≈ 76 CBM capacity\n\n**Pro tip:** If your cargo is very light but bulky, you'll pay on volume (CBM). If it's very heavy but small, you'll pay on weight. The breakpoint is roughly 1 CBM = 1,000 kg.\n\nNeed help calculating? Just give me your box dimensions and quantities!` },
    chargeableweight: { match: /chargeable weight|volumetric weight|dim weight|dimensional weight|vol.*weight/, text: `⚖️ **Chargeable Weight (how air freight is priced):**\n\nAir freight charges based on whichever is greater: **actual weight** or **volumetric weight**.\n\n**Volumetric weight formula:**\nLength (cm) × Width (cm) × Height (cm) ÷ 6,000 = kg\n\n**Example:**\n• Box: 60 × 40 × 40 cm = 96,000 ÷ 6,000 = **16 kg volumetric**\n• If the box actually weighs 8 kg → you pay for **16 kg** (volumetric is higher)\n• If the box actually weighs 25 kg → you pay for **25 kg** (actual is higher)\n\n**Why this exists:** Airlines sell space AND weight. A big, light box takes up space that could carry heavier cargo — so they charge based on the space it occupies.\n\n**Bejoice tip:** We always calculate both and advise the most cost-effective packing approach. Sometimes repacking can save 20–30% on air freight!` },
    hs: { match: /\bhs code\b|harmonized system|tariff code|commodity code|how.*classify/, text: `🔢 **HS Code — Harmonized System Code:**\n\nEvery product in international trade has an HS code — a 6-digit (minimum) number that tells customs EXACTLY what your product is. Saudi Arabia uses 8-digit codes.\n\n**Why it matters:**\n• Determines your **customs duty rate** (0% to 25%+ depending on product)\n• Determines if your product needs **special permits** (SASO, SFDA, etc.)\n• Wrong HS code = wrong duty = potential fines or shipment holds\n\n**Example:**\n• 8471.30 — Laptop computers → 0% duty in Saudi\n• 6110.20 — Cotton sweaters → 12% duty\n• 8703.23 — Cars (1500-3000cc) → 5% duty\n\n**Bejoice adds value here:** Our customs team reviews every HS classification before filing. We've saved clients millions in duty by catching misclassifications. It's one of those invisible services that makes a huge difference.\n\nWant to know the HS code and duty rate for your product?`, cta: { label: "Get HS Code Help", action: "call" } },
    aramco: { match: /aramco|saudi aramco|oil.*gas.*saudi|petroleum/, text: `🛢️ **Saudi Aramco & Energy Sector Logistics:**\n\nAramco is the world's largest oil company and one of the biggest generators of freight demand in Saudi Arabia.\n\n**What gets shipped for Aramco projects:**\n• Heavy machinery & drilling equipment\n• Steel pipes, valves, flanges\n• Electrical & instrumentation equipment\n• Prefabricated modules (sometimes 500+ tonnes each)\n• Chemicals & catalysts\n\n**Logistics challenges:** Aramco has strict vendor qualification requirements, specific packaging standards (SAES/SAMSS), and detailed shipping instructions that must be followed precisely.\n\nBejoice is experienced with Aramco project logistics — we understand their documentation requirements, delivery protocols, and site access procedures. Working on an Aramco-related project?`, cta: { label: "Discuss Aramco Project", action: "call" } },
    ftz: { match: /free.*zone|free.*trade.*zone|special economic zone|economic city|kaec|modon/, text: `🏭 **Saudi Free Zones & Economic Cities:**\n\nSaudi Arabia has several special economic zones that offer tax and customs advantages:\n\n**Key zones:**\n• **King Abdullah Economic City (KAEC)** — Red Sea coast, has its own port. Industrial, logistics & residential.\n• **MODON Industrial Cities** — 36 industrial cities across Saudi with subsidized land & utilities\n• **Ras Al-Khair SEZ** — Mining & minerals hub in the Eastern Province\n• **Jazan City for Primary Industries (JCPDI)** — Heavy industry near Yemen border\n• **Integrated Logistics Bonded Zones (ILBZ)** — New concept allowing duty-free storage & re-export\n\n**Benefits:** Reduced/zero customs duty, VAT exemptions, streamlined regulations, foreign ownership allowed.\n\n**For shippers:** If you're setting up manufacturing or distribution in Saudi, choosing the right zone can save you significant costs. Bejoice can advise on which zone fits your business model.`, cta: { label: "Zone Advisory", action: "call" } },
    bejoice: { match: /\bbejoice\b|your company|about you|about bejoice|who is bejoice|tell me about bejoice/, text: `🌟 **About Bejoice Group:**\n\nBejoice is an international freight forwarding and logistics company with a strong presence in Saudi Arabia and the UAE.\n\n**At a glance:**\n• 🌍 Operating in **180+ countries** with 80,000+ deliveries completed\n• 🏢 Offices in **Riyadh, Jeddah, Dammam** (KSA) & **Dubai** (UAE)\n• 📅 **25+ years** combined team experience in global freight\n• 🏗️ **1,500+ heavy lift operations** successfully executed\n\n**What we do:**\n• Ocean Freight (FCL, LCL, NVOCC)\n• Air Freight (express & deferred)\n• Land Transport (GCC & cross-border)\n• Project & Heavy Cargo\n• Customs Clearance (ZATCA-compliant)\n• Smart Warehousing & 3PL\n• Freight Insurance\n• Container Trading\n• Exhibition Cargo\n• Supply Chain Advisory & Compliance\n\n**Certifications:** ISO 9001, FIATA, IATA, AEO, SASO-approved\n\n**Our promise:** "Seamless and Trustworthy — We deliver." Simple as that. 😊\n\nWhat would you like to know more about?` },
    bejoiceServices: { match: /what.*services|what.*you.*offer|what.*you.*do|services.*list|capabilities/, text: `Here's everything Bejoice can do for you — it's quite a list! 📋\n\n**Core Freight:**\n🚢 Ocean Freight — FCL, LCL, breakbulk, NVOCC services\n✈️ Air Freight — Express, standard, charter, DG-certified\n🚛 Land Transport — GCC trucking, cross-border, last mile\n\n**Specialized:**\n🏗️ Project & Heavy Cargo — up to 1,000+ tonnes single lifts\n🎪 Exhibition Cargo — ATA Carnet handling, event logistics\n📦 Container Trading — buy/sell new & used containers\n\n**Value-Added:**\n🛃 Customs Clearance — Saudi, UAE & global\n🏭 Warehousing & 3PL — 50,000+ sqm across KSA\n🛡️ Freight Insurance — all-risk coverage via Lloyd's, AXA\n📊 Supply Chain Advisory — route optimization, compliance\n\n**Where:** 180+ countries, with deep expertise in KSA, GCC, Asia & Europe lanes.\n\nWhich service interests you most?`, cta: { label: "Get Started", action: "quote" } },
    bejoiceContact: { match: /contact.*bejoice|bejoice.*phone|bejoice.*email|reach.*bejoice|office.*location|where.*office/, text: `📞 **Bejoice Contact Details:**\n\n**Saudi Arabia (HQ):**\n📍 Block A, Al Raja Avenue, 1st floor, Office No. 2, Dammam 32234\n📧 info@bejoiceshipping-ksa.com\n📱 +966 13 823 3461\n\n**UAE Office:**\n📍 RHS Building, Khalid Bin Al Waleed Road, Dubai\n📧 info@bejoiceshipping-ksa.com\n📱 +971 4 370 5092\n\n**Quick ways to reach us:**\n• 💬 Chat with me right here (I'm available 24/7!)\n• 📅 Book a free consultation call\n• 📧 Email info@bejoiceshipping-ksa.com for rate requests\n\nOur team typically responds within 1 hour during business hours. Want to book a call now?`, cta: { label: "Book a Call", action: "call" } },
    nvocc: { match: /\bnvocc\b|non.*vessel.*operat/, text: `🚢 **NVOCC — Non-Vessel Operating Common Carrier:**\n\nAn NVOCC is a company that acts as a carrier (issues its own Bill of Lading) but doesn't actually own vessels. Think of it as a "virtual shipping line."\n\n**What this means for you:**\n• Bejoice, as an NVOCC, can issue our own **House B/L** — giving you more flexibility\n• We consolidate cargo from multiple shippers into full containers (great for LCL)\n• We negotiate bulk rates with actual carriers and pass savings to you\n• You deal with ONE company (us) instead of multiple shipping lines\n\n**The benefit:** Better rates, simpler documentation, one point of contact. Bejoice's NVOCC license means we control the entire process — not just broker it.\n\nWant to see how NVOCC pricing compares to direct carrier rates for your route?`, cta: { label: "Compare Rates", action: "quote" } },
    exhibition: { match: /exhibition|trade show|expo|event.*cargo|ata carnet|temporary import/, text: `🎪 **Exhibition & Event Cargo:**\n\nShipping goods for a trade show or exhibition? It's a specialized niche — and Bejoice handles it regularly.\n\n**What we cover:**\n• Booth materials, display units, samples, AV equipment\n• ATA Carnet handling (temporary duty-free import)\n• Customs clearance with temporary import status\n• On-site delivery & pickup coordination\n• Return shipping after the event\n\n**Key Saudi exhibitions we support:**\n• Riyadh Season events\n• LEAP (tech), Future Minerals Forum\n• Jeddah & Riyadh trade fairs\n• Saudi Food Show, Saudi Build, etc.\n\n**Critical for exhibitions:** Timing is everything. Arrive late = your booth is empty on opening day. Bejoice provides guaranteed delivery dates for event cargo.\n\nGot an upcoming exhibition? Tell me the event name and dates.`, cta: { label: "Exhibition Logistics", action: "call" } },
    supplychain: { match: /supply chain|optimize|optimization|advisory|consult.*logistics|logistics.*strategy/, text: `📊 **Supply Chain Advisory & Optimization:**\n\nBeyond moving boxes, Bejoice helps companies design smarter supply chains.\n\n**What we advise on:**\n• Route optimization — finding the fastest/cheapest paths\n• Modal analysis — when to use sea vs air vs road\n• Inventory strategy — how much to stock and where\n• Vendor management — consolidating shipments from multiple suppliers\n• Compliance — making sure you meet Saudi & international regulations\n• Cost reduction — we've helped clients cut logistics costs by 15–30%\n\n**Example:** A client was air-freighting components from China monthly. We restructured to monthly sea + safety stock = 40% cost reduction, same production uptime.\n\nWant a supply chain review? Our team can do a free assessment of your current setup.`, cta: { label: "Free Assessment", action: "call" } },
  }

  // Detect all matching topics
  const matches = []
  for (const [key, keywords] of Object.entries(KB)) {
    const score = keywords.reduce((s, kw) => s + (text.includes(kw) ? kw.length : 0), 0)
    if (score > 0) matches.push({ key, score })
  }
  // Sort by match strength (longer keyword matches rank higher)
  matches.sort((a, b) => b.score - a.score)

  let topic = matches.length > 0 ? matches[0].key : null

  // Handle follow-up: if user says "tell me more" and we have a last topic
  if (topic === 'followUp' && _lastTopic && RP[_lastTopic]) {
    const pool = RP[_lastTopic]
    const arr = Array.isArray(pool) ? pool : [pool]
    // Try to give a different variant than last time
    if (arr.length > 1) {
      const resp = pick(arr)
      return { text: "Sure, here's more on that! 👇\n\n" + resp.text, cta: resp.cta }
    }
    // Only one variant — give a helpful follow-up
    return {
      text: isAr ? `لقد شاركت ما أعرفه عن ${_lastTopic} — لكن خبراءنا يمكنهم التعمق أكثر في حالتك الخاصة. تريد مني توصيلك؟` : `I've shared what I know on ${_lastTopic} — but our specialists can go much deeper on your specific situation. Want me to connect you?`,
      cta: isAr ? ar.layla.specialistCTA : { label: "Talk to Specialist", action: "call" }
    }
  }

  // ── SAUDI_KB: check BEFORE generic topic responses so specific entries (zatca, saso, etc.) always win ──
  for (const [key, entry] of Object.entries(SAUDI_KB_LANG)) {
    if (entry.match.test(text)) {
      _lastTopic = 'saudi_' + key
      return { text: entry.text, cta: entry.cta }
    }
  }

  // If we got a topic match, use it — and personalize with memory
  if (topic && RP[topic]) {
    _lastTopic = topic
    if (!_topicHistory.includes(topic)) _topicHistory.push(topic)
    const pool = RP[topic]
    const arr = Array.isArray(pool) ? pool : [pool]
    const response = pick(arr)
    // Personalize: prepend name if we know it, and append context hint for logistics topics
    const logisticsTopics = ['quote','air','sea','heavy','customs','warehousing','insurance','market','saudi','tracking']
    if (_memory.name || (logisticsTopics.includes(topic) && buildContextHint())) {
      const greeting = personalizeOpening(isAr)
      const ctxHint = logisticsTopics.includes(topic) ? buildContextHint(isAr) : null
      const baseText = typeof response.text === 'function' ? response.text() : response.text
      return {
        ...response,
        text: `${greeting}${baseText}${ctxHint ? `\n\n${ctxHint}` : ''}`,
      }
    }
    return response
  }

  // Compound question detection: if multiple logistics topics matched
  if (matches.length >= 2) {
    const t1 = matches[0].key, t2 = matches[1].key
    const r1 = RP[t1], r2 = RP[t2]
    if (r1 && r2) {
      const a1 = Array.isArray(r1) ? pick(r1) : r1
      const a2 = Array.isArray(r2) ? pick(r2) : r2
      _lastTopic = t1
      return {
        text: isAr ? `سؤال رائع — هذا يلمس عدة مجالات! دعني أغطي كل شيء:\n\n${a1.text}\n\n---\n\n${a2.text}` : `Great question — that touches on a couple of areas! Let me cover both:\n\n${a1.text}\n\n---\n\n${a2.text}`,
        cta: a1.cta || a2.cta,
      }
    }
  }

  // ── Smart general-question handling ──
  // Detect question patterns and give conversational answers
  const isQuestion = isAr ? /\؟|^(ما|كيف|لماذا|متى|أين|أي|هل|من)\b/.test(text) : /\?|^(what|how|why|when|where|which|can|do|does|is|are|will|would|should|could)\b/.test(text)

  if (isQuestion && !topic) {
    // Route/lane questions
    if (isAr ? /من .+ إلى |شحن.*إلى|إرسال.*إلى/.test(text) : /from .+ to .+|ship.* to |send.* to |freight.* to /.test(text)) {
      _lastTopic = 'quote'
      return {
        text: isAr ? ar.layla.routeQuote.text : `Great question! 🗺️ ${'That route'} is definitely something we handle.\n\nTo give you an accurate rate and timeline, I'd need a few details: cargo type, approximate weight/volume, and whether you prefer sea or air.\n\nOr — fastest option — let me open our quote form and our team will get back to you within the hour with exact numbers.`,
        cta: isAr ? ar.layla.routeQuote.cta : { label: "Get Route Quote", action: "quote" },
      }
    }
    // Transit time questions
    if (isAr ? /كم يوم|وقت العبور|مدة الشحن|كم مدة|مدة التوصيل/.test(text) : /how long|transit time|how many days|how fast|delivery time|lead time/.test(text)) {
      return {
        text: isAr ? ar.layla.transitTime.text : `Good question! ⏱️ Transit times vary by mode and route. Here's a rough guide:\n\n✈️ **Air:** 1–5 days (Asia→KSA: 1–2 days, Europe: 2–3, USA: 3–4)\n🚢 **Sea:** 15–45 days depending on origin (currently +10–14 days due to Cape routing)\n🚛 **Road (GCC):** 1–5 days within the Gulf region\n\nThese are port-to-port — add 2–5 days for customs + last mile. Want a precise estimate for your specific route?`,
        cta: isAr ? ar.layla.transitTime.cta : { label: "Get Exact Timeline", action: "quote" },
      }
    }
    // Incoterms questions
    if (/incoterm|fob|cif|exw|ddp|dap|cfr|fas|fca/.test(text)) {
      return {
        text: isAr ? ar.layla.incoterms : `Ah, incoterms — the language of international trade! 📋\n\nHere's the simple version:\n\n• **EXW** — You handle everything from seller's door\n• **FOB** — Seller delivers to port, you take over from there\n• **CIF** — Seller pays freight + insurance to destination port\n• **DDP** — Seller handles EVERYTHING to your door (most convenient)\n\nMost Saudi imports use **FOB** or **CIF**. For first-time importers, I usually recommend **CIF** — simpler for you, and Bejoice handles the freight portion beautifully.\n\nWhich incoterm are you working with?`,
      }
    }
    // Container size questions
    if (/which container|what container|container size|20ft or 40|how many container/.test(text)) {
      return {
        text: isAr ? ar.layla.containerSize : `Let me break down container options simply: 📦\n\n**20ft Standard** — fits ~28 cubic metres (33 m³ capacity)\nBest for: heavy cargo, partial loads, <15 tonnes\n\n**40ft Standard** — fits ~56 cubic metres (67 m³ capacity)\nBest for: volume cargo, lighter goods, most popular size\n\n**40ft High Cube** — fits ~68 cubic metres (76 m³ capacity)\nBest for: tall/bulky items, light but voluminous goods\n\n**Quick rule:** if your cargo is under 25 CBM, go 20ft. Over 25? Go 40ft. Over 60 or tall items? 40HC.\n\nTell me your cargo volume and I'll recommend the best fit!`,
      }
    }
    // Document questions
    if (isAr ? /مستندات|أوراق|ماذا أحتاج|متطلبات|وثائق/.test(text) : /document|paperwork|what do i need|requirement|what paper/.test(text)) {
      return {
        text: isAr ? ar.layla.docs : `Here's the paperwork checklist, made simple: 📝\n\n**For all shipments:**\n✅ Commercial Invoice\n✅ Packing List\n✅ Bill of Lading (sea) or Airway Bill (air)\n\n**For Saudi imports, also:**\n✅ Certificate of Origin\n✅ SASO/SABER conformity certificate (most products)\n✅ SFDA approval (food & pharma)\n✅ Import permit (if applicable)\n\nDon't worry — Bejoice prepares and reviews all documents before submission. We catch issues before customs does. 😊\n\nWhat are you importing? I can tell you exactly what you'll need.`,
        cta: { label: "Get Document Help", action: "call" },
      }
    }
  }



  // ── Smart fallback — try to relate to logistics or give helpful redirect ──
  _lastTopic = null

  // If it looks like a "what is" definition question, give a thoughtful non-answer
  if (isAr ? /^(ما هو|ما هي|ماذا يعني|عرف|اشرح|معنى|أخبرني عن)\b/.test(text) : /^(what is|what are|what does|define|explain|meaning of|tell me about)\b/.test(text)) {
    const subject = isAr ? text.replace(/^(ما هو|ما هي|ماذا يعني|عرف|اشرح|معنى|أخبرني عن)\s*/i, '').replace(/[؟.?!]+$/, '').trim() : text.replace(/^(what is|what are|what does|define|explain|meaning of|tell me about)\s*/i, '').replace(/[?.!]+$/, '').trim()
    if (subject.length > 1) {
      return {
        text: isAr ? `سؤال رائع عن "${subject}"! 🤔\n\nخبرتي الأكبر في الشحن واللوجستيات والجمارك والسوق السعودي — لذلك إذا كان "${subject}" مرتبطاً بأي من هذه المجالات، جرب السؤال في هذا السياق.\n\nأو يمكنني توصيلك بأخصائي بيجويس الذي قد يكون لديه الإجابة.` : `That's a great question about "${subject}"! 🤔\n\nI'm most knowledgeable about freight, logistics, customs, and the Saudi market — so if "${subject}" connects to any of those areas, try asking me in that context.\n\nFor example:\n• "What is ${subject} in shipping?"\n• "How does ${subject} affect logistics?"\n\nOr, I can connect you with a Bejoice specialist who might have the answer. Our team has deep industry expertise and loves a good question! 😊`,
        cta: isAr ? ar.layla.specialistCTA : { label: "Ask a Specialist", action: "call" },
      }
    }
  }

  // General fallback with personality
  const fallbacks = RP.fallback
  return pick(Array.isArray(fallbacks) ? fallbacks : [fallbacks])
}

// ── Keyframes injection ────────────────────────────────────────
const STYLE_ID = "ca-keyframes-premium";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes ca-wave {
      0%   { transform: rotate(0deg);   }
      15%  { transform: rotate(20deg);  }
      30%  { transform: rotate(-10deg); }
      45%  { transform: rotate(18deg);  }
      60%  { transform: rotate(-6deg);  }
      75%  { transform: rotate(12deg);  }
      100% { transform: rotate(0deg);   }
    }
    @keyframes ca-float {
      0%, 100% { transform: translateY(0px);  }
      50%       { transform: translateY(-5px); }
    }
    @keyframes ca-pulse-ring {
      0%   { transform: scale(1);   opacity: 0.5; }
      100% { transform: scale(1.55); opacity: 0;  }
    }
    @keyframes ca-shimmer-border {
      0%   { box-shadow: 0 0 0 3px rgba(91,194,231,0.55), 0 8px 32px rgba(0,0,0,0.6); }
      50%  { box-shadow: 0 0 0 3px rgba(232,204,122,0.85), 0 10px 40px rgba(91,194,231,0.2); }
      100% { box-shadow: 0 0 0 3px rgba(91,194,231,0.55), 0 8px 32px rgba(0,0,0,0.6); }
    }
    @keyframes ca-label-in {
      from { opacity: 0; transform: translateX(8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes ca-bubble-in {
      0%   { opacity: 0; transform: scale(0.85) translateY(8px); }
      100% { opacity: 1; transform: scale(1)    translateY(0);   }
    }
    @keyframes ca-msg-fade {
      0%   { opacity: 0; transform: translateY(5px);  }
      12%  { opacity: 1; transform: translateY(0);    }
      80%  { opacity: 1; transform: translateY(0);    }
      100% { opacity: 0; transform: translateY(-5px); }
    }
    @keyframes ca-panel-in {
      0%   { opacity: 0; transform: translateY(24px) scale(0.94); }
      100% { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes ca-dot-bounce {
      0%, 80%, 100% { transform: translateY(0);    }
      40%            { transform: translateY(-7px); }
    }
    @keyframes ca-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes ca-glow-pulse {
      0%, 100% { box-shadow: 0 0 28px 6px rgba(91,194,231,0.35), 0 8px 40px rgba(0,0,0,0.7); }
      50%      { box-shadow: 0 0 44px 12px rgba(91,194,231,0.55), 0 8px 40px rgba(0,0,0,0.7); }
    }
    @keyframes ca-badge-pop {
      0%   { transform: scale(0); }
      60%  { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    .ca-wave-hand { display: inline-block; animation: ca-wave 1.8s ease-in-out; transform-origin: 70% 80%; }
    .ca-wave-hand:hover { animation: ca-wave 0.8s ease-in-out infinite; }
    .ca-msgs::-webkit-scrollbar { width: 4px; }
    .ca-msgs::-webkit-scrollbar-thumb { background: rgba(91,194,231,0.2); border-radius: 4px; }
    .ca-msgs::-webkit-scrollbar-track { background: transparent; }
    .ca-input-field {
      flex: 1; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(91,194,231,0.2); border-radius: 24px;
      color: #fff; font-family: 'DM Sans', sans-serif;
      font-size: 16px; padding: 10px 16px; outline: none;
      transition: border-color 0.2s;
      -webkit-appearance: none;
    }
    .ca-input-field::placeholder { color: rgba(255,255,255,0.3); }
    .ca-input-field:focus { border-color: rgba(91,194,231,0.5); background: rgba(255,255,255,0.07); }
    .ca-send-btn {
      width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #8DD8F0, #5BC2E7);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #091524; transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(91,194,231,0.4);
    }
    .ca-send-btn:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 6px 20px rgba(91,194,231,0.6); }
    .ca-send-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.2); box-shadow: none; cursor: default; transform: none; }
    /* ── Mobile overrides ── */
    @media (max-width: 480px) {
      .ca-panel-mobile {
        width: calc(100% - 16px) !important;
        right: 8px !important;
        left: 8px !important;
        border-radius: 20px !important;
      }
      .ca-msgs-mobile {
        height: min(320px, 42svh) !important;
      }
      .ca-bubble-mobile {
        max-width: 200px !important;
        font-size: 12.5px !important;
        padding: 10px 14px !important;
      }
      .ca-qr-mobile {
        gap: 5px !important;
      }
      .ca-qr-btn-mobile {
        font-size: 11px !important;
        padding: 5px 10px !important;
      }
      .ca-fab-mobile {
        right: 8px !important;
      }
      .layla-fab-ar {
        left: auto !important;
        right: 8px !important;
      }
    }
    /* ── Tablet/mobile (≤1280px): hide label & bubble to reduce footprint ── */
    @media (max-width: 1280px) {
      .ca-name-label { display: none !important; }
      .ca-bubble-mobile { display: none !important; }
    }
    /* ── Arabic tablet (≤1024px): scale down, stay in bottom-left corner ── */
    @media (max-width: 1024px) {
      .layla-fab-ar {
        left: auto !important;
        right: 14px !important;
        transform: scale(0.62);
        transform-origin: bottom right;
      }
    }
    /* ── Mobile (≤767px): scale avatar down; Arabic locked to bottom-left ── */
    @media (max-width: 767px) {
      .ca-fab-mobile {
        transform: scale(0.72);
        transform-origin: bottom right;
      }
      .layla-fab-ar {
        left: auto !important;
        right: 8px !important;
        transform: scale(0.55);
        transform-origin: bottom right;
      }
    }
  `;
  document.head.appendChild(s);
}

// Position the FAB above the hero stat bar on screens ≤1440px wide.
// Uses clamp(180px, 25vh, 340px) so it scales proportionally:
//   - floor 180px  → always clears the stat bar top (~150px max)
//   - 25vh anchor  → scales gently with viewport height
//   - ceiling 340px → prevents the FAB drifting too high on tall screens
function calcFabBottom() {
  if (typeof window === 'undefined') return '166px';
  if (window.innerWidth > 1440) return '166px';
  if (window.innerWidth <= 767) return '28px';
  const px = Math.min(Math.max(Math.round(window.innerHeight * 0.25), 180), 340);
  return `${px}px`;
}

export default function FloatingBookCTA({ onQuoteClick }) {
  const { openCalPopup } = useCalBooking();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const activeMessages     = isAr ? ar.layla.floatingMessages : MESSAGES;
  const activeQuickReplies = isAr ? ar.layla.quickReplies     : QUICK_REPLIES;
  const [visible, setVisible]           = useState(true);
  const [dismissed, setDismissed]       = useState(false);
  const [open, setOpen]                 = useState(false);
  const [msgIndex, setMsgIndex]         = useState(0);
  const [showBubble, setShowBubble]     = useState(true);
  const [typing, setTyping]             = useState(false);
  const [waving, setWaving]             = useState(true);
  const [inputVal, setInputVal]         = useState("");
  const [unread, setUnread]             = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: isAr ? ar.layla.greeting : "Hi! I'm Layla, your Bejoice freight assistant 👋\n\nI can help with ocean & air freight rates, Saudi customs, Red Sea disruptions, project cargo, and more. What do you need today?" }
  ]);
  const [fabBottom, setFabBottom]       = useState(calcFabBottom);
  const [isGlobeActive, setIsGlobeActive] = useState(false);
  const [shouldStickBottom, setShouldStickBottom] = useState(false);
  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);

  // Hide only near the very bottom (footer area) — never re-show if dismissed
  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      const scrollY   = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const viewH     = window.innerHeight;
      setVisible(scrollY + viewH < docHeight - 200);

      // Past the initial hero phase (frame 145/stats bar) or below the hero entirely
      // 2.5vh is a safe threshold where the hero stats bar has already faded out.
      setShouldStickBottom(scrollY > viewH * 2.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  // Recalculate FAB position on resize
  useEffect(() => {
    const handleResize = () => setFabBottom(calcFabBottom());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Listen for 3D Globe state to reposition avatar on English pages
  useEffect(() => {
    const handleGlobeState = (e) => setIsGlobeActive(e.detail.active);
    window.addEventListener('bj-globe-active', handleGlobeState);
    // Initial check in case VideoHero already fired
    if (window.__bjGlobeActive !== undefined) setIsGlobeActive(window.__bjGlobeActive);
    return () => window.removeEventListener('bj-globe-active', handleGlobeState);
  }, []);

  // Cycle speech bubble
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % activeMessages.length);
        setShowBubble(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  // Wave periodically
  useEffect(() => {
    setWaving(true);
    const interval = setInterval(() => {
      setWaving(true);
      setTimeout(() => setWaving(false), 2000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const addBotResponse = (response) => {
    const txt = typeof response.text === 'function' ? response.text() : response.text
    setChatMessages(prev => [...prev, {
      from: "bot",
      text: txt,
      cta: response.cta,
    }]);
    if (!open) setUnread(u => u + 1);
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { from: "user", text: text.trim() }]);
    setInputVal("");
    setTyping(true);
    const delay = 900 + Math.random() * 600;
    setTimeout(() => {
      setTyping(false);
      addBotResponse(getBotResponse(text, isAr));
    }, delay);
  };

  const handleQuickReply = (action, label) => {
    setChatMessages(prev => [...prev, { from: "user", text: label }]);
    setTyping(true);
    const delay = 900 + Math.random() * 500;
    setTimeout(() => {
      setTyping(false);
      const r = isAr ? ar.layla.responses : RESPONSES;
      const pool = action === "call" ? r.contact
        : r[action] ? r[action]
        : r.quote;
      const arr = Array.isArray(pool) ? pool : [pool];
      addBotResponse(pick(arr));
    }, delay);
  };

  const handleCTA = (action) => {
    if (action === "call") {
      openCalPopup();
    } else if (action === "quote") {
      setOpen(false);
      onQuoteClick?.();
    } else {
      const el = document.getElementById("contact");
      if (el) {
        if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80, duration: 1.6 });
        else el.scrollIntoView({ behavior: "smooth" });
      }
      setOpen(false);
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div className={`layla-fab-wrap ca-fab-mobile${isAr ? ' layla-fab-ar' : ''}`} style={{
      position: "fixed",
      bottom: (isGlobeActive || shouldStickBottom) ? "28px" : fabBottom,
      right: isAr ? "auto" : "clamp(8px, 4vw, 28px)",
      left: isAr ? "clamp(8px, 4vw, 28px)" : "auto",
      zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: isAr ? "flex-start" : "flex-end", gap: 14,
      transition: "bottom 0.8s cubic-bezier(0.16, 1, 0.3, 1), right 0.8s cubic-bezier(0.16, 1, 0.3, 1), left 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>

      {/* ══════════════════════════════════════
          CHAT PANEL
      ══════════════════════════════════════ */}
      {open && (
        <div className="ca-panel-mobile" style={{
          width: "min(380px, calc(100% - 16px))",
          background: "linear-gradient(170deg, #0b1120 0%, #091524 100%)",
          border: "1px solid rgba(91,194,231,0.3)",
          borderRadius: 24,
          overflow: "visible",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(91,194,231,0.12), 0 0 60px rgba(91,194,231,0.08)",
          animation: isAr ? "none" : "ca-panel-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
          display: "flex", flexDirection: "column",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(110deg, rgba(91,194,231,0.14) 0%, rgba(91,194,231,0.04) 100%)",
            borderBottom: "1px solid rgba(91,194,231,0.18)",
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}>
            <div style={{ position: "relative" }}>
              <Avatar size={52} />
              <div style={{
                position: "absolute", bottom: 1, right: 1,
                width: 12, height: 12, borderRadius: "50%",
                background: "#22c55e", border: "2.5px solid #091524",
                boxShadow: "0 0 8px rgba(34,197,94,0.7)",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                color: "#fff", fontWeight: 700, fontSize: 15,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em",
              }}>
                {isAr ? ar.layla.name : 'Layla'} <span style={{ color: "rgba(91,194,231,0.8)", fontSize: 12, fontWeight: 500 }}>· Bejoice AI</span>
              </div>
              <div style={{
                color: "#22c55e", fontSize: 11.5,
                fontFamily: "'DM Sans', sans-serif", marginTop: 2,
              }}>
                ● {isAr ? ar.layla.role : 'Online · Freight & Supply Chain Expert'}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              title="Close chat"
              style={{
                background: "rgba(200,50,50,0.2)", border: "2px solid rgba(220,80,80,0.6)",
                color: "#ff9999", cursor: "pointer",
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: "0 0 12px rgba(200,50,50,0.25)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,50,50,0.45)"; e.currentTarget.style.borderColor = "rgba(255,100,100,0.9)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,50,50,0.2)"; e.currentTarget.style.borderColor = "rgba(220,80,80,0.6)"; e.currentTarget.style.color = "#ff9999"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/>
              </svg>
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="ca-msgs ca-msgs-mobile" style={{
            height: "min(360px, 45svh)", overflowY: "scroll",
            padding: "16px 16px 10px",
            display: "flex", flexDirection: "column", gap: 12,
            flex: "none",
          }}
            onWheel={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
          >
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                animation: "ca-slide-up 0.3s ease forwards",
                display: "flex", flexDirection: "column",
                alignItems: msg.from === "bot" ? "flex-start" : "flex-end",
                gap: 7,
              }}>
                <div style={{
                  maxWidth: "88%",
                  background: msg.from === "bot"
                    ? "rgba(255,255,255,0.055)"
                    : "linear-gradient(135deg, #5BC2E7, #a8843e)",
                  color: msg.from === "bot" ? "rgba(255,255,255,0.93)" : "#fff",
                  borderRadius: msg.from === "bot" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                  padding: "10px 14px",
                  fontSize: 13.5,
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.6,
                  border: msg.from === "bot" ? "1px solid rgba(91,194,231,0.14)" : "none",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                </div>
                {msg.cta && (
                  <button
                    onClick={() => handleCTA(msg.cta.action)}
                    style={{
                      background: "linear-gradient(135deg, #8DD8F0, #8DD8F0, #5BC2E7)",
                      color: "#091524", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
                      padding: "11px 20px", fontSize: 12, fontWeight: 900,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
                      transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                      position: 'relative', overflow: 'hidden',
                      minHeight: 44,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1.5px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(91,194,231,0.4), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, #c4edfa, #8DD8F0, #8DD8F0)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, #8DD8F0, #8DD8F0, #5BC2E7)"; }}
                  >
                    <div className="btn-shine-overlay" />
                    {msg.cta.label} →
                  </button>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.055)",
                borderRadius: "4px 16px 16px 16px",
                width: "fit-content",
                border: "1px solid rgba(91,194,231,0.12)",
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#5BC2E7",
                    animation: `ca-dot-bounce 1.2s ease ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ── Quick replies ── */}
          <div className="ca-qr-mobile" style={{
            padding: "8px 16px 10px",
            display: "flex", flexWrap: "wrap", gap: 7,
            borderTop: "1px solid rgba(91,194,231,0.1)",
            flexShrink: 0,
          }}>
            {activeQuickReplies.map(r => (
              <button
                key={r.label}
                onClick={() => handleQuickReply(r.action, r.label)}
                className="ca-qr-btn-mobile"
                style={{
                  background: "rgba(91,194,231,0.07)", color: "#8DD8F0",
                  border: "1px solid rgba(91,194,231,0.22)", borderRadius: 22,
                  padding: "6px 12px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.18s",
                  minHeight: 36,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(91,194,231,0.18)"; e.currentTarget.style.borderColor = "rgba(91,194,231,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(91,194,231,0.07)"; e.currentTarget.style.borderColor = "rgba(91,194,231,0.22)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* ── Input bar ── */}
          <div style={{
            padding: "10px 16px 16px",
            display: "flex", alignItems: "center", gap: 10,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              className="ca-input-field"
              placeholder={isAr ? ar.layla.inputPlaceholder : "Ask about freight, rates, Saudi customs..."}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(inputVal); }}
            />
            <button
              className="ca-send-btn"
              onClick={() => sendMessage(inputVal)}
              disabled={!inputVal.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* Powered-by footer */}
          <div style={{
            textAlign: "center", padding: "0 16px 12px",
            fontSize: 10.5, color: "rgba(255,255,255,0.22)",
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em",
          }}>
            {isAr ? ar.layla.poweredBy : 'BEJOICE AI · Freight Intelligence Engine'}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          SPEECH BUBBLE (when closed)
      ══════════════════════════════════════ */}
      {!open && showBubble && (
        <div
          onClick={() => setOpen(true)}
          className="ca-bubble-mobile"
          style={{
            background: "linear-gradient(135deg, rgba(12,14,26,0.96), rgba(7,16,28,0.98))",
            color: "#f0e6c8",
            border: "1px solid rgba(91,194,231,0.4)",
            borderRadius: isAr ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
            padding: "12px 18px",
            fontSize: 13.5, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: 240,
            textAlign: isAr ? "left" : "right",
            boxShadow: "0 10px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,194,231,0.1)",
            animation: isAr ? "none" : "ca-bubble-in 0.4s ease forwards",
            lineHeight: 1.5, cursor: "pointer",
            backdropFilter: "blur(16px)",
          }}
        >
          <span style={{ animation: "ca-msg-fade 4s ease forwards", display: "block" }}>
            {activeMessages[msgIndex]}
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════
          AVATAR BUTTON
      ══════════════════════════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

        {/* ── Name label above avatar ── */}
        {!open && (
          <div className="ca-name-label" style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            animation: isAr ? "none" : "ca-label-in 0.5s ease forwards",
            background: "rgba(7,16,28,0.72)",
            border: "1px solid rgba(91,194,231,0.3)",
            borderRadius: "12px",
            padding: "8px 16px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}>
            {/* Name */}
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 18, fontWeight: 900,
              letterSpacing: "0.28em",
              color: "#ffffff",
              textShadow: "0 0 20px rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.8)",
              lineHeight: 1,
              textTransform: "uppercase",
            }}>
              {isAr ? ar.layla.name : 'LAYLA'}
            </div>
            {/* Subtitle with flanking lines */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 16, height: 1, background: "rgba(91,194,231,0.7)" }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9.5, fontWeight: 700,
                letterSpacing: "0.25em",
                color: "#8DD8F0",
                textTransform: "uppercase", lineHeight: 1,
              }}>{isAr ? 'خبيرة شحن' : 'Freight Expert'}</span>
              <div style={{ width: 16, height: 1, background: "rgba(91,194,231,0.7)" }} />
            </div>
          </div>
        )}

        {/* ── Avatar circle ── */}
        <div
          style={{ position: "relative", cursor: "pointer" }}
          onClick={() => setOpen(o => !o)}
        >
          {/* Dismiss badge */}
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true); setVisible(false); setOpen(false); }}
            title="Dismiss Layla"
            style={{
              position: "absolute", top: -8, right: -8, zIndex: 10,
              width: 26, height: 26, borderRadius: "50%",
              background: "rgba(15,15,20,0.95)",
              border: "2px solid rgba(220,70,70,0.7)",
              color: "rgba(255,130,130,1)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0 8px rgba(200,60,60,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,50,50,0.9)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,15,20,0.95)"; e.currentTarget.style.color = "rgba(255,130,130,1)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
            </svg>
          </button>
          {/* Single soft pulse ring */}
          {!open && (
            <div style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              border: "1.5px solid rgba(91,194,231,0.45)",
              animation: isAr ? "none" : "ca-pulse-ring 2.8s ease-out infinite",
              pointerEvents: "none",
            }} />
          )}

          {/* Floating + shimmer-border avatar */}
          <div style={{
            animation: (open || isAr) ? "none" : "ca-float 4s ease-in-out infinite",
            position: "relative",
          }}>
            <div style={{
              borderRadius: "50%",
              animation: (open || isAr) ? "none" : "ca-shimmer-border 3s ease-in-out infinite",
            }}>
              <Avatar size={112} />
            </div>

            {/* Unread badge */}
            {!open && unread > 0 && (
              <div style={{
                position: "absolute", top: -2, left: -2,
                width: 24, height: 24, borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff", fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #091524",
                boxShadow: "0 2px 8px rgba(239,68,68,0.6)",
                animation: "ca-badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {unread}
              </div>
            )}

            {/* Online dot */}
            <div style={{
              position: "absolute", top: 7, right: 7,
              width: 16, height: 16, borderRadius: "50%",
              background: "#22c55e",
              border: "2.5px solid #091524",
              boxShadow: "0 0 8px rgba(34,197,94,0.7)",
            }} />
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ size }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      position: "relative",
      animation: "laylaFloat 3s ease-in-out infinite",
    }}>
      {/* Glow ring */}
      <div style={{
        position: "absolute", inset: -3,
        borderRadius: "50%",
        border: "2px solid rgba(91,194,231,0.55)",
        boxShadow: "0 0 18px rgba(91,194,231,0.4), inset 0 0 12px rgba(91,194,231,0.15)",
        animation: "laylaRingPulse 2.4s ease-in-out infinite",
        zIndex: 2,
        pointerEvents: "none",
      }} />
      {/* Image */}
      <div style={{
        width: size, height: size, borderRadius: "50%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0d1a2e, #06101c)",
        border: "1.5px solid rgba(91,194,231,0.3)",
        position: "relative", zIndex: 1,
      }}>
        <picture>
          <img
            src="/ai-assistant-female.png"
            alt="Layla — Bejoice AI"
            width="200" height="200"
            loading="lazy" decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </picture>
        {/* Scanlines overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />
      </div>
      <style>{`
        @keyframes laylaFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes laylaRingPulse {
          0%, 100% { opacity: 0.7; box-shadow: 0 0 14px rgba(91,194,231,0.35), inset 0 0 10px rgba(91,194,231,0.1); }
          50% { opacity: 1; box-shadow: 0 0 26px rgba(91,194,231,0.65), inset 0 0 18px rgba(91,194,231,0.2); }
        }
      `}</style>
    </div>
  );
}
