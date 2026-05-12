'use client';
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'
import emailjs from '@emailjs/browser'
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, isValidPhone } from '@/utils/emailService'

const footerLinks = {
  Company: ['Why Bejoice', 'Certifications', 'Key Markets', 'Careers'],
  Support: ['Track Shipment', 'Get a Quote', 'Contact Us', 'Our Offices'],
}

const POLICIES = {
  'Privacy Policy': {
    updated: 'May 2024',
    sections: [
      {
        title: '1. Who We Are',
        body: `Bejoice Global Logistics LLC ("Bejoice", "we", "our", or "us") is a freight forwarding and logistics company headquartered in Dammam, Kingdom of Saudi Arabia, with offices in Dubai (UAE), India, and China. We are the data controller for personal information collected through this website and our services.\n\nRegistered address: Block A, Al Raja Avenue, 1st Floor, Office No. 2, Dammam 32234, Kingdom of Saudi Arabia.\nEmail: info@bejoiceshipping-ksa.com | Phone: +966 13 823 3461`,
      },
      {
        title: '2. Information We Collect',
        body: `We collect the following categories of personal data:\n\nIdentity & Contact Data: Full name, job title, company name, email address, phone number, and postal address — provided when you submit a quote request, contact form, booking, or newsletter sign-up.\n\nShipment & Commercial Data: Origin/destination details, cargo descriptions, weights, dimensions, incoterms, commercial invoice values, and related documentation necessary to provide logistics services.\n\nTechnical Data: IP address, browser type and version, device identifiers, operating system, pages visited, time spent on pages, referring URLs, and click-stream data — collected automatically via cookies and analytics tools.\n\nCommunication Data: Records of emails, calls, and messages you exchange with us, including support enquiries.\n\nFinancial Data: Bank account or payment details where required to process transactions — handled securely and never stored beyond the period necessary for the transaction.`,
      },
      {
        title: '3. Legal Basis for Processing',
        body: `We process your personal data on the following legal grounds under the Saudi Personal Data Protection Law (PDPL) and, where applicable, equivalent international frameworks:\n\n• Contractual Necessity: To perform a contract with you or to take steps at your request before entering a contract (e.g., processing a shipment, providing a quote).\n• Legitimate Interests: To operate, improve, and secure our website and services, and to conduct direct marketing to existing customers, provided your interests and fundamental rights do not override ours.\n• Legal Obligation: To comply with applicable laws, regulations, customs requirements, and court orders.\n• Consent: For marketing communications and non-essential cookies, where we have obtained your prior consent, which you may withdraw at any time.`,
      },
      {
        title: '4. How We Use Your Information',
        body: `We use your personal data to:\n\n• Provide, manage, and deliver freight forwarding, customs clearance, warehousing, heavy lift, and related logistics services.\n• Generate quotes and respond to enquiries in a timely manner.\n• Process bookings and coordinate with carriers, customs authorities, and port agents on your behalf.\n• Send transactional communications (booking confirmations, shipment updates, invoices).\n• Send marketing communications about our services, industry insights, and promotions — only where you have provided consent or we have a legitimate interest and you have not opted out.\n• Conduct analytics to understand website usage, improve functionality, and personalise your experience.\n• Detect, investigate, and prevent fraud, security incidents, and other illegal activities.\n• Comply with legal, regulatory, and customs obligations in Saudi Arabia and internationally.`,
      },
      {
        title: '5. Data Sharing & Disclosure',
        body: `We do not sell, rent, or trade your personal data. We may share it with:\n\n• Service Partners: Shipping lines, airlines, road carriers, customs brokers, port agents, freight handlers, and warehousing providers — strictly to fulfil your logistics requirements.\n• Technology Providers: Website hosting, cloud services, CRM, email delivery, analytics, and customer support platforms — under strict data processing agreements with confidentiality and security obligations.\n• Professional Advisors: Lawyers, auditors, and insurers where necessary for legal compliance or dispute resolution.\n• Regulatory & Government Authorities: Saudi Customs (ZATCA), Saudi Ports Authority (Mawani), the National Data Management Office (NDMO), or other authorities when required by applicable law or court order.\n• Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction, subject to equivalent privacy protections.\n\nAll third parties are required to process your data securely and only for the specified purpose.`,
      },
      {
        title: '6. International Data Transfers',
        body: `As a global logistics operator, your data may be transferred to and processed in countries outside Saudi Arabia, including the UAE, India, and China, where our offices or service partners are located. We ensure that any such transfer is subject to appropriate safeguards — including contractual clauses, adequacy decisions, or equivalent protections — in line with PDPL requirements and international best practices.`,
      },
      {
        title: '7. Data Retention',
        body: `We retain personal data only for as long as necessary for the purposes set out in this policy:\n\n• Shipment and transactional records: 7 years, as required by Saudi commercial and customs law.\n• Enquiry and marketing data: 3 years from last interaction, or until you withdraw consent.\n• Technical/log data: Up to 12 months.\n• Financial records: 10 years in line with Saudi tax and accounting regulations.\n\nAfter the applicable retention period, data is securely deleted or anonymised.`,
      },
      {
        title: '8. Your Rights',
        body: `Under the Saudi Personal Data Protection Law (PDPL) and applicable regulations, you have the right to:\n\n• Access: Request a copy of the personal data we hold about you.\n• Correction: Request correction of inaccurate or incomplete data.\n• Deletion: Request deletion of your data where it is no longer necessary for the purpose it was collected, subject to legal retention requirements.\n• Restriction: Request that we restrict processing of your data in certain circumstances.\n• Data Portability: Receive your data in a structured, machine-readable format where technically feasible.\n• Object: Object to processing based on legitimate interests or for direct marketing at any time.\n• Withdraw Consent: Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing.\n\nTo exercise any of these rights, please contact us at info@bejoiceshipping-ksa.com. We will respond within 30 days. You also have the right to lodge a complaint with the Saudi National Data Management Office (NDMO).`,
      },
      {
        title: '9. Security',
        body: `We implement appropriate technical and organisational security measures to protect your personal data against unauthorised access, loss, alteration, or disclosure. These include:\n\n• TLS/SSL encryption for all data in transit.\n• Role-based access controls limiting data access to authorised personnel only.\n• Regular security assessments and vulnerability testing.\n• Secure data storage with encrypted backups.\n• Employee training on data protection and information security.\n\nIn the event of a data breach that poses a risk to your rights and freedoms, we will notify you and the relevant authorities as required by applicable law.`,
      },
      {
        title: '10. Children\'s Privacy',
        body: `Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us immediately and we will delete it promptly.`,
      },
      {
        title: '11. Changes to This Policy',
        body: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The updated version will be published on this page with a revised "Last Updated" date. We encourage you to review this policy periodically. Continued use of our website after changes constitutes acceptance of the updated policy.`,
      },
      {
        title: '12. Contact Us',
        body: `For any privacy-related questions, requests, or complaints:\n\nBejoice Global Logistics LLC\nBlock A, Al Raja Avenue, 1st Floor, Office No. 2\nDammam 32234, Kingdom of Saudi Arabia\nEmail: info@bejoiceshipping-ksa.com\nPhone: +966 13 823 3461`,
      },
    ],
    arSections: [
      {
        title: '١. من نحن',
        body: `شركة بيجويس جلوبال لوجستيكس ذ.م.م ("بيجويس"، "نحن"، "لنا"، أو "نا") هي شركة شحن وخدمات لوجستية يقع مقرها الرئيسي في الدمام، المملكة العربية السعودية، مع مكاتب في دبي (الإمارات العربية المتحدة)، والهند، والصين. نحن المتحكم في البيانات الشخصية المجمعة عبر هذا الموقع الإلكتروني وخدماتنا.\n\nالعنوان المسجل: المبنى أ، شارع الراجحي، الطابق الأول، مكتب رقم 2، الدمام 32234، المملكة العربية السعودية.\nالبريد الإلكتروني: info@bejoiceshipping-ksa.com | الهاتف: 3461 823 13 966+`,
      },
      {
        title: '٢. المعلومات التي نجمعها',
        body: `نجمع الفئات التالية من البيانات الشخصية:\n\nبيانات الهوية والتواصل: الاسم الكامل، والمسمى الوظيفي، واسم الشركة، وعنوان البريد الإلكتروني، ورقم الهاتف، والعنوان البريدي — يتم تقديمها عند إرسال طلب عرض أسعار أو نموذج تواصل أو حجز أو الاشتراك في النشرة الإخبارية.\n\nبيانات الشحنات والتجارة: تفاصيل المنشأ والوجهة، وأوصاف البضائع، والأوزان، والأبعاد، وشروط التسليم، وقيم الفواتير التجارية، والوثائق اللازمة لتقديم خدمات اللوجستيات.\n\nالبيانات التقنية: عنوان IP، ونوع المتصفح وإصداره، ومعرفات الجهاز، ونظام التشغيل، والصفحات المُزارة، والوقت المقضي عليها — يتم جمعها تلقائيًا عبر ملفات تعريف الارتباط وأدوات التحليلات.\n\nبيانات التواصل: سجلات رسائل البريد الإلكتروني والمكالمات والرسائل التي تتبادلها معنا، بما في ذلك استفسارات الدعم.\n\nالبيانات المالية: تفاصيل الحساب المصرفي أو الدفع حيثما يلزم معالجة المعاملات — يتم التعامل معها بأمان ولا تُخزَّن بعد انتهاء الفترة اللازمة للمعاملة.`,
      },
      {
        title: '٣. الأساس القانوني للمعالجة',
        body: `نعالج بياناتك الشخصية على الأسس القانونية التالية بموجب نظام حماية البيانات الشخصية السعودي (PDPL)، وحيثما ينطبق، الأطر الدولية المعادلة:\n\n• الضرورة التعاقدية: لتنفيذ عقد معك أو اتخاذ خطوات بناءً على طلبك قبل إبرام عقد، كمعالجة شحنة أو تقديم عرض أسعار.\n• المصالح المشروعة: لتشغيل موقعنا وخدماتنا وتحسينها وتأمينها، وإجراء التسويق المباشر للعملاء الحاليين، بشرط ألا تتغلب مصالحك وحقوقك الأساسية على مصالحنا.\n• الالتزام القانوني: للامتثال للقوانين والأنظمة ومتطلبات الجمارك والأوامر القضائية المعمول بها.\n• الموافقة: لمراسلات التسويق وملفات تعريف الارتباط غير الأساسية، حيثما حصلنا على موافقتك المسبقة، والتي يمكنك سحبها في أي وقت.`,
      },
      {
        title: '٤. كيف نستخدم معلوماتك',
        body: `نستخدم بياناتك الشخصية من أجل:\n\n• تقديم خدمات الشحن وإدارتها وتسليمها، بما في ذلك التخليص الجمركي والتخزين والرفع الثقيل والخدمات اللوجستية ذات الصلة.\n• إعداد عروض الأسعار والرد على الاستفسارات في الوقت المناسب.\n• معالجة الحجوزات والتنسيق مع شركات النقل والجهات الجمركية ووكلاء الموانئ نيابةً عنك.\n• إرسال مراسلات المعاملات كتأكيدات الحجز وتحديثات الشحنة والفواتير.\n• إرسال مراسلات تسويقية حول خدماتنا ورؤى الصناعة والعروض — فقط عند توفر موافقتك أو وجود مصلحة مشروعة وعدم اعتراضك.\n• إجراء التحليلات لفهم استخدام الموقع وتحسين وظائفه وتخصيص تجربتك.\n• اكتشاف الاحتيال والحوادث الأمنية والأنشطة غير القانونية والتحقيق فيها ومنعها.\n• الامتثال للالتزامات القانونية والتنظيمية والجمركية في المملكة العربية السعودية ودوليًا.`,
      },
      {
        title: '٥. مشاركة البيانات والإفصاح عنها',
        body: `لا نبيع بياناتك الشخصية ولا نؤجرها ولا نتاجر بها. يجوز لنا مشاركتها مع:\n\n• شركاء الخدمة: شركات الشحن البحري والجوي وناقلات الطريق ووسطاء الجمارك ووكلاء الموانئ ومناولي الشحن ومزودي خدمات التخزين — بشكل صارم لتلبية متطلباتك اللوجستية.\n• مزودو التكنولوجيا: استضافة المواقع والخدمات السحادية وإدارة علاقات العملاء وتسليم البريد الإلكتروني والتحليلات ومنصات دعم العملاء — بموجب اتفاقيات معالجة بيانات صارمة.\n• المستشارون المهنيون: المحامون والمدققون وشركات التأمين حيثما يكون ذلك ضروريًا للامتثال القانوني أو حل النزاعات.\n• السلطات التنظيمية والحكومية: هيئة الزكاة والضريبة والجمارك، وهيئة الموانئ السعودية، والهيئة الوطنية لإدارة البيانات، أو غيرها من الجهات عند الاقتضاء بموجب القانون أو أمر قضائي.\n• عمليات الأعمال: في حالة الاندماج أو الاستحواذ أو بيع الأصول، قد يتم نقل بياناتك كجزء من تلك المعاملة مع ضمانات خصوصية معادلة.\n\nيُطلب من جميع الأطراف الثالثة معالجة بياناتك بأمان وللغرض المحدد فحسب.`,
      },
      {
        title: '٦. نقل البيانات الدولية',
        body: `بوصفنا مشغلًا لوجستيًا عالميًا، قد يتم نقل بياناتك ومعالجتها في دول خارج المملكة العربية السعودية، بما في ذلك الإمارات العربية المتحدة والهند والصين، حيث تتواجد مكاتبنا أو شركاؤنا. نضمن أن أي نقل من هذا القبيل يخضع لضمانات مناسبة — بما في ذلك البنود التعاقدية وقرارات الكفاءة أو الحماية المعادلة — وفقًا لمتطلبات نظام حماية البيانات الشخصية والممارسات الدولية المثلى.`,
      },
      {
        title: '٧. الاحتفاظ بالبيانات',
        body: `نحتفظ بالبيانات الشخصية فقط للمدة الضرورية للأغراض المنصوص عليها في هذه السياسة:\n\n• سجلات الشحن والمعاملات: 7 سنوات، وفقًا للقانون التجاري والجمركي السعودي.\n• بيانات الاستفسارات والتسويق: 3 سنوات من آخر تفاعل، أو حتى سحب موافقتك.\n• البيانات التقنية وسجلات النظام: حتى 12 شهرًا.\n• السجلات المالية: 10 سنوات وفقًا للوائح الضريبية والمحاسبية السعودية.\n\nبعد انتهاء فترة الاحتفاظ المعمول بها، يتم حذف البيانات بأمان أو إخفاء هويتها.`,
      },
      {
        title: '٨. حقوقك',
        body: `بموجب نظام حماية البيانات الشخصية السعودي (PDPL) واللوائح المعمول بها، لديك الحق في:\n\n• الوصول: طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك.\n• التصحيح: طلب تصحيح البيانات غير الدقيقة أو غير المكتملة.\n• الحذف: طلب حذف بياناتك حيثما لم تعد ضرورية، مع مراعاة متطلبات الاحتفاظ القانونية.\n• التقييد: طلب تقييد معالجة بياناتك في ظروف معينة.\n• نقل البيانات: استلام بياناتك بصيغة منظمة وقابلة للقراءة آليًا حيثما كان ذلك ممكنًا تقنيًا.\n• الاعتراض: الاعتراض على المعالجة القائمة على المصالح المشروعة أو لأغراض التسويق المباشر في أي وقت.\n• سحب الموافقة: حيثما تستند المعالجة على الموافقة، سحبها في أي وقت دون المساس بمشروعية المعالجة السابقة.\n\nلممارسة أي من هذه الحقوق، يرجى التواصل معنا على info@bejoiceshipping-ksa.com. سنرد خلال 30 يومًا. يحق لك أيضًا تقديم شكوى إلى الهيئة الوطنية لإدارة البيانات السعودية (NDMO).`,
      },
      {
        title: '٩. الأمان',
        body: `نطبق تدابير أمنية تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الفقدان أو التعديل أو الإفصاح. وتشمل هذه التدابير:\n\n• تشفير TLS/SSL لجميع البيانات أثناء النقل.\n• ضوابط وصول قائمة على الأدوار تقصر الوصول على الموظفين المصرح لهم فحسب.\n• تقييمات أمنية دورية واختبار الثغرات.\n• تخزين آمن للبيانات مع نسخ احتياطية مشفرة.\n• تدريب الموظفين على حماية البيانات وأمن المعلومات.\n\nفي حالة خرق البيانات الذي يشكل خطرًا على حقوقك وحرياتك، سنُخطرك وسنُبلّغ الجهات المختصة وفقًا للقانون المعمول به.`,
      },
      {
        title: '١٠. خصوصية الأطفال',
        body: `لا يستهدف موقعنا الإلكتروني وخدماتنا الأفراد دون سن 18 عامًا. لا نجمع بيانات شخصية من الأطفال عن قصد. إذا كنت تعتقد أننا جمعنا بيانات من هذا القبيل عن غير قصد، يرجى التواصل معنا فورًا وسنحذفها على الفور.`,
      },
      {
        title: '١١. التغييرات على هذه السياسة',
        body: `قد نحدّث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو التكنولوجيا أو المتطلبات القانونية. ستُنشر النسخة المحدثة على هذه الصفحة مع تاريخ "آخر تحديث" منقح. نشجعك على مراجعة هذه السياسة دوريًا. يُعدّ الاستمرار في استخدام موقعنا بعد أي تغييرات قبولًا للسياسة المحدثة.`,
      },
      {
        title: '١٢. تواصل معنا',
        body: `لأي أسئلة أو طلبات أو شكاوى تتعلق بالخصوصية:\n\nشركة بيجويس جلوبال لوجستيكس ذ.م.م\nالمبنى أ، شارع الراجحي، الطابق الأول، مكتب رقم 2\nالدمام 32234، المملكة العربية السعودية\nالبريد الإلكتروني: info@bejoiceshipping-ksa.com\nالهاتف: 3461 823 13 966+`,
      },
    ],
  },
  'Terms of Service': {
    updated: 'May 2024',
    sections: [
      {
        title: 'I. Definitions',
        body: `1. Authority – Any legally established governmental or administrative body exercising jurisdiction or authority in any country, state, city, port, or airport.

2. Company – The legal entity entering into an agreement with the Customer to deliver services.

3. Bejoice – The trade name and/or registered trademark "Bejoice," owned by or licensed to the Company for its operations.

4. Country – The nation where the Company is formally incorporated and registered.

5. Currency – The official legal tender of the Country.

6. Customer – Any individual or organization for whom, or at whose request or benefit, the Company performs services, whether directly or indirectly. This includes agents, contractors, importers, exporters, shippers, consignees, carriers, notify parties, secured parties, warehouse operators, buyers, sellers, shipping agents, insurers, underwriters, break-bulk agents, holders, or assignees of any transport or storage document, and all other related parties. The Customer must ensure these Terms are communicated to all such parties.

7. Documentation – Any information or data provided by the Customer, in paper or electronic format.

8. Government – Any public body, court, tribunal, or agency acting under national, regional, or local law.

9. IMDG Code – The International Maritime Dangerous Goods Code.

10. Laws – All applicable statutes, regulations, decrees, codes, ordinances, judicial decisions, and international conventions in force in the Country.

11. MSDS – Material Safety Data Sheet.

12. Person – Any individual, partnership, trust, association, corporation, governmental entity, or other legal entity.

13. Services – All physical, administrative, agency, and/or logistical work performed by the Company for the Customer, including loading, unloading, packing, unpacking, stuffing, de-stuffing, transportation, warehousing, storage, or related activities, either directly or through third parties.

14. Storage Document – Any warehouse receipt, storage contract, or similar document confirming receipt of goods for storage or distribution.

15. Third Party – Any independent carrier, trucker, forwarder, NVOCC, customs broker, warehouse operator, or any other party entrusted with handling or transporting the goods.

16. Transport Document – Any bill of lading, waybill, forwarder's cargo receipt, or similar document issued by the Company as evidence of carriage.

17. Interpretation – Words such as "includes" or "including" are not restrictive. References to documents apply equally in both paper and electronic format. Headings are for convenience only. If there is a conflict between these Terms and any Transport or Storage Document, the latter shall govern. If any provision is held invalid, the remaining Terms shall remain fully enforceable.`,
      },
      {
        title: "II. Company's Role",
        body: `1. Unless otherwise agreed in writing, the Customer recognizes that the Company operates solely as the Customer's agent.

2. The Company retains full discretion regarding the choice of methods, routes, and procedures for handling goods and may appoint third parties where necessary. These third parties are considered agents of the Customer, who remains responsible for their charges unless the Company has agreed to assume them in writing.

3. The Company's communication of a chosen service provider does not imply any guarantee of performance or assumption of cost unless explicitly agreed beforehand.`,
      },
      {
        title: 'III. Quotations',
        body: `1. All quotations are provided for reference purposes only and are not binding offers. They may be revised or withdrawn without notice.

2. A binding agreement arises only when the Company expressly confirms handling of goods at specified rates and payment terms.

3. Quotations, including all rates and service descriptions, are confidential and may not be shared with third parties without prior written approval.

4. Unless otherwise stated, quotations are valid for 30 days and override any earlier communication.

5. The Company reserves the right to select the carrier unless the Customer specifies otherwise.

6. Rates are subject to change due to fuel surcharges, currency fluctuations, war risk premiums, or other carrier-applied charges.

7. Quoted rates exclude:
   • Destination Terminal Handling Charges (THC) and local port fees (unless otherwise agreed).
   • Government inspection fees and related detention/demurrage costs.
   • General Rate Increases, Rate Restorations, or Peak Season Surcharges applied at the time of booking.
   • Charges resulting from discrepancies in weight, size, or container type at shipment time.
   • Special equipment repositioning or arrangement fees.
   • Insurance, unless specifically arranged and paid for by the Customer.

8. Transit times are estimates only and based on carrier schedules. The Company is not liable for delays but will take reasonable steps to facilitate timely delivery.

9. Quoted rates apply to general cargo unless expressly noted for perishable, hazardous, or oversized cargo.

10. Dangerous goods are subject to carrier approval and must comply with the IMDG Code and national regulations.

11. Quoted rates expressly excludes insurance coverage. Procuring insurance is solely the responsibility of the Shipper, Consignee, or Customer. The Company shall bear no liability of any kind, under any circumstances, for the Customer's failure or decision not to obtain insurance coverage.

A Customer who wishes to insure their cargo must arrange such insurance independently and at their own cost and expense, or inform the Company in prior for insurance arrangements on their behalf.`,
      },
      {
        title: "IV. Customer's Obligations",
        body: `1. The Customer must provide all required documentation and data, including licenses, permits, invoices, customs information, weights, measures, classification, and country of origin details.

2. Any errors or omissions must be promptly corrected by the Customer.

3. The Customer is responsible for reviewing and verifying all filings and declarations made on their behalf.

4. Record-keeping is the Customer's duty unless the Company is specifically engaged to do so.

5. The Customer warrants that all information is accurate and complete and complies with all laws, trade restrictions, and sanctions.

6. All goods must be properly packed, labelled, and addressed for safe handling and transportation.`,
      },
      {
        title: 'V. Shipment, Customs Clearance & Payment',
        body: `1. Carriers may stow goods as they deem appropriate, provided they comply with legal requirements.

2. Goods shipped on deck are at the Customer's risk.

3. The Customer or consignee must arrange funds for customs duties and port/delivery order charges in advance to prevent clearance delays.

4. All freight and surcharges must be paid immediately upon receipt of invoice, without deduction or offset.

5. Duties and other official fees must be prepaid.

6. The Customer must immediately settle additional charges, penalties, or costs caused by detention, container damage, or storage fees resulting from their actions.

7. All payments are due in advance unless credit terms have been approved in writing. Credit arrangements may be withdrawn at any time.

8. The Customer is responsible for all legal and collection expenses incurred to enforce payment.`,
      },
      {
        title: 'VI. Insurance',
        body: `1. The Company is not required to insure goods unless a written agreement exists.

2. If insurance is requested, the Company reserves the right to select the insurer.

3. The Customer is liable for all insurance premiums and administrative fees.`,
      },
      {
        title: 'VII. Limitation of Liability',
        body: `1. The Company's liability is strictly limited to the extent described in these Terms or in any Transport/Storage Document issued.

2. No liability applies unless negligence is proven and the goods are in the Company's direct physical custody.

3. The Company is not liable for loss or damage resulting from:
   • Customer error, negligence, or incorrect declarations.
   • Force Majeure events, including strikes, natural disasters, fires, or government action.
   • General Average events declared by vessel owners.

4. Liability is limited as follows:
   • Customs brokerage claims: the lesser of USD 30 per entry or the brokerage fee charged.
   • Loss/damage to goods: the lesser of goods' value or USD 8/kg gross weight, capped at USD 2,000 per shipment (value whichever is lesser).
   • If no value applies: the lesser of USD 50 per shipment or invoice value.
   • The Company is not liable for indirect, incidental, consequential, or punitive damages, including loss of profits.
   • When goods are handled by third parties, their liability limits apply.
   • Application of Limited Liability: The limitations of liability set out herein shall apply only where loss, damage, or delay is directly attributable to the Company's proven negligence, fault, or mishandling of the shipment or services. No liability shall arise where loss or damage is caused by events beyond the Company's reasonable control, including but not limited to force majeure, acts of public authorities, inherent defects in goods, or the Customer's own acts or omissions.`,
      },
      {
        title: 'VIII. Limitation of Actions',
        body: `1. Any claims must be reported in writing within 12 hours of discovery of the loss of any kind, with proofs to check with the handling parties involved.`,
      },
      {
        title: 'IX. Indemnification',
        body: `1. The Customer shall indemnify and hold harmless the Company against all claims, losses, costs, fines, penalties, and expenses (including legal fees) arising from:
   • Breach of these Terms by the Customer.
   • Failure to pay charges or fulfill obligations.
   • General Average contributions.
   • Violations of law, sanctions, or provision of incorrect data.
   • Third-party claims, regardless of Customer negligence.

2. The Company may appoint legal counsel at the Customer's expense to handle any indemnified matter.`,
      },
      {
        title: 'X. Sale of Perishable Goods',
        body: `1. Perishable goods or live animals with no handling instructions may be sold or disposed of without prior notice.

2. The Customer remains liable for all related charges even if the goods are refused, unclaimed, or returned.`,
      },
      {
        title: 'XI. General Lien',
        body: `1. The Company has a general lien on all goods in its custody as security for unpaid amounts.

2. If debts remain unsettled, the Company may sell the goods after giving reasonable notice. Surplus funds, if any, will be returned to the Customer, who remains responsible for any balance due.`,
      },
      {
        title: 'XII. Intellectual Property',
        body: `1. All Company intellectual property, including software, databases, trademarks, patents, and proprietary know-how, is confidential and may not be copied, disclosed, reverse-engineered, or used without prior written authorization.`,
      },
      {
        title: 'XIII. Data Privacy',
        body: `1. The Customer confirms compliance with all applicable data protection regulations and assures that valid consent has been obtained for data sharing.

2. The Company may process and share data for compliance, billing, debt recovery, and administrative purposes.`,
      },
      {
        title: 'XIV. Force Majeure',
        body: `1. The Company will not be responsible for failure or delay in performance caused by events beyond its control, including natural disasters, war, piracy, terrorism, embargoes, riots, strikes, labor disputes, or government actions.

2. Failure to pay invoices is not considered a Force Majeure event.`,
      },
      {
        title: 'XV. Severability',
        body: `1. If any clause is held unenforceable, the remaining provisions shall continue to be effective.`,
      },
      {
        title: 'XVI. Governing Law & Jurisdiction',
        body: `1. These Terms are governed by the laws of the Country of registration.

2. All disputes shall be resolved exclusively in the courts of that Country.`,
      },
      {
        title: 'XVII. Miscellaneous',
        body: `1. A waiver of one breach does not constitute a waiver of any future breach.

2. These Terms, together with any Transport Document, Booking Confirmation, or Quotation, represent the full and final agreement between the parties.

3. Any amendments must be made in writing and signed by the Company.

4. Notices must be provided in writing and delivered by hand, email, or registered post to the parties' designated addresses.`,
      },
    ],
    arSections: [
      {
        title: 'أولاً: التعريفات',
        body: `١. السلطة – أي جهة حكومية أو إدارية مُنشأة قانونًا وتمارس الولاية القضائية أو السلطة في أي دولة أو ولاية أو مدينة أو ميناء أو مطار.

٢. الشركة – الكيان القانوني الذي يبرم اتفاقية مع العميل لتقديم الخدمات.

٣. بيجويس – الاسم التجاري و/أو العلامة التجارية المسجلة "بيجويس"، المملوكة للشركة أو المرخصة لها في عملياتها.

٤. الدولة – الدولة التي تأسست فيها الشركة وسُجّلت رسميًا.

٥. العملة – العملة القانونية الرسمية للدولة.

٦. العميل – أي فرد أو منظمة تُؤدي لها الشركة خدمات أو بناءً على طلبه أو لصالحه، سواء بشكل مباشر أو غير مباشر. ويشمل ذلك الوكلاء والمقاولين والمستوردين والمصدرين والشاحنين والمستلمين والناقلين والأطراف المُبلَّغة والأطراف المضمونة ومشغلي المستودعات والمشترين والبائعين ووكلاء الشحن وشركات التأمين وحاملي وثائق النقل أو التخزين وجميع الأطراف ذات الصلة. يجب على العميل ضمان اطلاع جميع هذه الأطراف على هذه الشروط.

٧. التوثيق – أي معلومات أو بيانات يقدمها العميل، سواء في صيغة ورقية أو إلكترونية.

٨. الحكومة – أي هيئة عامة أو محكمة أو هيئة تحكيم أو وكالة تعمل وفق القانون الوطني أو الإقليمي أو المحلي.

٩. كود IMDG – كود البضائع الخطرة عبر البحر الدولي.

١٠. القوانين – جميع الأنظمة والتشريعات والمراسيم والأوامر القضائية والاتفاقيات الدولية المعمول بها في الدولة.

١١. MSDS – صحيفة بيانات سلامة المواد.

١٢. الشخص – أي فرد أو شراكة أو ائتمان أو جمعية أو شركة أو جهة حكومية أو أي كيان قانوني آخر.

١٣. الخدمات – جميع الأعمال المادية والإدارية والوكالية و/أو اللوجستية التي تؤديها الشركة للعميل، بما في ذلك التحميل والتفريغ والتعبئة وفك التعبئة والحشو والاستخراج والنقل والتخزين والأنشطة ذات الصلة، سواء مباشرةً أو عبر أطراف ثالثة.

١٤. وثيقة التخزين – أي إيصال مستودع أو عقد تخزين أو وثيقة مماثلة تؤكد استلام البضائع للتخزين أو التوزيع.

١٥. الطرف الثالث – أي ناقل مستقل أو سائق شاحنة أو وكيل شحن أو وسيط جمركي أو مشغل مستودع أو أي طرف آخر مُوكل بمناولة البضائع أو نقلها.

١٦. وثيقة النقل – أي بوليصة شحن أو بوليصة بضاعة أو إيصال شحن أو وثيقة مماثلة تصدرها الشركة كدليل على النقل.

١٧. التفسير – لا تُعدّ كلمات "تشمل" أو "بما في ذلك" مقيِّدة. تسري الإشارات إلى الوثائق على الصيغتين الورقية والإلكترونية. العناوين للتيسير فحسب. في حالة تعارض هذه الشروط مع أي وثيقة نقل أو تخزين، تُطبَّق الأخيرة. إذا اعتُبر أي بند غير قابل للتطبيق، تظل الشروط الباقية سارية المفعول بالكامل.`,
      },
      {
        title: 'ثانيًا: دور الشركة',
        body: `١. ما لم يُتفق على خلاف ذلك كتابيًا، يُقرّ العميل بأن الشركة تعمل بصفتها وكيلًا للعميل فحسب.

٢. تحتفظ الشركة بالصلاحية التقديرية الكاملة فيما يتعلق باختيار الأساليب والمسارات والإجراءات المتعلقة بمناولة البضائع، ويجوز لها تعيين أطراف ثالثة عند الضرورة. تُعتبر هذه الأطراف الثالثة وكلاءً للعميل، الذي يظل مسؤولًا عن رسومها ما لم توافق الشركة على تحملها كتابيًا.

٣. لا يعني تواصل الشركة بشأن مزود خدمة مختار أي ضمان للأداء أو تحمّل للتكلفة ما لم يُتفق على ذلك صراحةً مسبقًا.`,
      },
      {
        title: 'ثالثًا: عروض الأسعار',
        body: `١. تُقدَّم جميع عروض الأسعار لأغراض مرجعية فحسب وليست عروضًا مُلزِمة. يجوز مراجعتها أو سحبها دون إشعار.

٢. لا ينشأ اتفاق مُلزِم إلا عندما تؤكد الشركة صراحةً مناولة البضائع بأسعار وشروط دفع محددة.

٣. تُعدّ عروض الأسعار بما فيها جميع الأسعار وأوصاف الخدمات سرية ولا يجوز مشاركتها مع أطراف ثالثة دون موافقة كتابية مسبقة.

٤. ما لم يُنص على خلاف ذلك، تسري عروض الأسعار لمدة 30 يومًا وتحلّ محلّ أي تواصل سابق.

٥. تحتفظ الشركة بحق اختيار الناقل ما لم يحدد العميل خلاف ذلك.

٦. تخضع الأسعار للتغيير بسبب رسوم الوقود وتقلبات العملات وأقساط مخاطر الحرب أو غيرها من الرسوم التي يطبقها الناقل.

٧. لا تشمل الأسعار المعروضة:
   • رسوم مناولة المحطة في الوجهة (THC) والرسوم المحلية للموانئ (ما لم يُتفق على خلاف ذلك).
   • رسوم التفتيش الحكومية والتكاليف ذات الصلة بالاحتجاز والتأخير.
   • زيادات الأسعار العامة أو استعادتها أو رسوم موسم الذروة المطبقة وقت الحجز.
   • الرسوم الناتجة عن التناقضات في الوزن أو الحجم أو نوع الحاوية وقت الشحن.
   • رسوم إعادة تموضع المعدات الخاصة أو ترتيبها.
   • التأمين، ما لم يتم ترتيبه وسداده تحديدًا من قِبل العميل.

٨. أوقات العبور تقديرية فحسب وتستند إلى جداول الناقل. الشركة غير مسؤولة عن التأخيرات ولكنها ستتخذ خطوات معقولة لتسهيل التسليم في الوقت المناسب.

٩. تسري الأسعار المعروضة على البضائع العامة ما لم يُنص صراحةً على البضائع القابلة للتلف أو الخطرة أو كبيرة الحجم.

١٠. تخضع البضائع الخطرة لموافقة الناقل ويجب أن تمتثل لكود IMDG والأنظمة الوطنية.

١١. تستثني الأسعار المعروضة صراحةً تغطية التأمين. يقع على عاتق الشاحن أو المستلم أو العميل وحده مسؤولية الحصول على التأمين. لن تتحمل الشركة أي مسؤولية من أي نوع، في أي ظرف كان، جراء إخفاق العميل أو قراره بعدم الحصول على تغطية تأمينية.

يجب على العميل الراغب في تأمين بضائعه ترتيب ذلك التأمين باستقلالية وعلى نفقته الخاصة، أو إبلاغ الشركة مسبقًا لترتيب التأمين نيابةً عنه.`,
      },
      {
        title: 'رابعًا: التزامات العميل',
        body: `١. يجب على العميل تقديم جميع الوثائق والبيانات المطلوبة، بما في ذلك التراخيص والتصاريح والفواتير والمعلومات الجمركية والأوزان والمقاسات والتصنيف وبيانات بلد المنشأ.

٢. يجب على العميل تصحيح أي أخطاء أو إغفالات فورًا.

٣. يتحمل العميل مسؤولية مراجعة والتحقق من جميع الملفات والإقرارات المقدمة نيابةً عنه.

٤. حفظ السجلات واجب العميل ما لم تُوكَل الشركة تحديدًا للقيام بذلك.

٥. يضمن العميل دقة جميع المعلومات واكتمالها وامتثالها لجميع القوانين وقيود التجارة والعقوبات.

٦. يجب تعبئة جميع البضائع وتسميتها وتوجيهها بشكل صحيح لضمان المناولة والنقل الآمن.`,
      },
      {
        title: 'خامسًا: الشحن والتخليص الجمركي والدفع',
        body: `١. يجوز للناقلين تخزين البضائع بالطريقة التي يرونها مناسبة، شريطة الامتثال للمتطلبات القانونية.

٢. البضائع المشحونة على السطح تكون على مسؤولية العميل.

٣. يجب على العميل أو المستلم توفير الأموال الخاصة برسوم الجمارك ورسوم أوامر الميناء والتسليم مسبقًا لتجنب تأخيرات التخليص.

٤. يجب سداد جميع أسعار الشحن والرسوم الإضافية فور استلام الفاتورة، دون خصم أو مقاصة.

٥. يجب دفع الرسوم الجمركية والرسوم الرسمية الأخرى مقدمًا.

٦. يجب على العميل تسوية الرسوم والغرامات والتكاليف الإضافية الناجمة عن الاحتجاز أو تلف الحاوية أو رسوم التخزين الناتجة عن أفعاله فورًا.

٧. جميع المدفوعات مستحقة مقدمًا ما لم تتم الموافقة على شروط الائتمان كتابيًا. يجوز سحب ترتيبات الائتمان في أي وقت.

٨. يتحمل العميل مسؤولية جميع النفقات القانونية ونفقات التحصيل المتكبدة لإنفاذ الدفع.`,
      },
      {
        title: 'سادسًا: التأمين',
        body: `١. لا تُلزَم الشركة بتأمين البضائع ما لم يوجد اتفاق كتابي.

٢. إذا طُلب التأمين، تحتفظ الشركة بحق اختيار شركة التأمين.

٣. يتحمل العميل مسؤولية جميع أقساط التأمين والرسوم الإدارية.`,
      },
      {
        title: 'سابعًا: تحديد المسؤولية',
        body: `١. تقتصر مسؤولية الشركة بصرامة على الحدود المنصوص عليها في هذه الشروط أو في أي وثيقة نقل أو تخزين صادرة.

٢. لا تسري أي مسؤولية ما لم يثبت الإهمال وتكون البضائع في عهدة الشركة المادية المباشرة.

٣. الشركة غير مسؤولة عن الفقدان أو الأضرار الناجمة عن:
   • خطأ العميل أو إهماله أو تصريحاته غير الصحيحة.
   • أحداث القوة القاهرة، بما في ذلك الإضرابات والكوارث الطبيعية والحرائق وأعمال الحكومة.
   • أحداث العوارية البحرية العامة المُعلنة من قِبل ملّاك السفن.

٤. المسؤولية محدودة على النحو التالي:
   • مطالبات الوساطة الجمركية: أدنى قيمة بين 30 دولارًا أمريكيًا للدخول الواحد أو رسوم الوساطة المحصلة.
   • فقدان أو تلف البضائع: أدنى قيمة بين قيمة البضائع أو 8 دولارات أمريكية للكيلوجرام وزنًا إجماليًا، بحد أقصى 2,000 دولار أمريكي للشحنة الواحدة.
   • إذا لم تنطبق أي قيمة: أدنى قيمة بين 50 دولارًا أمريكيًا للشحنة الواحدة أو قيمة الفاتورة.
   • الشركة غير مسؤولة عن الأضرار غير المباشرة أو العرضية أو التبعية أو العقابية، بما في ذلك الخسائر في الأرباح.
   • عند مناولة البضائع من قِبل أطراف ثالثة، تسري حدود مسؤوليتها.
   • لا تسري حدود المسؤولية المنصوص عليها هنا إلا حين يُعزى الفقدان أو الضرر أو التأخير مباشرةً إلى إهمال الشركة أو خطئها المُثبَت. لا تنشأ أي مسؤولية حين يكون الفقدان ناجمًا عن أحداث خارج السيطرة المعقولة للشركة، بما في ذلك القوة القاهرة وأعمال السلطات العامة والعيوب المتأصلة في البضائع أو أعمال العميل أو إغفالاته.`,
      },
      {
        title: 'ثامنًا: تقادم الدعاوى',
        body: `١. يجب الإبلاغ عن أي مطالبات كتابيًا خلال 12 ساعة من اكتشاف الفقدان من أي نوع، مع تقديم الأدلة للتحقق مع أطراف المناولة المعنية.`,
      },
      {
        title: 'تاسعًا: التعويض',
        body: `١. يتعهد العميل بتعويض الشركة وإعفائها من جميع المطالبات والخسائر والتكاليف والغرامات والعقوبات والمصاريف (بما في ذلك أتعاب المحامين) الناجمة عن:
   • إخلال العميل بهذه الشروط.
   • الإخفاق في سداد الرسوم أو الوفاء بالالتزامات.
   • مساهمات العوارية البحرية العامة.
   • مخالفات القانون والعقوبات أو تقديم بيانات غير صحيحة.
   • مطالبات الأطراف الثالثة، بصرف النظر عن إهمال العميل.

٢. يجوز للشركة تعيين مستشار قانوني على نفقة العميل للتعامل مع أي مسألة مشمولة بالتعويض.`,
      },
      {
        title: 'عاشرًا: بيع البضائع القابلة للتلف',
        body: `١. يجوز بيع البضائع القابلة للتلف أو الحيوانات الحية التي لا تتضمن تعليمات مناولة أو التخلص منها دون إشعار مسبق.

٢. يظل العميل مسؤولًا عن جميع الرسوم ذات الصلة حتى في حالة رفض البضائع أو عدم المطالبة بها أو إعادتها.`,
      },
      {
        title: 'حادي عشر: حق الحبس العام',
        body: `١. تتمتع الشركة بحق حبس عام على جميع البضائع الموجودة في حوزتها كضمان للمبالغ غير المسددة.

٢. إذا ظلت الديون غير مسواة، يجوز للشركة بيع البضائع بعد إعطاء إشعار معقول. تُعاد الأموال الفائضة، إن وُجدت، إلى العميل، الذي يظل مسؤولًا عن أي رصيد متبقٍ.`,
      },
      {
        title: 'ثاني عشر: الملكية الفكرية',
        body: `١. جميع الملكية الفكرية للشركة، بما في ذلك البرامج وقواعد البيانات والعلامات التجارية وبراءات الاختراع والمعرفة التقنية الحصرية، سرية ولا يجوز نسخها أو الإفصاح عنها أو إجراء هندسة عكسية لها أو استخدامها دون إذن كتابي مسبق.`,
      },
      {
        title: 'ثالث عشر: خصوصية البيانات',
        body: `١. يؤكد العميل الامتثال لجميع أنظمة حماية البيانات المعمول بها ويضمن الحصول على موافقة صحيحة لمشاركة البيانات.

٢. يجوز للشركة معالجة البيانات ومشاركتها لأغراض الامتثال والفوترة واسترداد الديون والأغراض الإدارية.`,
      },
      {
        title: 'رابع عشر: القوة القاهرة',
        body: `١. لن تكون الشركة مسؤولة عن الإخفاق في الأداء أو التأخر فيه بسبب أحداث خارج سيطرتها، بما في ذلك الكوارث الطبيعية والحرب والقرصنة والإرهاب والحظر وأعمال الشغب والإضرابات والنزاعات العمالية وأعمال الحكومة.

٢. لا يُعتبر الإخفاق في سداد الفواتير حدثًا من أحداث القوة القاهرة.`,
      },
      {
        title: 'خامس عشر: قابلية الفصل',
        body: `١. إذا اعتُبر أي بند غير قابل للتطبيق، تستمر الأحكام الباقية في السريان.`,
      },
      {
        title: 'سادس عشر: القانون الحاكم والاختصاص القضائي',
        body: `١. تخضع هذه الشروط لقوانين دولة التسجيل.

٢. تُحسم جميع النزاعات حصريًا في محاكم تلك الدولة.`,
      },
      {
        title: 'سابع عشر: أحكام متفرقة',
        body: `١. لا يُعدّ التنازل عن خرق معين تنازلًا عن أي خرق مستقبلي.

٢. تمثل هذه الشروط، إلى جانب أي وثيقة نقل أو تأكيد حجز أو عرض أسعار، الاتفاقية الكاملة والنهائية بين الطرفين.

٣. أي تعديلات يجب أن تتم كتابيًا وتوقّعها من قِبل الشركة.

٤. يجب تقديم الإشعارات كتابيًا وتسليمها باليد أو بالبريد الإلكتروني أو بالبريد المسجل إلى عناوين الأطراف المحددة.`,
      },
    ],
  },
}

// ── Security helpers ────────────────────────────────────────────────────────
function stripTags(v) {
  return String(v ?? '')
    .replace(/<[^>]*>/g, '')           // strip HTML/script tags
    .replace(/javascript\s*:/gi, '')   // strip js: URLs
    .replace(/on\w+\s*=/gi, '')        // strip event handlers
    .replace(/[\r\n]+/g, ' ')          // collapse newlines (header injection)
    .trim()
}
function clampHelper(v, max) { return stripTags(v).slice(0, max) }
const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_CV_EXTS = ['.pdf', '.doc', '.docx']

function CareersModal({ onClose }) {
  const backdropRef = useRef(null)
  const POSITIONS = [
    'Freight Operations Manager',
    'Business Development Manager',
    'Customs Clearance Officer',
    'Sea Freight Coordinator',
    'Air Freight Coordinator',
    'Project Cargo Specialist',
    'Heavy Lift & Project Coordinator',
    'Sales Executive',
    'Logistics Coordinator',
    'Warehouse Supervisor',
    'Finance & Administration',
    'IT / Technology',
    'Other',
  ]

  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', otherPosition: '', message: '' })
  const [cvFile, setCvFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const fieldErr = (field) => errors[field]
    ? <div style={{ color: '#f87171', fontSize: 13, marginTop: 5, fontFamily: "'DM Sans',sans-serif" }}>{errors[field]}</div>
    : null

  function validate() {
    const e = {}
    const name  = clampHelper(form.name, 100)
    const email = clampHelper(form.email, 200)
    const phone = clampHelper(form.phone, 30)
    if (!name) e.name = 'Name is required'
    else if (name.length < 2) e.name = 'Name too short'
    if (!email || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email)) e.email = 'Valid email required'
    if (!phone) e.phone = 'Phone is required'
    else if (!isValidPhone(phone)) e.phone = 'Enter a valid phone number (e.g. +966 50 123 4567)'
    if (!form.position) e.position = 'Please select a position'
    if (form.position === 'Other' && !clampHelper(form.otherPosition, 100)) e.otherPosition = 'Please specify the position'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)

    // Sanitize all fields before sending
    const name     = clampHelper(form.name, 100)
    const email    = clampHelper(form.email, 200)
    const phone    = clampHelper(form.phone, 30)
    const position = form.position === 'Other' ? clampHelper(form.otherPosition, 100) : clampHelper(form.position, 100)
    const message  = clampHelper(form.message, 2000)
    const cvNote   = cvFile
      ? `CV file: ${clampHelper(cvFile.name, 200)} (${(cvFile.size / 1024).toFixed(0)} KB) — Please request file from applicant directly.`
      : 'No CV attached.'

    const body = [
      '╔══════════════════════════════════════════╗',
      '  JOB APPLICATION — Bejoice Group',
      '╚══════════════════════════════════════════╝',
      '',
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Phone:    ${phone}`,
      `Position: ${position}`,
      '',
      '── CV / RESUME ──',
      cvNote,
      message ? `\n── COVER NOTE ──\n${message}` : '',
    ].join('\n').trim()

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: 'info@bejoiceshipping-ksa.com',
          reply_to: email,
          from_name: name,
          subject: `[Bejoice Careers] ${position} — ${name}`,
          mode: 'Career Application',
          client_name: name,
          company: '—',
          client_email: email,
          phone,
          message: body,
        },
        EMAILJS_PUBLIC_KEY,
      )
    } catch (err) {
      console.error('Careers email error:', err)
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  // ── Shared input/label styles matching QuoteModal ─────────────────────────
  const lbl = {
    display: 'block', fontFamily: "'DM Sans',sans-serif",
    fontSize: 12, fontWeight: 700, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  }
  const fw = { marginBottom: 16 }

  return (
    <>
      <style>{`
        @keyframes cm-in  { from{opacity:0} to{opacity:1} }
        @keyframes cm-pan { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cm-tick{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .cm-inp {
          width:100%; background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08); border-radius:12px;
          color:#fff; font-family:'DM Sans',sans-serif;
          font-size:16px; padding:13px 18px; outline:none;
          transition:all 0.3s cubic-bezier(0.23,1,0.32,1); box-sizing:border-box;
        }
        .cm-inp::placeholder { color:rgba(255,255,255,0.2); }
        .cm-inp:focus { border-color:rgba(91,194,231,0.6); background:rgba(255,255,255,0.06);
          box-shadow:0 0 0 1px rgba(91,194,231,0.3),0 8px 24px rgba(0,0,0,0.2); }
        .cm-inp.err { border-color:rgba(248,113,113,0.6); }
        .cm-inp.err:focus { border-color:rgba(248,113,113,0.8); box-shadow:0 0 0 1px rgba(248,113,113,0.3); }
        .cm-sub {
          width:100%; padding:18px;
          background:linear-gradient(135deg,#8DD8F0 0%,#8DD8F0 40%,#5BC2E7 100%);
          color:#091524; border:1px solid rgba(255,255,255,0.25); border-radius:12px;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:900;
          letter-spacing:0.2em; text-transform:uppercase; cursor:pointer;
          box-shadow:0 12px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.45);
          transition:all 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .cm-sub:hover:not(:disabled){transform:translateY(-2.5px);
          background:linear-gradient(135deg,#c4edfa 0%,#8DD8F0 40%,#8DD8F0 100%);
          box-shadow:0 16px 40px rgba(91,194,231,0.45),0 12px 32px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.6);}
        .cm-sub:active{transform:scale(0.975);}
        .cm-sub:disabled{opacity:0.4;cursor:default;transform:none;}
        .cm-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:540px){ .cm-grid2{grid-template-columns:1fr;} }
      `}</style>

      <div
        ref={backdropRef}
        onClick={e => { if (e.target === backdropRef.current) onClose() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(3,3,8,0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'cm-in 0.3s ease forwards',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflowY: 'auto',
            background: 'linear-gradient(170deg,#0f172a 0%,#091524 100%)',
            border: '1.5px solid rgba(91,194,231,0.32)',
            borderRadius: 24,
            boxShadow: submitted
              ? '0 40px 100px rgba(0,0,0,0.95),0 0 30px rgba(91,194,231,0.2)'
              : '0 40px 100px rgba(0,0,0,0.9),0 0 0 1px rgba(91,194,231,0.12)',
            animation: 'cm-pan 0.45s cubic-bezier(0.23,1,0.32,1) forwards',
            scrollbarWidth: 'none',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Top bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,transparent 0%,#5BC2E7 30%,#8DD8F0 50%,#5BC2E7 70%,transparent 100%)', borderRadius: '24px 24px 0 0' }} />

          {/* Close ✕ */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 10,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.15)'; e.currentTarget.style.color = '#5BC2E7'; e.currentTarget.style.borderColor = 'rgba(91,194,231,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            aria-label="Close"
          >✕</button>

          {submitted ? (
            /* ── Success ── */
            <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'cm-tick 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both',
                boxShadow: '0 0 40px rgba(34,197,94,0.18)',
              }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,5vw,2.8rem)', letterSpacing: '0.08em', color: '#fff', margin: 0, lineHeight: 1 }}>
                Application <span style={{ color: '#5BC2E7' }}>Received!</span>
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 380, margin: 0 }}>
                Thank you for your interest. We will notify you once we have an open position in this role.
              </p>
              <button className="cm-sub" onClick={onClose} style={{ marginTop: 8, maxWidth: 200 }}>Close</button>
            </div>
          ) : (
            /* ── Form ── */
            <div style={{ padding: 'clamp(28px,4vw,40px)' }}>
              {/* Heading */}
              <div style={{ marginBottom: 28, paddingRight: 40 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(91,194,231,0.75)', fontWeight: 700, margin: '0 0 8px' }}>
                  Bejoice Group
                </p>
                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(1.9rem,5vw,2.8rem)', letterSpacing: '0.08em', color: '#fff', margin: '0 0 10px', lineHeight: 1 }}>
                  Join <span style={{ color: '#5BC2E7' }}>Our Team</span>
                </h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
                  Express your interest — we'll reach out when a matching role opens.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* Name */}
                <div style={fw}>
                  <label style={lbl}>Full Name <span style={{ color: '#f87171' }}>*</span></label>
                  <input className={`cm-inp${errors.name ? ' err' : ''}`}
                    type="text" value={form.name} maxLength={100}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Your full name"
                  />
                  {fieldErr('name')}
                </div>

                {/* Email + Phone */}
                <div className="cm-grid2" style={{ marginBottom: 16 }}>
                  <div>
                    <label style={lbl}>Email <span style={{ color: '#f87171' }}>*</span></label>
                    <input className={`cm-inp${errors.email ? ' err' : ''}`}
                      type="email" value={form.email} maxLength={200}
                      onChange={e => set('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                    {fieldErr('email')}
                  </div>
                  <div>
                    <label style={lbl}>Phone <span style={{ color: '#f87171' }}>*</span></label>
                    <input className={`cm-inp${errors.phone ? ' err' : ''}`}
                      type="tel" value={form.phone} maxLength={30}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                    />
                    {fieldErr('phone')}
                  </div>
                </div>

                {/* Position */}
                <div style={fw}>
                  <label style={lbl}>Interested Position <span style={{ color: '#f87171' }}>*</span></label>
                  <select className={`cm-inp${errors.position ? ' err' : ''}`}
                    value={form.position}
                    onChange={e => set('position', e.target.value)}
                    style={{ cursor: 'pointer', appearance: 'none',
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235BC2E7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40 }}
                  >
                    <option value="" style={{ background: '#0a0e1a' }}>Select a position…</option>
                    {POSITIONS.map(p => <option key={p} value={p} style={{ background: '#0a0e1a' }}>{p}</option>)}
                  </select>
                  {fieldErr('position')}
                </div>

                {/* Other */}
                {form.position === 'Other' && (
                  <div style={fw}>
                    <label style={lbl}>Specify Position <span style={{ color: '#f87171' }}>*</span></label>
                    <input className={`cm-inp${errors.otherPosition ? ' err' : ''}`}
                      type="text" value={form.otherPosition} maxLength={100}
                      onChange={e => set('otherPosition', e.target.value)}
                      placeholder="e.g. Supply Chain Analyst"
                    />
                    {fieldErr('otherPosition')}
                  </div>
                )}

                {/* CV Upload */}
                <div style={fw}>
                  <label style={lbl}>CV / Resume <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>(optional)</span></label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(91,194,231,0.25)',
                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(91,194,231,0.5)'; e.currentTarget.style.background = 'rgba(91,194,231,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(91,194,231,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(91,194,231,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, color: cvFile ? '#fff' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cvFile ? cvFile.name : 'Upload PDF, DOC or DOCX — max 5 MB'}
                      </div>
                      {cvFile && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(91,194,231,0.55)', marginTop: 2 }}>{(cvFile.size / 1024).toFixed(0)} KB</div>}
                    </div>
                    {cvFile && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>}
                    <input type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0]
                        if (!f) return
                        const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'))
                        if (!ALLOWED_CV_TYPES.includes(f.type) && !ALLOWED_CV_EXTS.includes(ext)) {
                          alert('Only PDF, DOC, or DOCX files are accepted.')
                          e.target.value = ''
                          return
                        }
                        if (f.size > 5 * 1024 * 1024) { alert('File must be under 5 MB'); e.target.value = ''; return }
                        setCvFile(f)
                      }}
                    />
                  </label>
                </div>

                {/* Cover Note */}
                <div style={fw}>
                  <label style={lbl}>Cover Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>(optional)</span></label>
                  <textarea className="cm-inp"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    placeholder="Briefly tell us about your experience and why you'd like to join Bejoice…"
                    rows={3} maxLength={2000}
                    style={{ resize: 'vertical', minHeight: 88 }}
                  />
                </div>

                <button type="submit" className="cm-sub" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Application →'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


function PolicyModal({ title, onClose }) {
  const { isAr } = useLang()
  const policy = POLICIES[title]
  const backdropRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!policy) return null

  const sections = isAr ? policy.arSections : policy.sections

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(3,3,8,0.85)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
    >
      <div style={{
        width: '100%', maxWidth: 850, maxHeight: '85vh',
        background: '#183650',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, position: 'relative', overflow: 'hidden',
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '40px 48px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(to bottom, rgba(91,194,231,0.05), transparent)'
        }}>
          <h2 style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)',
            color: '#fff', fontWeight: 700, margin: 0, lineHeight: 1
          }}>
            {isAr ? (ar.footer.policies[title] || title) : title}
          </h2>
          {policy.updated && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
              color: 'rgba(91,194,231,0.92)', opacity: 0.8, marginTop: '8px',
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              {isAr ? 'آخر تحديث: ' : 'Last Updated: '} {policy.updated}
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '40px 48px', overflowY: 'auto', flex: 1,
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(91,194,231,0.2) transparent'
        }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(18px, 2vw, 22px)',
                color: 'rgba(91,194,231,0.92)', marginBottom: '16px', fontWeight: 600
              }}>
                {s.title}
              </h3>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
                color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
                textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr'
              }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)', textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px', borderRadius: '8px', border: 'none',
              background: '#5BC2E7', color: '#000',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => { e.target.style.background = '#8DD8F0' }}
            onMouseLeave={e => { e.target.style.background = '#5BC2E7' }}
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* Close Icon */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 24, right: 24, width: 40, height: 40,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >✕</button>
      </div>
    </div>
  )
}

export default function Footer({ onWhyClick }) {
  const { isAr } = useLang()
  const [openPolicy, setOpenPolicy] = useState(null)
  const [careersOpen, setCareersOpen] = useState(false)

  return (
    <footer className="relative border-t pt-10 md:pt-20 pb-10 px-6 md:px-12 lg:px-24 overflow-hidden cv-section cv-footer" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#183650' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(91,194,231,0.05) 0%, transparent 60%)' }}/>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16 lg:mb-20">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
              <img
                src="/bejoice-logo-group.png"
                alt="Bejoice"
                loading="lazy" decoding="async"
                style={{ height: '230px', width: 'auto', objectFit: 'contain', display: 'block', opacity: 0.92 }}
              />
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, items]) => (
            <div key={category} className={isAr ? 'footer-col-ar-shift' : 'footer-col-shift'} style={{ textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{
                fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif",
                fontSize: 'clamp(11px,1.1vw,14px)',
                letterSpacing: isAr ? 0 : '0.3em',
                textTransform: isAr ? 'none' : 'uppercase',
                color: 'rgba(91,194,231,0.92)',
                fontWeight: 600,
                marginBottom: '20px'
              }}>
                {isAr ? (ar.footer.categories[category] || category) : category}
              </div>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}>
                    {item === 'Key Markets' ? (
                      <a
                        href="#globe-mid"
                        onClick={(e) => {
                          e.preventDefault()
                          const el = document.getElementById('globe-mid')
                          if (el) {
                            if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0, immediate: true })
                            else el.scrollIntoView({ behavior: 'instant' })
                          }
                        }}
                        style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.90)', textDecoration: 'none', transition: 'color 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                      >
                        {isAr ? ar.nav.bejoiceWings : 'Bejoice Wings'}
                      </a>
                    ) : item === 'Careers' ? (
                      <button
                        onClick={() => setCareersOpen(true)}
                        style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.90)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                      >
                        {isAr ? (ar.footer.links?.['Careers'] || 'Careers') : 'Careers'}
                      </button>
                    ) : (
                      <a
                        href={item === 'Track Shipment' ? 'https://www.track-trace.com/' : (item === 'Get a Quote' || item === 'Contact Us') ? '#contact' : item === 'Why Bejoice' ? '#why-us' : item === 'Certifications' ? '#certifications' : item === 'Our Offices' ? '#globe' : item === 'About Bejoice' ? '#hero' : '#'}
                        onClick={(e) => {
                          const targets = {
                            'Get a Quote': 'contact',
                            'Contact Us': 'contact',
                            'Certifications': 'certifications',
                            'Why Bejoice': 'why-us',
                            'Our Offices': 'globe',
                            'About Bejoice': 'hero',
                          }
                          const targetId = targets[item]
                          if (targetId) {
                            e.preventDefault()
                            const el = document.getElementById(targetId)
                            if (el) {
                              if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80, immediate: true })
                              else el.scrollIntoView({ behavior: 'instant' })
                            }
                          }
                        }}
                        target={item === 'Track Shipment' ? '_blank' : undefined}
                        rel={item === 'Track Shipment' ? 'noopener noreferrer' : undefined}
                        style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.90)', textDecoration: 'none', transition: 'color 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
                      >
                        {isAr ? (ar.footer.links[item] || item) : item}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className={isAr ? 'footer-contact-col footer-col-ar-shift' : 'footer-contact-col footer-col-shift'} style={{ textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr' }}>
            <div style={{
              fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif",
              fontSize: 'clamp(11px,1.1vw,14px)',
              letterSpacing: isAr ? 0 : '0.3em',
              textTransform: isAr ? 'none' : 'uppercase',
              color: 'rgba(91,194,231,0.92)',
              fontWeight: 600,
              marginBottom: '20px'
            }}>{isAr ? ar.footer.categories['Contact Us'] : 'Contact Us'}</div>
            <ul className="space-y-4">
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg style={{ flexShrink: 0, marginTop: '3px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(91,194,231,0.7)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <a href="tel:+966138233461" dir="ltr" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.90)', textDecoration: 'none', transition: 'color 0.3s', lineHeight: 1.5, direction: 'ltr', unicodeBidi: 'embed' }}
                    onMouseEnter={e => e.target.style.color = '#ffffff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.90)'}
                  >+966 13 823 3461</a>
                  <span style={{ color: 'rgba(91,194,231,0.5)', fontSize: '12px' }}>·</span>
                  <a href="mailto:info@bejoiceshipping-ksa.com" dir="ltr" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.90)', textDecoration: 'none', transition: 'color 0.3s', lineHeight: 1.5, direction: 'ltr', unicodeBidi: 'embed', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.target.style.color = '#ffffff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.90)'}
                  >info@bejoiceshipping-ksa.com</a>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg style={{ flexShrink: 0, marginTop: '3px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(91,194,231,0.7)" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif", fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.90)', lineHeight: 1.6, textAlign: isAr ? 'right' : 'left', direction: isAr ? 'rtl' : 'ltr' }}>
                  {isAr ? ar.footer.address.split('\n').map((line, i) => <span key={i}>{line}<br/></span>) : <>Al&nbsp;Raja&nbsp;Avenue,&nbsp;Block&nbsp;A,&nbsp;1st&nbsp;floor, <span style={{whiteSpace:'nowrap'}}>Office No. 2, Dammam 32234, KSA</span></>}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '40px 0' }} />

        {/* ── Social badges: LinkedIn + Instagram ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/bejoice-shipping-llc/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '14px',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, rgba(0,119,181,0.10) 0%, rgba(0,80,130,0.06) 100%)',
              border: '1px solid rgba(0,119,181,0.35)',
              borderRadius: '4px',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.35s, box-shadow 0.35s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,119,181,0.7)'
              e.currentTarget.style.boxShadow = '0 0 32px rgba(0,119,181,0.18), inset 0 0 20px rgba(0,119,181,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,119,181,0.35)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent, rgba(0,119,181,0.9), transparent)', animation: 'liSweep 3.5s ease-in-out infinite' }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, background: 'linear-gradient(135deg, #0077B5 0%, #005983 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,119,181,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(15px,1.4vw,18px)', letterSpacing: '0.18em', color: '#ffffff', lineHeight: 1.1 }}>BEJOICE SHIPPING LLC</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(11px,1vw,13px)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(0,169,255,0.75)', marginTop: 3, fontWeight: 600 }}>{isAr ? ar.footer.followLinkedIn : 'Follow on LinkedIn'}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4, flexShrink: 0, opacity: 0.6 }}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="rgba(0,169,255,0.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/bejoice_shipping?igsh=MWVtN2JtdzJuNTRjeA%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '14px',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, rgba(225,48,108,0.08) 0%, rgba(130,58,180,0.06) 100%)',
              border: '1px solid rgba(225,48,108,0.30)',
              borderRadius: '4px',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.35s, box-shadow 0.35s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(225,48,108,0.65)'
              e.currentTarget.style.boxShadow = '0 0 32px rgba(225,48,108,0.15), inset 0 0 20px rgba(225,48,108,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(225,48,108,0.30)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent, rgba(225,48,108,0.9), transparent)', animation: 'igSweep 3.5s ease-in-out infinite 1.75s' }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(225,48,108,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(15px,1.4vw,18px)', letterSpacing: '0.18em', color: '#ffffff', lineHeight: 1.1 }}>@BEJOICE_SHIPPING</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(11px,1vw,13px)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,120,160,0.75)', marginTop: 3, fontWeight: 600 }}>{isAr ? ar.footer.followInstagram : 'Follow on Instagram'}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4, flexShrink: 0, opacity: 0.6 }}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="rgba(255,120,160,0.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
          <div style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif", fontSize: 'clamp(13px,1.4vw,16px)', color: 'rgba(255,255,255,0.55)', direction: isAr ? 'rtl' : 'ltr' }}>
            {isAr ? ar.footer.rights : '© Bejoice Shipping Company'}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {Object.keys(POLICIES).map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(e) => { e.preventDefault(); setOpenPolicy(item) }}
                style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "'DM Sans', sans-serif", fontSize: 'clamp(12px,1.3vw,15px)', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', cursor: 'pointer', letterSpacing: isAr ? 0 : '0.05em', transition: 'all 0.3s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
              >
                {isAr ? (ar.footer.policies[item] || item) : item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {openPolicy && createPortal(<PolicyModal title={openPolicy} onClose={() => setOpenPolicy(null)} />, document.body)}
      {careersOpen && createPortal(<CareersModal onClose={() => setCareersOpen(false)} />, document.body)}
    </footer>
  )
}
