'use client';
/**
 * Layla RAG Knowledge Base — Sea Freight Orientation
 * Source: Bejoice Orientation – Sea Freight PDF (60 pages)
 * Each chunk: { id, topic, tags[], content }
 */

export const KNOWLEDGE_CHUNKS = [
  // ── LOGISTICS & FREIGHT FORWARDING ──────────────────────────
  {
    id: 'logistics-definition',
    topic: 'Logistics',
    tags: ['logistics', 'supply chain', 'freight', 'forwarding', 'what is logistics', 'definition'],
    content: `**Logistics** is the process of planning, implementing, and controlling the efficient flow and storage of goods, services, and information from point of origin to point of consumption. It encompasses transportation, warehousing, inventory management, and customs clearance.\n\n**Freight Forwarding** is a service that organizes shipments for individuals or corporations to get goods from the manufacturer or producer to a market, customer, or final point of distribution. A freight forwarder acts as an intermediary between the shipper and transportation services — negotiating the best price, handling documentation, and ensuring regulatory compliance.`,
  },
  {
    id: 'supply-chain',
    topic: 'Supply Chain',
    tags: ['supply chain', '3pl', 'third party logistics', 'logistics provider', 'outsource'],
    content: `**Supply Chain** is the network between a company and its suppliers to produce and distribute a specific product to the final buyer. It includes every step — from raw materials to the end consumer.\n\n**3PL (Third-Party Logistics):** Companies outsource logistics operations to a 3PL provider like Bejoice. A 3PL manages transportation, warehousing, customs clearance, and distribution — letting businesses focus on their core operations. Bejoice is a full 3PL provider serving Saudi Arabia and the wider GCC region.`,
  },
  {
    id: 'parties-in-freight',
    topic: 'Parties in Freight',
    tags: ['consignee', 'shipper', 'notify party', 'carrier', 'freight forwarder', 'parties', 'who is'],
    content: `Key parties in a freight transaction:\n\n• **Shipper / Exporter** — The seller/sender who dispatches the cargo\n• **Consignee / Importer** — The buyer/receiver who takes delivery of the cargo\n• **Notify Party** — Third party (often the consignee's customs broker) notified when cargo arrives\n• **Carrier** — The shipping line or airline that physically transports the goods\n• **Freight Forwarder** — Intermediary that arranges the shipment (like Bejoice)\n• **Customs Broker** — Licensed agent who handles customs clearance on behalf of the importer`,
  },

  // ── BILL OF LADING ──────────────────────────────────────────
  {
    id: 'bill-of-lading-basics',
    topic: 'Bill of Lading',
    tags: ['bill of lading', 'b/l', 'bl', 'mbl', 'hbl', 'house bill', 'master bill', 'obl', 'original bl'],
    content: `**Bill of Lading (B/L)** is the most important document in sea freight. It serves three purposes:\n1. **Receipt** — Confirms the carrier received the goods\n2. **Contract of Carriage** — Legal contract between shipper and carrier\n3. **Document of Title** — Whoever holds the original B/L owns the cargo\n\n**MBL (Master Bill of Lading):** Issued by the shipping line to the freight forwarder. The forwarder's name appears as the shipper.\n\n**HBL (House Bill of Lading):** Issued by the freight forwarder to the actual shipper/consignee. This is what the customer typically receives.\n\nFor Saudi imports, the original B/L (OBL) or a telex release / sea waybill is required to clear customs.`,
  },
  {
    id: 'bill-of-lading-types',
    topic: 'Bill of Lading Types',
    tags: ['telex release', 'sea waybill', 'express release', 'negotiable', 'non-negotiable', 'surrender', 'bl types'],
    content: `Types of Bill of Lading:\n\n• **Original B/L (OBL)** — Physical document; must be surrendered at destination to release cargo. Used for Letter of Credit shipments.\n• **Telex Release** — Shipper surrenders originals at origin; carrier sends electronic authorization to destination. No physical document needed.\n• **Sea Waybill** — Non-negotiable; consignee can collect without a physical document. Faster but cannot be used with Letters of Credit.\n• **Express Release** — Same as telex release, sometimes used interchangeably.\n\n**Negotiable B/L:** Can be transferred to a third party by endorsement — used in LC transactions.\n**Non-Negotiable B/L:** Issued to a named consignee only; cannot be transferred.`,
  },

  // ── SHIPPING DOCUMENTS ──────────────────────────────────────
  {
    id: 'sea-freight-documents',
    topic: 'Sea Freight Documents',
    tags: ['documents', 'paperwork', 'commercial invoice', 'packing list', 'certificate of origin', 'what documents', 'required documents'],
    content: `**Core sea freight documents:**\n\n1. **Bill of Lading (B/L)** — Contract of carriage and title document\n2. **Commercial Invoice** — States the value, description, and terms of sale\n3. **Packing List** — Details each package: weight, dimensions, contents\n4. **Certificate of Origin (COO)** — Declares where goods were manufactured; required for duty calculation\n5. **Bill of Entry** — Filed with Saudi Customs for import clearance\n6. **Delivery Order (DO)** — Issued by shipping line to allow cargo release from port\n7. **Equipment Interchange Receipt (EIR)** — Documents container handover at port\n8. **SABER Certificate** — Saudi conformity certificate for regulated products\n9. **SFDA Approval** — Required for food, pharmaceutical, and medical products\n10. **Dangerous Goods Declaration** — Required if cargo is hazardous (IMDG)\n11. **Import Permit** — Required for certain restricted goods\n12. **Insurance Certificate** — Proof of cargo insurance`,
  },
  {
    id: 'commercial-invoice-packing',
    topic: 'Commercial Invoice & Packing List',
    tags: ['commercial invoice', 'packing list', 'invoice', 'what is commercial invoice', 'value'],
    content: `**Commercial Invoice** — The primary document in any trade transaction. It must include:\n• Shipper and consignee details\n• Description of goods\n• HS Code (Harmonized System tariff code)\n• Unit price, quantity, total value\n• Currency\n• Country of origin\n• INCO Terms\n• Invoice number and date\n\n**Packing List** — Complements the invoice. Lists every box/package with:\n• Package number and type\n• Gross weight, net weight\n• Dimensions (L × W × H)\n• Contents per package\n\nBoth documents must match exactly — discrepancies cause customs delays.`,
  },

  // ── CUSTOMS ─────────────────────────────────────────────────
  {
    id: 'customs-clearance',
    topic: 'Customs Clearance',
    tags: ['customs', 'customs clearance', 'customs broker', 'zatca', 'import duty', 'tariff', 'hs code', 'duty'],
    content: `**Customs Clearance** is the process of getting permission from the government to import or export goods. In Saudi Arabia, customs is regulated by **ZATCA** (Zakat, Tax & Customs Authority).\n\nSteps for Saudi import customs clearance:\n1. Arrival of vessel at Saudi port (Jeddah, Dammam, etc.)\n2. Customs broker files **Bill of Entry** via Fasah system\n3. ZATCA reviews documents and HS codes\n4. Duty and VAT assessment (5% VAT + import duty by HS code)\n5. Physical inspection (if flagged)\n6. Duty payment\n7. Release order issued\n8. Cargo collected from port\n\nBejoice holds **AEO (Authorized Economic Operator)** status, enabling faster clearance and priority lanes at Saudi ports.`,
  },
  {
    id: 'hs-codes',
    topic: 'HS Codes',
    tags: ['hs code', 'harmonized system', 'tariff code', 'commodity code', 'classification'],
    content: `**HS Code (Harmonized System Code)** is a 6–10 digit international code that classifies every traded product. Saudi Customs uses HS codes to determine:\n• Import duty rate\n• Whether a product requires special permits or certifications\n• Statistical tracking\n\nThe first 6 digits are international standard; Saudi Arabia adds additional digits for local specificity. Incorrect HS codes lead to wrong duties, delays, or seizure of cargo.\n\nBejoice's customs team reviews and verifies all HS codes before filing to prevent costly errors.`,
  },

  // ── CONTAINERISATION ─────────────────────────────────────────
  {
    id: 'fcl-lcl',
    topic: 'FCL vs LCL',
    tags: ['fcl', 'lcl', 'full container', 'less than container', 'container load', 'consolidation', 'groupage'],
    content: `**FCL (Full Container Load):** You rent the entire container exclusively for your cargo. The container goes from shipper to consignee without being opened.\n• Best for: cargo ≥ 15 CBM, high-value goods, dangerous goods, fragile items\n• Faster transit, lower risk of damage, more cost-effective per CBM at volume\n\n**LCL (Less than Container Load):** Your cargo shares a container with other shippers' cargo. Also called "groupage" or "consolidation."\n• Best for: cargo < 15 CBM, small shipments, testing new markets\n• Charged per CBM (cubic metre) or per tonne — whichever is higher\n• Additional handling = slightly higher damage risk\n• Transit may be longer due to consolidation/deconsolidation\n\nAs a rule of thumb: if your cargo is over 15 CBM, FCL is usually more cost-effective.`,
  },
  {
    id: 'container-types',
    topic: 'Container Types',
    tags: ['container types', 'dry van', 'reefer', 'flat rack', 'open top', 'tank container', 'roro', 'container specifications', '20ft', '40ft', 'high cube', 'dimensions'],
    content: `**Standard Container Types:**\n\n🔲 **Dry Van (GP)** — General purpose, enclosed box\n• 20ft: 5.9m L × 2.35m W × 2.39m H | 33.2 m³ capacity | 21,700 kg max cargo\n• 40ft: 12.03m L × 2.35m W × 2.39m H | 67.7 m³ capacity | 26,780 kg max cargo\n• 40ft HC: 12.03m L × 2.35m W × 2.69m H | 76.4 m³ capacity | 26,460 kg max cargo\n\n❄️ **Reefer** — Temperature-controlled (-25°C to +25°C)\n• Used for: perishables, pharma, chemicals, food\n• 20ft and 40ft sizes available\n\n🏗️ **Flat Rack** — No walls or roof, collapsible sides\n• Used for: heavy machinery, vehicles, oversized cargo, project cargo\n\n🔓 **Open Top** — No roof, tarpaulin cover\n• Used for: tall cargo exceeding standard height (cranes, pipes, coils)\n\n🛢️ **Tank Container** — For liquids and gases (chemicals, wine, food-grade)\n\n🚗 **RoRo (Roll-on/Roll-off)** — Vehicles and wheeled cargo driven on/off the vessel`,
  },
  {
    id: 'container-sizes',
    topic: 'Container Dimensions',
    tags: ['container dimensions', '20ft dimensions', '40ft dimensions', 'high cube dimensions', 'cbm', 'container capacity', 'container weight'],
    content: `**Container Internal Dimensions & Capacities:**\n\n| Type | Internal L | Internal W | Internal H | Volume | Max Cargo |
|------|-----------|-----------|-----------|--------|-----------|
| 20ft Dry | 5.90m | 2.35m | 2.39m | 33.2 m³ | 21,700 kg |
| 40ft Dry | 12.03m | 2.35m | 2.39m | 67.7 m³ | 26,780 kg |
| 40ft HC | 12.03m | 2.35m | 2.69m | 76.4 m³ | 26,460 kg |
| 20ft Reefer | 5.49m | 2.27m | 2.25m | 28.2 m³ | 21,600 kg |
| 40ft Reefer | 11.58m | 2.28m | 2.27m | 59.8 m³ | 26,680 kg |\n\n**Choosing the right size:** Under 25 CBM → 20ft. Over 25 CBM → 40ft. Tall items → 40HC. Temperature-sensitive → Reefer. Oversized → Flat Rack or Open Top.`,
  },

  // ── DEMURRAGE & DETENTION ───────────────────────────────────
  {
    id: 'demurrage-detention-definition',
    topic: 'Demurrage & Detention',
    tags: ['demurrage', 'detention', 'free days', 'per diem', 'port charges', 'storage', 'delay charges'],
    content: `**Demurrage** — Charged by the shipping line when the importer doesn't collect/clear the cargo from the **port/terminal** within the free days allowed.\n• It's a container occupancy charge at the port\n• Free days: typically 3–7 days at Saudi ports after vessel arrival\n• After free days: charged per container per day\n\n**Detention** — Charged when the importer doesn't return the empty container to the shipping line's depot within the free days after picking it up from port.\n• Free days for return: typically 5–14 days\n• After free days: charged per container per day\n\nKey difference: **Demurrage = container sitting at port. Detention = empty container not returned.**\n\nBoth charges can escalate quickly. Bejoice monitors free day expiry and proactively alerts clients to avoid unnecessary costs.`,
  },
  {
    id: 'demurrage-rates-ksa',
    topic: 'Saudi Arabia Demurrage Rates',
    tags: ['demurrage rates', 'saudi demurrage', 'jeddah demurrage', 'dammam demurrage', 'ksa port charges', 'port charges saudi', 'ksa demurrage'],
    content: `**Saudi Arabia Port Demurrage (Official Rates from Bejoice Orientation):**\n\n• Free time: **5 days** to clear cargo from port premises\n• If Bayan (Import Entry) is NOT filed within **3 days of vessel arrival** → demurrage starts from vessel arrival date\n• Demurrage rate: **SAR 20 per day per gross tonne** (including container tare weight)\n• Charged directly by port authorities (not shipping line)\n\nExample: A 20ft container with 20 gross tonnes × SAR 20/day = SAR 400/day after free days.\n\nBejoice average customs clearance: 1–3 days, well within the 5-day free period. Bejoice holds AEO status for priority clearance lanes.`,
  },
  {
    id: 'demurrage-rates-uae',
    topic: 'UAE Demurrage Rates',
    tags: ['uae demurrage', 'dubai demurrage', 'jebel ali demurrage', 'abu dhabi demurrage', 'uae port charges', 'aed demurrage'],
    content: `**UAE Port Demurrage — Official Tariff (AED per container per day):**\n\nFree Time: Dry = 5 days | Flat/Open Top = 3 days | Reefer = 3 days | IMO = 3 days\n\n**Standard (Dry Containers):**\n• Days 6–9: 20ft = 80 AED | 40ft/45ft = 160 AED\n• Days 10–18: 20ft = 160 AED | 40ft/45ft = 320 AED\n• Day 19+: 20ft = 320 AED | 40ft/45ft = 640 AED\n\n**Reefer:**\n• Days 4–7: 20ft = 200 AED | 40ft = 400 AED\n• Days 8–15: 20ft = 400 AED | 40ft = 800 AED\n• Day 16+: 20ft = 800 AED | 40ft = 1,600 AED\n\n**Flat Rack / Open Top:**\n• Days 4–7: 20ft = 100 AED | 40ft = 150 AED\n• Days 8–15: 20ft = 200 AED | 40ft = 300 AED\n• Day 16+: 20ft = 300 AED | 40ft = 600 AED\n\n**IMO (Dangerous Goods):**\n• Days 4–7: 20ft = 80 AED | 40ft = 160 AED\n• Days 8–15: 20ft = 160 AED | 40ft = 320 AED\n• Day 16+: 20ft = 320 AED | 40ft = 640 AED`,
  },
  {
    id: 'demurrage-rates-oman',
    topic: 'Oman Demurrage Rates',
    tags: ['oman demurrage', 'muscat demurrage', 'salalah demurrage', 'oman port charges', 'omr demurrage'],
    content: `**Oman Port Demurrage — Official Tariff (OMR per container per day):**\n\nFree Time: Dry = 5 days | Flat/Open Top = 3 days | Reefer = 3 days | IMO = 3 days\n\n**Standard (Dry Containers):**\n• Days 6–9: 20ft = 8 OMR | 40ft/45ft = 16 OMR\n• Days 10–18: 20ft = 16 OMR | 40ft/45ft = 32 OMR\n• Day 19+: 20ft = 32 OMR | 40ft/45ft = 64 OMR\n\n**Reefer:**\n• Days 4–7: 20ft = 20 OMR | 40ft = 40 OMR\n• Days 8–15: 20ft = 40 OMR | 40ft = 80 OMR\n• Day 16+: 20ft = 80 OMR | 40ft = 160 OMR\n\n**Flat Rack / Open Top:**\n• Days 4–7: 20ft = 15 OMR | 40ft = 30 OMR\n• Days 8–15: 20ft = 30 OMR | 40ft = 60 OMR\n• Day 16+: 20ft = 60 OMR | 40ft = 120 OMR\n\n**IMO (Dangerous Goods):**\n• Days 4–7: 20ft = 8 OMR | 40ft = 16 OMR\n• Days 8–15: 20ft = 16 OMR | 40ft = 32 OMR\n• Day 16+: 20ft = 32 OMR | 40ft = 64 OMR`,
  },
  {
    id: 'demurrage-rates-qatar',
    topic: 'Qatar Demurrage Rates',
    tags: ['qatar demurrage', 'doha demurrage', 'hamad port demurrage', 'qatar port charges', 'qar demurrage', 'gcc demurrage'],
    content: `**Qatar Port Demurrage — Official Tariff (QAR per container per day):**\n\nFree Time: Dry = 5 days | Flat/Open Top = 3 days | Reefer = 3 days | IMO = 3 days\n\n**Standard (Dry Containers):**\n• Days 6–9: 20ft = 80 QAR | 40ft/45ft = 160 QAR\n• Days 10–18: 20ft = 160 QAR | 40ft/45ft = 320 QAR\n• Day 19+: 20ft = 320 QAR | 40ft/45ft = 640 QAR\n\n**Reefer:**\n• Days 4–7: 20ft = 200 QAR | 40ft = 400 QAR\n• Days 8–15: 20ft = 400 QAR | 40ft = 800 QAR\n• Day 16+: 20ft = 800 QAR | 40ft = 1,600 QAR\n\n**Flat Rack / Open Top:**\n• Days 4–7: 20ft = 100 QAR | 40ft = 200 QAR\n• Days 8–15: 20ft = 200 QAR | 40ft = 400 QAR\n• Day 16+: 20ft = 400 QAR | 40ft = 800 QAR\n\n**IMO (Dangerous Goods):**\n• Days 4–7: 20ft = 80 QAR | 40ft = 160 QAR\n• Days 8–15: 20ft = 160 QAR | 40ft = 320 QAR\n• Day 16+: 20ft = 320 QAR | 40ft = 640 QAR`,
  },

  {
    id: 'detention-detail',
    topic: 'Detention Charges',
    tags: ['detention', 'empty container return', 'container return', 'detention charges', 'per diem', 'free days detention', 'export detention', 'import detention'],
    content: `**Detention** is charged by the shipping line when the consignee delays returning the empty container to the operator's depot/yard after the allocated free time.\n\n**Import Detention:** Container is picked up from port. Consignee must unload and return the empty container within free days.\n• Typical free days: 5–7 days after gate-out from port\n• Once free days lapse, detention is charged per day until empty container is returned\n\n**Export Detention:** Container is dispatched/picked up for loading. If not returned to port and loaded onto vessel within allocated time, detention is charged.\n• Typical free days: 5 days for pick-up, loading, and returning to port\n• Counts from container pick-up until vessel loading\n\n**Key distinction from Demurrage:**\n• Demurrage = container sitting AT the PORT (not yet picked up)\n• Detention = container is OUTSIDE the port, with consignee/shipper\n\nBejoice tracks both demurrage and detention free days on every shipment and sends early warning alerts 48 hours before expiry.`,
  },
  {
    id: 'sea-import-procedure-detailed',
    topic: 'Sea Import Procedure Detailed',
    tags: ['sea import steps', 'import procedure', 'freight process steps', 'how to ship', 'shipment process', 'bl instructions', 'arrival notice', 'pre-alert'],
    content: `**Bejoice Sea Import Procedure — Detailed Steps:**\n\n1. Client sends cargo inquiry to Bejoice sales\n2. Operations checks rates; prepares quotation (ocean freight + charges + customs)\n3. Client confirms; Sales Coordinator acknowledges and provides: agent details, vessel schedule, carrier details\n4. **Job Opening:** Sea Import job opened in system; shipment tracked daily\n5. **If cargo ready:** Bejoice follows up for vessel schedule and booking confirmation\n6. **BL Instructions** sent to origin agent once booking confirmed\n7. **EXW Terms:** If Ex-Works, Bejoice arranges loading/pick-up at seller's factory\n8. Bejoice checks shipment sailed as per schedule; updates customer\n9. **Draft Documents:** Bejoice follows up for draft HBL/MBL; sends HBL copy to consignee\n10. **Document Check:** Bejoice compares HBL vs MBL — container numbers, weight, volume, description must match\n11. **Pre-alert Docs:** Final MBL/HBL + agent invoice (debit note) received\n12. **Invoice Check:** Buy rate vs sell rate verified for accuracy\n13. **MBL Status Check:** Original / SWB / Telex / Surrender / Express\n14. **Freight Collect:** If MBL is Freight Collect, Bejoice arranges payment at least 3 days before vessel arrival\n15. **Shipment Tracking:** Every 3 days; transshipment ports monitored closely\n16. **Arrival Notice:** Sent to customer 3 days before vessel arrival with HBL copy attached\n17. **Customs Clearance:** Bill of Entry filed via Fasah; duties paid\n18. **Delivery Order (DO):** Issued by shipping line after freight payment\n19. **Port Collection:** Cargo collected and delivered to client's warehouse`,
  },
  {
    id: 'letter-of-credit-detailed',
    topic: 'Letter of Credit Process',
    tags: ['letter of credit stages', 'lc process', 'lc parties', 'issuing bank', 'confirming bank', 'advising bank', 'applicant', 'beneficiary', 'lc documents'],
    content: `**Letter of Credit (LC) — Complete Process:**\n\n**Key Parties:**\n• **Applicant** — Buyer; requests LC from their bank specifying terms and conditions\n• **Issuing Bank** — Buyer's bank; issues and guarantees the LC\n• **Beneficiary** — Seller; receives payment when LC conditions are met\n• **Advising Bank** — Seller's bank; authenticates and forwards LC to seller\n• **Confirming Bank** — Adds its own guarantee on top of issuing bank's commitment\n\n**10 Stages of LC Performance:**\n1. Opening of Letter of Credit by Applicant's bank\n2. Mailing/transmission of LC to Beneficiary's bank\n3. Examination of LC terms by Exporter (seller)\n4. Amendments to LC (if needed — both parties must agree)\n5. Confirmation (if required)\n6. Shipment of goods\n7. Presentation of documents to beneficiary's bank\n8. Examination of documents by Issuing Bank\n9. Handling of discrepant documents (if any mismatch)\n10. Settlement of payment\n\n**Why LC requires Original B/L:** The Original B/L is the document of title — it must be surrendered to the bank to transfer cargo ownership to the buyer. Without OBL, goods cannot be released.\n\n**Example (from Bejoice orientation):** Saudi Lighting imports $500,000 of goods from China. Saudi British Bank issues LC. China Trading Company ships goods and presents OBL + documents to their bank. Saudi British Bank transfers $500,000 upon document verification. LC fees: typically 1–8% of face value.`,
  },
  // ── INCO TERMS ───────────────────────────────────────────────
  {
    id: 'incoterms-overview',
    topic: 'INCO Terms Overview',
    tags: ['incoterms', 'inco terms', 'trade terms', 'exw', 'fob', 'cif', 'ddp', 'dap', 'cfr', 'cpt', 'cip', 'fca', 'fas', 'dpu', 'delivery terms'],
    content: `**INCO Terms (International Commercial Terms)** define the responsibilities of buyer and seller in international trade — who arranges and pays for transportation, insurance, and customs at each stage.\n\nThere are **11 INCO Terms** (Incoterms® 2020), grouped by transport mode:\n\n**Any Transport Mode:**\n• EXW — Ex Works\n• FCA — Free Carrier\n• CPT — Carriage Paid To\n• CIP — Carriage and Insurance Paid To\n• DAP — Delivered At Place\n• DPU — Delivered at Place Unloaded\n• DDP — Delivered Duty Paid\n\n**Sea & Inland Waterway Only:**\n• FAS — Free Alongside Ship\n• FOB — Free On Board\n• CFR — Cost and Freight\n• CIF — Cost, Insurance and Freight\n\nMost Saudi imports use **FOB** or **CIF**. For full-service convenience, **DDP** means the seller handles everything.`,
  },
  {
    id: 'incoterms-seller-buyer',
    topic: 'INCO Terms Seller Buyer Responsibility',
    tags: ['incoterms responsibility', 'who pays freight', 'seller responsibility', 'buyer responsibility', 'fob vs cif', 'exw vs ddp'],
    content: `**INCO Terms: Who Bears Cost and Risk**\n\n| Term | Seller Handles | Buyer Handles |\n|------|---------------|---------------|\n| **EXW** | Nothing — just makes goods available | Everything from seller's door |\n| **FCA** | Export customs + delivery to carrier | Main carriage + insurance + import |\n| **FAS** | Export customs + to port alongside ship | Loading + main carriage + import |\n| **FOB** | Export customs + loading onto vessel | Main carriage + insurance + import |\n| **CFR** | Export customs + freight to destination | Insurance + import customs |\n| **CIF** | Export customs + freight + insurance to destination | Import customs |\n| **CPT** | Export + freight to named destination | Insurance + import |\n| **CIP** | Export + freight + insurance to destination | Import |\n| **DAP** | Export + freight + insurance to destination | Import duties + unloading |\n| **DPU** | Export + freight + insurance + unloading | Import duties |\n| **DDP** | EVERYTHING including import duties | Just receives at destination |\n\n**Risk transfers** at the named point in each term.`,
  },
  {
    id: 'incoterms-fob-detail',
    topic: 'FOB Incoterm',
    tags: ['fob', 'free on board', 'fob shipping', 'fob origin', 'fob destination'],
    content: `**FOB — Free On Board (named port of shipment)**\n\nUnder FOB, the seller is responsible for:\n✅ Packing, labeling, and preparing the goods\n✅ Export customs clearance and export duties\n✅ Delivering goods on board the vessel at the named port\n\nThe buyer (importer) is responsible for:\n✅ Ocean freight from origin port\n✅ Cargo insurance (marine insurance)\n✅ Import customs clearance and import duties\n✅ Delivery to final destination\n\nFOB is one of the most common terms for Saudi imports. Risk transfers to the buyer once goods are on board the vessel.\n\n**Example:** "FOB Shanghai" — Seller delivers to Shanghai port; Bejoice (as buyer's freight forwarder) arranges the ocean freight to Jeddah or Dammam.`,
  },
  {
    id: 'incoterms-cif-detail',
    topic: 'CIF Incoterm',
    tags: ['cif', 'cost insurance freight', 'cif shipping', 'cif vs fob'],
    content: `**CIF — Cost, Insurance and Freight (named port of destination)**\n\nUnder CIF, the seller is responsible for:\n✅ Packing, labeling, and preparing the goods\n✅ Export customs and export duties\n✅ Loading onto vessel\n✅ Ocean freight to the destination port\n✅ Minimum cargo insurance (typically 110% of invoice value)\n\nThe buyer (importer) is responsible for:\n✅ Import customs clearance and import duties\n✅ Unloading at destination\n✅ Delivery to final warehouse/destination\n\nRisk transfers to buyer once goods are on board the vessel at origin (same as FOB, despite seller paying freight).\n\n**Note for Saudi imports:** Under CIF, the seller selects the freight forwarder and shipping line — the buyer has less control. FOB gives the importer more control over freight costs and timing.`,
  },
  {
    id: 'incoterms-ddp-detail',
    topic: 'DDP Incoterm',
    tags: ['ddp', 'delivered duty paid', 'ddp shipping', 'ddp vs dap', 'all inclusive shipping'],
    content: `**DDP — Delivered Duty Paid (named place of destination)**\n\nThe maximum obligation for the seller. The seller handles EVERYTHING:\n✅ All export formalities and costs\n✅ Ocean/air freight\n✅ Insurance\n✅ Import customs clearance at destination\n✅ All import duties and VAT\n✅ Delivery to the buyer's door\n\nThe buyer simply receives the goods.\n\nDDP is the most buyer-friendly term — but the seller bears all cost and risk. It's common for e-commerce and B2C shipments.\n\n**Important for Saudi imports:** DDP requires the foreign seller to be registered for Saudi VAT or work with a Saudi fiscal representative. Bejoice can advise on DDP implications for Saudi imports.`,
  },

  // ── SEA IMPORT PROCEDURE ─────────────────────────────────────
  {
    id: 'sea-import-procedure',
    topic: 'Sea Import Procedure',
    tags: ['sea import procedure', 'import process', 'how to import', 'import steps', 'freight process', 'shipping procedure'],
    content: `**Sea Import Procedure — Step by Step:**\n\n1. **Inquiry** — Client provides cargo details (commodity, weight, volume, origin, destination)\n2. **Pricing** — Bejoice requests rates from shipping lines for FCL or LCL\n3. **Quotation** — Bejoice sends a detailed quotation including: ocean freight, origin charges, destination charges, customs clearance fees, delivery\n4. **Booking Confirmation** — Client confirms; Bejoice places booking with shipping line\n5. **Pre-shipment Documentation** — Shipper prepares: Commercial Invoice, Packing List, Certificate of Origin\n6. **Cargo Loading** — Goods stuffed into container; EIR issued at port\n7. **Bill of Lading Issuance** — Shipping line issues B/L after vessel departure\n8. **Pre-arrival Notification** — Bejoice notifies client; advises on document requirements\n9. **Customs Filing** — Bill of Entry filed via Fasah system (Saudi platform)\n10. **Duty Payment** — Customs duties and VAT paid\n11. **Cargo Release** — Delivery Order issued by shipping line\n12. **Port Collection** — Cargo collected from port and delivered to client's warehouse`,
  },

  // ── LETTER OF CREDIT ─────────────────────────────────────────
  {
    id: 'letter-of-credit',
    topic: 'Letter of Credit',
    tags: ['letter of credit', 'lc', 'l/c', 'documentary credit', 'bank guarantee', 'trade finance', 'lc payment'],
    content: `**Letter of Credit (LC / L/C)** is a payment mechanism used in international trade where a bank guarantees payment to the seller, provided the seller meets all conditions stated in the LC.\n\n**Parties involved:**\n• **Applicant** — The buyer who requests the LC from their bank\n• **Issuing Bank** — The buyer's bank that issues and guarantees the LC\n• **Beneficiary** — The seller/exporter who receives payment\n• **Advising Bank** — The seller's bank that authenticates the LC\n• **Confirming Bank** — (if applicable) Additional bank that guarantees payment\n\n**LC Process:**\n1. Buyer and seller agree on LC terms in the sales contract\n2. Buyer applies to their bank (Issuing Bank) to open the LC\n3. Issuing Bank sends LC to seller's bank (Advising Bank)\n4. Seller ships goods and presents conforming documents to the bank\n5. Bank pays seller (at sight or after agreed period)\n6. Bank releases documents to buyer for customs clearance\n\nLC requires the **original Bill of Lading** — which is why negotiable OBL is critical for LC transactions.`,
  },

  // ── CBM CALCULATION ──────────────────────────────────────────
  {
    id: 'cbm-calculation',
    topic: 'CBM Calculation',
    tags: ['cbm', 'cubic metre', 'volume weight', 'volumetric weight', 'chargeable weight', 'how to calculate cbm', 'freight calculation'],
    content: `**CBM (Cubic Metre)** is the standard unit for measuring cargo volume in sea freight.\n\n**How to calculate CBM:**\nLength (m) × Width (m) × Height (m) = CBM\n\nExample: A box 1.2m × 0.8m × 0.9m = 0.864 CBM\n\n**For LCL sea freight:** You're charged per CBM or per tonne — whichever is **higher** (Revenue Tonne / W/M).\n• 1 CBM = 1 freight tonne for comparison purposes\n• If your cargo is 5 CBM but weighs 6 tonnes → charged on 6 tonnes\n• If your cargo is 5 CBM but weighs 2 tonnes → charged on 5 CBM\n\n**Container volumes:**\n• 20ft: ~33 CBM usable\n• 40ft: ~67 CBM usable\n• 40HC: ~76 CBM usable\n\nFor air freight, volumetric weight = (L cm × W cm × H cm) ÷ 6000.`,
  },

  // ── SAUDI PORTS ──────────────────────────────────────────────
  {
    id: 'saudi-ports',
    topic: 'Saudi Arabian Ports',
    tags: ['saudi ports', 'jeddah port', 'dammam port', 'jubail port', 'yanbu port', 'jeddah islamic port', 'king abdulaziz port', 'fasah'],
    content: `**Major Saudi Arabian Seaports:**\n\n🚢 **Jeddah Islamic Port** — Red Sea; Saudi Arabia's largest port; handles ~70% of sea imports\n• Main gateway for goods from Europe, Asia, Americas\n• Connected to JEDDAH dry port (ICD)\n\n🚢 **King Abdulaziz Port (Dammam)** — Arabian Gulf; primary port for Eastern Province\n• Serves industrial and petrochemical supply chains\n• Proximity to ARAMCO and SABIC facilities\n\n🚢 **King Fahd Industrial Port (Jubail)** — Largest industrial port; bulk and liquid cargo\n\n🚢 **Yanbu Commercial Port** — Red Sea; industrial and project cargo\n\n🚢 **Ras Al Khair Port** — Mining and minerals\n\n**Fasah** is the Saudi Customs electronic portal where all customs declarations (Bills of Entry) are filed. Bejoice is a registered Fasah user with direct filing capability.`,
  },

  // ── SABER / SASO / SFDA ──────────────────────────────────────
  {
    id: 'saber-saso',
    topic: 'SABER & SASO Conformity',
    tags: ['saber', 'saso', 'conformity certificate', 'product certificate', 'saudi standards', 'sfda', 'product clearance'],
    content: `**SABER** is Saudi Arabia's electronic platform for product conformity certificates — mandatory for most regulated products entering Saudi Arabia.\n\n**How SABER works:**\n1. Importer/exporter registers product on SABER platform\n2. Selects an accredited Conformity Assessment Body (CAB)\n3. CAB reviews product documentation and issues a **Product Certificate (PC)**\n4. A **Shipment Certificate (SC)** is generated per shipment\n5. The SC is linked to the customs declaration — no SC = cargo cannot clear\n\n**SASO** (Saudi Standards, Metrology and Quality Organization) is the regulatory body that manages SABER.\n\n**SFDA** (Saudi Food and Drug Authority) — regulates food, pharmaceuticals, medical devices, and cosmetics. SFDA approval required before customs clearance.\n\nBejoice monitors SABER requirements and advises clients on conformity compliance for their specific products.`,
  },

  // ── INSURANCE ───────────────────────────────────────────────
  {
    id: 'cargo-insurance',
    topic: 'Cargo Insurance',
    tags: ['cargo insurance', 'marine insurance', 'insurance', 'icc a', 'icc b', 'icc c', 'all risk', 'coverage'],
    content: `**Marine Cargo Insurance** protects cargo against loss or damage during transit.\n\n**Coverage Types (Institute Cargo Clauses):**\n• **ICC (A) — All Risks:** Broadest coverage; covers all physical loss or damage except specifically excluded causes\n• **ICC (B):** Named perils — fire, explosion, sinking, collision, water damage, earthquake\n• **ICC (C):** Most limited — fire, explosion, sinking/capsizing only\n\n**What's typically excluded:** Inherent vice, improper packing, delay, nuclear contamination, war (can be added as endorsement)\n\n**Insured Value:** Usually 110% of CIF invoice value (gives 10% margin for additional costs in case of claim)\n\n**Recommendation:** Always insure at ICC (A) for high-value or fragile cargo. Bejoice can arrange comprehensive cargo insurance as part of the freight package.`,
  },

  // ── GENERAL FREIGHT KNOWLEDGE ───────────────────────────────
  {
    id: 'freight-costs-components',
    topic: 'Freight Cost Components',
    tags: ['freight costs', 'what is included', 'ocean freight charges', 'baf', 'caf', 'thc', 'origin charges', 'destination charges', 'all in rate'],
    content: `**Sea Freight Cost Components:**\n\n**Origin Charges:**\n• Origin THC (Terminal Handling Charge)\n• Documentation fee\n• Bill of Lading fee\n• Export customs clearance\n• Container stuffing (for LCL)\n\n**Ocean Freight:**\n• Base Ocean Freight (BOF)\n• BAF (Bunker Adjustment Factor) — fuel surcharge\n• CAF (Currency Adjustment Factor)\n• PSS (Peak Season Surcharge) — during busy seasons\n• GRI (General Rate Increase)\n\n**Destination Charges (Saudi Arabia):**\n• Destination THC\n• Delivery Order (DO) fee\n• Port security fees\n• Import customs clearance\n• Duty and VAT (duty varies by HS code; VAT = 5%)\n• Inland delivery (port to warehouse)\n\nBejoice provides **all-in quotations** showing every charge transparently. No hidden fees.`,
  },
  {
    id: 'transit-times',
    topic: 'Sea Freight Transit Times',
    tags: ['transit time', 'how long', 'shipping time', 'sea transit', 'days', 'lead time', 'schedule'],
    content: `**Estimated Sea Freight Transit Times to Saudi Arabia (port to port):**\n\n| Origin | Jeddah | Dammam |\n|--------|--------|--------|\n| China (Shanghai/Shenzhen) | 18–25 days | 22–30 days |\n| India (Mumbai/Chennai) | 10–16 days | 14–20 days |\n| Europe (Rotterdam/Hamburg) | 20–28 days | 25–32 days |\n| USA (East Coast) | 28–35 days | 32–38 days |\n| USA (West Coast) | 20–28 days | 25–32 days |\n| Turkey (Istanbul) | 12–18 days | 15–22 days |\n| UAE (Jebel Ali) | 3–5 days | 1–3 days |\n\n*Note: Current Red Sea/Suez disruptions may add 10–14 days for Europe/Americas routes via Cape of Good Hope.*\n\nAdd 2–5 days for customs clearance + inland delivery. Bejoice provides door-to-door estimates including all stages.`,
  },
  {
    id: 'dangerous-goods',
    topic: 'Dangerous Goods',
    tags: ['dangerous goods', 'hazardous cargo', 'imdg', 'msds', 'sds', 'un number', 'hazmat', 'dg cargo'],
    content: `**Dangerous Goods (DG)** in sea freight are regulated by the **IMDG Code** (International Maritime Dangerous Goods Code).\n\n**9 IMDG Classes:**\n1. Explosives\n2. Gases (compressed, liquefied, dissolved)\n3. Flammable liquids\n4. Flammable solids\n5. Oxidizers and organic peroxides\n6. Toxic and infectious substances\n7. Radioactive materials\n8. Corrosives\n9. Miscellaneous dangerous goods\n\n**Documents required:**\n• Dangerous Goods Declaration (DGD)\n• Material Safety Data Sheet (MSDS / SDS)\n• UN Number and proper shipping name\n• Packing Group (I, II, or III)\n\nNot all shipping lines accept all DG classes. Bejoice specializes in DG shipping to Saudi Arabia and handles all regulatory requirements.`,
  },
  {
    id: 'bejoice-sea-freight-services',
    topic: 'Bejoice Sea Freight Services',
    tags: ['bejoice sea freight', 'what does bejoice offer', 'sea freight service', 'ocean freight service', 'bejoice services'],
    content: `**Bejoice Sea Freight Services:**\n\n✅ **FCL (Full Container Load)** — All container sizes: 20ft, 40ft, 40HC, Reefer, Flat Rack, Open Top\n✅ **LCL (Less than Container Load)** — Consolidation from all major origins\n✅ **Project Cargo** — Heavy lift, ODC, OOG sea shipments\n✅ **RoRo** — Vehicle and wheeled machinery shipping\n✅ **Reefer Cargo** — Temperature-controlled shipments\n✅ **Dangerous Goods** — IMDG certified handling\n✅ **Customs Clearance** — Full Saudi customs service via Fasah\n✅ **Port to Door Delivery** — Final mile delivery across Saudi Arabia\n✅ **Documentation** — B/L, COO, SABER, SFDA handling\n✅ **Insurance** — Comprehensive cargo insurance\n\nBejoice serves all Saudi ports: Jeddah Islamic Port, Dammam, Jubail, Yanbu. Contact: info@bejoiceshipping-ksa.com`,
  },
]

// ── Retrieval Function ──────────────────────────────────────────
/**
 * Retrieve top-N most relevant chunks for a given query.
 * Uses keyword overlap scoring (frontend-safe, no backend needed).
 * @param {string} query - User's message (lowercased internally)
 * @param {number} topN - Number of chunks to return
 * @param {number} threshold - Minimum score to include a chunk
 * @returns {Array} - Scored chunks sorted by relevance
 */
export function retrieveChunks(query, topN = 2, threshold = 1) {
  const q = query.toLowerCase()

  // Tokenize: remove stop words, keep meaningful tokens ≥ 3 chars
  const stopWords = new Set([
    'a','an','the','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might','shall','can',
    'need','dare','ought','used','i','me','my','we','our','you','your','he','his',
    'she','her','it','its','they','their','what','which','who','whom','this','that',
    'these','those','am','at','by','for','in','of','on','to','up','as','if','so',
    'or','and','but','not','how','when','where','why','with','from','tell','about',
    'give','me','us','please','want','know','explain','difference','between','mean',
  ])
  const tokens = q.split(/\W+/).filter(t => t.length >= 3 && !stopWords.has(t))

  const scored = KNOWLEDGE_CHUNKS.map(chunk => {
    let score = 0
    const tagStr = chunk.tags.join(' ').toLowerCase()
    const contentLower = chunk.content.toLowerCase()

    // 1. Exact multi-word tag phrase match in query — highest weight
    for (const tag of chunk.tags) {
      const tagLower = tag.toLowerCase()
      if (q.includes(tagLower)) {
        score += tagLower.includes(' ') ? 8 : 5  // multi-word tags score higher
      }
    }

    // 2. Each query token matches inside a tag string
    for (const token of tokens) {
      if (tagStr.includes(token)) score += 2
    }

    // 3. Query token appears in chunk content (weaker signal)
    for (const token of tokens) {
      if (contentLower.includes(token)) score += 0.5
    }

    // 4. Bonus: chunk topic word appears directly in query
    if (q.includes(chunk.topic.toLowerCase())) score += 3

    return { chunk, score }
  })

  return scored
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(s => s.chunk)
}
