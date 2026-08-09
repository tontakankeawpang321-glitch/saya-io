import { DraftDocument, DraftToken, DocumentItem } from '../types';

export const DEFAULT_TOKENS: DraftToken[] = [
  // Header / Metadata Tokens
  { id: 't-garuda', label: 'ตราครุฑราชการ', value: '[ตราครุฑ]', category: 'header', description: 'ตราสัญลักษณ์หนังสือราชการไทย' },
  { id: 't-dept', label: 'ส่วนราชการ / หน่วยงาน', value: 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล โทร. ๐-๒๑๒๓-๔๕๖๗', category: 'header', description: 'ชื่อหน่วยงานเจ้าของเรื่อง' },
  { id: 't-docno', label: 'เลขที่หนังสือ', value: 'ที่ กห ๐๒๐๑/ว ', category: 'meta', description: 'เลขทะเบียนหนังสือออก' },
  { id: 't-date', label: 'วันที่ปัจจุบัน (ไทย)', value: new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date()), category: 'date', description: 'วันที่ระบุในเอกสาร' },
  { id: 't-subject', label: 'เรื่อง', value: 'ขออนุมัติดำเนินโครงการพัฒนาระบบข้อมูลองค์กร', category: 'meta', description: 'หัวข้อเรื่อง' },
  { id: 't-to', label: 'เรียน', value: 'ผู้อำนวยการสำนักบริหาร / ผู้บริหารระดับสูง', category: 'meta', description: 'ผู้รับเอกสาร' },
  
  // Body Tokens / Paragraphs
  { id: 't-intro-1', label: 'คำเกริ่นนำ (ตามที่...)', value: 'ตามที่ หน่วยงานได้มีแผนการดำเนินงานประจำปีงบประมาณ พ.ศ. ๒๕๖๘ เพื่อยกระดับการปฏิบัติงาน...', category: 'body', description: 'ข้อความเกริ่นนำความเป็นมา' },
  { id: 't-intro-2', label: 'คำเกริ่นนำ (ด้วย...)', value: 'ด้วย หน่วยงานมีความประสงค์จะจัดทำโครงการปรับปรุงและพัฒนาระบบบริหารจัดการเอกสารอิเล็กทรอนิกส์...', category: 'body', description: 'ข้อความระบุความประสงค์' },
  { id: 't-obj', label: 'วัตถุประสงค์โครงการ', value: 'ในการนี้ เพื่อให้การดำเนินงานเป็นไปด้วยความเรียบร้อย มีประสิทธิภาพ และเกิดความคุ้มค่าสูงสุดต่อองค์กร จึงขอเสนอรายละเอียดดังนี้\n๑. เพิ่มความสะดวกรวดเร็วในการสืบค้นข้อมูล\n๒. รองรับการทำงานแบบไร้กระดาษ (Paperless)\n๓. รักษาความมั่นคงปลอดภัยของข้อมูลสารสนเทศ', category: 'body', description: 'รายการวัตถุประสงค์ 3 ข้อ' },
  { id: 't-conclude', label: 'คำลงท้าย (จึงเรียนมาเพื่อ...)', value: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ / เห็นชอบ', category: 'body', description: 'คำลงท้ายแบบราชการ' },
  
  // Signature Tokens
  { id: 't-sign-1', label: 'ลายมือชื่อและตำแหน่ง', value: '( นายสมศักดิ์ นำพาความก้าวหน้า )\nหัวหน้ากลุ่มงานบริหารและวิเทศสัมพันธ์', category: 'signature', description: 'ผู้ลงนามและตำแหน่ง' },
  { id: 't-sign-2', label: 'ตำแหน่งผู้บังคับบัญชา', value: '( นางสาวพิมพา พัฒนาการดี )\nผู้อำนวยการกองแผนงานและงบประมาณ', category: 'signature', description: 'ผู้ลงนามระดับบริหาร' }
];

export const TEMPLATES: Record<string, Omit<DraftDocument, 'id'>> = {
  official_memo: {
    title: 'บันทึกข้อความราชการ (มาตรฐาน)',
    docType: 'official_memo',
    docTypeTitle: 'บันทึกข้อความ',
    docNumber: 'กห ๐๒๐๑/ว ๔๕๒',
    department: 'สำนักบริหารยุทธศาสตร์และเทคโนโลยีดิจิทัล',
    departmentSub: 'กลุ่มงานพัฒนานวัตกรรมระบบงานสารบรรณ',
    phone: '๐ ๒๒๓๔ ๕๖๗๘ ต่อ ๑๒๓',
    email: 'saraban@digital-hub.go.th',
    date: '๘ สิงหาคม ๒๕๖๘',
    subject: 'ขออนุมัติดำเนินการพัฒนาระบบคลังเอกสารดิจิทัลและแบบร่างจำลองเสมือนจริง',
    to: 'ผู้อำนวยการสำนักบริหารงานกลาง',
    reference: 'หนังสือด่วนที่สุด ที่ กห ๐๒๐๑/๑๐๕ ลงวันที่ ๑๕ กรกฎาคม ๒๕๖๘',
    attachments: '๑. เอกสารข้อเสนอโครงการฉบับสมบูรณ์ จำนวน ๑ ชุด\n๒. รายละเอียดงบประมาณและกรอบระยะเวลาดำเนินงาน จำนวน ๑ แผ่น',
    hasReference: true,
    hasAttachments: true,
    content: `๑. ความเป็นมา
ตามที่ สำนักบริหารงานกลางได้มีนโยบายขับเคลื่อนองค์กรสู่ระบบดิจิทัล (Digital Transformation) เพื่อลดการใช้กระดาษ (Paperless) และเพิ่มประสิทธิภาพในการเข้าถึงและสืบค้นข้อมูลเอกสารของบุคลากรภายในองค์กรนั้น

๒. ข้อเท็จจริงและรายละเอียดการดำเนินงาน
กลุ่มงานพัฒนานวัตกรรมดิจิทัลได้ดำเนินการออกแบบและพัฒนาระบบ Corporate Document Hub & Draft Simulator ซึ่งมีคุณสมบัติสำคัญดังนี้:
   ๒.๑ สามารถเชื่อมโยงฐานข้อมูลเอกสาร Google Sheets แสดงผลได้อย่างรวดเร็ว
   ๒.๒ ระบบจำลองร่างเอกสาร (A4 Live Simulator) ปรับแก้ไขได้ทุกส่วนแบบสมจริง ๑๐๐%
   ๒.๓ รองรับการดึงเอกสาร PDF / Word และอัปโหลดไฟล์จากเครื่องมาแก้ไขได้ทันที
   ๒.๔ สามารถแทรกรูปภาพ ตราองค์กร ตราครุฑ และปรับขนาดกระดาษได้เสมือนจริง
   ๒.๕ รองรับการส่งออกเป็นไฟล์ Microsoft Word (.doc) มาตรฐานงานสารบรรณ

๓. ข้อพิจารณาและข้อเสนอแนะ
เพื่อให้การนำร่องใช้งานระบบเป็นไปด้วยความเรียบร้อย เกิดประโยชน์สูงสุดต่อองค์กร จึงเห็นควรอนุมัติให้เปิดใช้งานระบบดังกล่าว`,
    closingPhrase: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ',
    signName: '( นายสมศักดิ์ นำพาความก้าวหน้า )',
    signPosition: 'หัวหน้ากลุ่มงานพัฒนานวัตกรรมดิจิทัล',
    signActing: 'ปฏิบัติราชการแทน ผู้อำนวยการกองเทคโนโลยีสารสนเทศ',
    hasActingPosition: false,
    hasRoutingSlip: true,
    routingComment: 'อนุมัติตามเสนอ มอบหมายกลุ่มงานบริหารงานทั่วไปประสานงานต่อไป',
    routingSignName: '( นายวิเชียร บริหารการดี )',
    routingDate: '๙ สิงหาคม ๒๕๖๘',
    showGaruda: true,
    logoType: 'garuda',
    garudaSize: 'md',
    garudaPosition: 'left',
    attachedImages: [],
    paperSize: 'a4',
    paperOrientation: 'portrait',
    paperMargin: 'standard_thai',
    showPageRuler: false,
    showPageBorders: true,
    showWatermark: false,
    watermarkText: 'แบบร่างจำลอง',
    fontSize: 'base',
    lineSpacing: 'relaxed',
    textAlign: 'justify',
    useThaiNumerals: true,
  },
  external_letter: {
    title: 'หนังสือราชการภายนอก (ตราครุฑกึ่งกลาง)',
    docType: 'external_letter',
    docTypeTitle: 'หนังสือภายนอก',
    docNumber: 'กห ๐๑๐๕/๓๑๘',
    department: 'สำนักงานส่งเสริมและพัฒนานวัตกรรมดิจิทัลภาครัฐ',
    departmentSub: 'ถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพมหานคร ๑๐๒๑๐',
    phone: '๐ ๒๑๔๑ ๙๙๙๙',
    email: 'contact@dga-innovation.or.th',
    date: '๑๕ สิงหาคม ๒๕๖๘',
    subject: 'ขอความอนุเคราะห์ส่งบุคลากรเข้าร่วมการอบรมเชิงปฏิบัติการระบบงานเอกสารอิเล็กทรอนิกส์',
    to: 'อธิบดีกรมความร่วมมือระหว่างประเทศ',
    reference: 'แผนแม่บทการพัฒนาบุคลากรภาครัฐด้านดิจิทัล พ.ศ. ๒๕๖๘ - ๒๕๗๐',
    attachments: '๑. กำหนดการอบรมเชิงปฏิบัติการ จำนวน ๑ ฉบับ\n๒. แบบตอบรับการเข้าร่วมอบรม จำนวน ๑ แผ่น',
    hasReference: true,
    hasAttachments: true,
    content: `ด้วย สำนักงานส่งเสริมและพัฒนานวัตกรรมดิจิทัลภาครัฐ กำหนดจัดการฝึกอบรมเชิงปฏิบัติการหลักสูตร "การบริหารจัดการเอกสารและหนังสือราชการยุคดิจิทัลอย่างมืออาชีพ" ในวันที่ ๒๕-๒๖ สิงหาคม ๒๕๖๘ ณ ห้องประชุมสัมมนา อาคารนวัตกรรมดิจิทัล

การอบรมครั้งนี้มีวัตถุประสงค์เพื่อพัฒนาศักยภาพเจ้าหน้าที่ผู้ปฏิบัติงานด้านสารบรรณ ให้มีความรู้ความเข้าใจในมาตรฐานเอกสารดิจิทัล การใช้งานโปรแกรมร่างเอกสารเสมือนจริง และการรักษาความปลอดภัยของข้อมูลสารสนเทศ

สำนักงานฯ พิจารณาเห็นว่าการอบรมดังกล่าวจะเป็นประโยชน์อย่างยิ่งต่อการปฏิบัติงานของหน่วยงานท่าน จึงใคร่ขอความอนุเคราะห์พิจารณาส่งบุคลากรในสังกัด จำนวน ๒ ท่าน เข้าร่วมการฝึกอบรมตามวัน เวลา และสถานที่ดังกล่าวข้างต้น โดยไม่เสียค่าใช้จ่าย`,
    closingPhrase: 'ขอแสดงความนับถือ',
    signName: '( นายชัชวาล วัฒนกุลธร )',
    signPosition: 'ผู้อำนวยการสำนักงานส่งเสริมและพัฒนานวัตกรรมดิจิทัลภาครัฐ',
    signActing: '',
    hasActingPosition: false,
    hasRoutingSlip: false,
    showGaruda: true,
    logoType: 'garuda',
    garudaSize: 'lg',
    garudaPosition: 'center',
    attachedImages: [],
    paperSize: 'a4',
    paperOrientation: 'portrait',
    paperMargin: 'standard_thai',
    showPageRuler: false,
    showPageBorders: true,
    showWatermark: false,
    watermarkText: 'หนังสือภายนอก',
    fontSize: 'base',
    lineSpacing: 'relaxed',
    textAlign: 'justify',
    useThaiNumerals: true,
  },
  announcement: {
    title: 'ประกาศองค์กร / ข้อปฏิบัติ',
    docType: 'announcement',
    docTypeTitle: 'ประกาศหน่วยงาน',
    docNumber: 'ประกาศที่ ๑๕/๒๕๖๘',
    department: 'คณะกรรมการบริหารงานบุคคลและสารสนเทศองค์กร',
    departmentSub: '',
    phone: '๐ ๒๒๒๒ ๓๓๔๔',
    email: 'hr-policy@corporate-hub.co.th',
    date: '๑ สิงหาคม ๒๕๖๘',
    subject: 'เรื่อง แนวทางการรักษาความมั่นคงปลอดภัยข้อมูลและสารสนเทศดิจิทัล',
    to: 'พนักงานและบุคลากรทุกท่าน',
    reference: '',
    attachments: '',
    hasReference: false,
    hasAttachments: false,
    content: `เพื่อให้การปฏิบัติงานด้านเอกสารและข้อมูลสารสนเทศขององค์กร มีมาตรฐานด้านความปลอดภัยสูงสุด สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) จึงขอประกาศแนวปฏิบัติดังต่อไปนี้:

ข้อ ๑ ห้ามมิให้เปิดเผย ถ่ายทอด หรือส่งต่อเอกสารข้อมูลลับขององค์กรแก่บุคคลภายนอกโดยไม่ได้รับอนุมัติจากผู้บังคับบัญชา
ข้อ ๒ การจัดทำเอกสารและหนังสือภายใน ขอให้ดำเนินการผ่านระบบ Corporate Document Hub & Simulator เท่านั้น
ข้อ ๓ ให้เจ้าหน้าที่ทุกคนเปลี่ยนรหัสผ่านการเข้าถึงระบบทุก ๆ ๙๐ วัน เพื่อความปลอดภัย

ทั้งนี้ ให้มีผลบังคับใช้ตั้งแต่วันที่ประกาศนี้เป็นต้นไป`,
    closingPhrase: 'ประกาศ ณ วันที่ ๑ สิงหาคม พ.ศ. ๒๕๖๘',
    signName: '( นางจันทรา พิสิฐพัฒน์ )',
    signPosition: 'ประธานกรรมการบริหารงานสารสนเทศ',
    signActing: '',
    hasActingPosition: false,
    hasRoutingSlip: false,
    showGaruda: true,
    logoType: 'garuda',
    garudaSize: 'md',
    garudaPosition: 'center',
    attachedImages: [],
    paperSize: 'a4',
    paperOrientation: 'portrait',
    paperMargin: 'standard_thai',
    showPageRuler: false,
    showPageBorders: true,
    showWatermark: false,
    watermarkText: 'ประกาศทางการ',
    fontSize: 'base',
    lineSpacing: 'relaxed',
    textAlign: 'justify',
    useThaiNumerals: true,
  },
  approval_request: {
    title: 'บันทึกข้อความขออนุมัติงบประมาณและจัดซื้อจัดจ้าง',
    docType: 'official_memo',
    docTypeTitle: 'บันทึกข้อความ',
    docNumber: 'พสด ๑๐๔/๒๕๖๘',
    department: 'กลุ่มงานพัสดุและบริหารทรัพย์สิน',
    departmentSub: 'กองคลังและพัสดุ โทร. ๕๔๓๒',
    phone: '๐ ๒๑๒๓ ๔๕๖๗',
    email: 'procurement@dept.go.th',
    date: '๕ สิงหาคม ๒๕๖๘',
    subject: 'ขออนุมัติจัดซื้อจัดจ้างอุปกรณ์คอมพิวเตอร์และระบบเครือข่ายความเร็วสูง',
    to: 'ประธานคณะกรรมการจัดซื้อจัดจ้างและงบประมาณ',
    reference: 'คำสั่งแต่งตั้งคณะกรรมการจัดซื้อจัดจ้าง ที่ ๑๒/๒๕๖๘ ลงวันที่ ๑๐ มกราคม ๒๕๖๘',
    attachments: '๑. รายการขอบเขตของงาน (TOR) จำนวน ๑ ชุด\n๒. ตารางเปรียบเทียบราคากลาง จำนวน ๑ แผ่น',
    hasReference: true,
    hasAttachments: true,
    content: `๑. ความเป็นมา
ด้วย ฝ่ายเทคโนโลยีสารสนเทศ มีความจำเป็นต้องจัดซื้ออุปกรณ์คอมพิวเตอร์แม่ข่ายและเครื่องลูกข่ายสำหรับรองรับงานคลังเอกสารอิเล็กทรอนิกส์

๒. รายละเอียดและวงเงินงบประมาณ
ในการนี้ กลุ่มงานพัสดุฯ ได้ดำเนินการกำหนดคุณลักษณะเฉพาะและราคากลาง รวมเป็นเงินทั้งสิ้น ๒๕๐,๐๐๐ บาท (สองแสนห้าหมื่นบาทถ้วน) โดยเบิกจ่ายจากงบประมาณรายจ่ายประจำปี ๒๕๖๘ หมวดค่าครุภัณฑ์

๓. ข้อเสนอ
จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ดำเนินการจัดซื้อจัดจ้างตามระเบียบต่อไป`,
    closingPhrase: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ',
    signName: '( นายธีรภัทร มั่นคงทรัพย์ )',
    signPosition: 'นักวิชาการพัสดุชำนาญการ',
    signActing: '',
    hasActingPosition: false,
    hasRoutingSlip: true,
    routingComment: 'อนุมัติตามเสนอ ดำเนินการตามระเบียบพัสดุ',
    routingSignName: '( นายอนุสรณ์ นิติกุล )',
    routingDate: '๖ สิงหาคม ๒๕๖๘',
    showGaruda: true,
    logoType: 'garuda',
    garudaSize: 'md',
    garudaPosition: 'left',
    attachedImages: [],
    paperSize: 'a4',
    paperOrientation: 'portrait',
    paperMargin: 'standard_thai',
    showPageRuler: false,
    showPageBorders: true,
    showWatermark: false,
    watermarkText: 'ขออนุมัติ',
    fontSize: 'base',
    lineSpacing: 'relaxed',
    textAlign: 'justify',
    useThaiNumerals: true,
  }
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'seed-1',
    name: 'คู่มือระเบียบงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม',
    url: 'https://docs.google.com/document/d/1exampleDoc01/edit',
    category: 'ระเบียบและข้อบังคับ',
    fileType: 'Word Document',
    iconClass: 'FileCode2',
    typeClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'seed-2',
    name: 'แบบฟอร์มขออนุมัติโครงการและแผนการใช้งบประมาณประจำปี 2568',
    url: 'https://docs.google.com/spreadsheets/d/1exampleSheet02/edit',
    category: 'แผนงานและงบประมาณ',
    fileType: 'Spreadsheet',
    iconClass: 'FileSpreadsheet',
    typeClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'seed-3',
    name: 'ประกาศมาตรฐานการรักษาความมั่นคงปลอดภัยสารสนเทศองค์กร',
    url: 'https://example.com/security_policy_2025.pdf',
    category: 'ประกาศและคำสั่ง',
    fileType: 'PDF Document',
    iconClass: 'FileText',
    typeClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  },
  {
    id: 'seed-4',
    name: 'แบบร่างหนังสือราชการภายนอกและบันทึกข้อความภายในองค์กร',
    url: 'https://docs.google.com/document/d/1exampleMemo04/edit',
    category: 'แบบฟอร์มเอกสาร',
    fileType: 'Word Document',
    iconClass: 'FileCode2',
    typeClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'seed-5',
    name: 'สไลด์สรุปผลการดำเนินงานไตรมาสที่ 1 ประจำปี 2026',
    url: 'https://docs.google.com/presentation/d/1exampleSlide05/edit',
    category: 'รายงานและสถิติ',
    fileType: 'Presentation',
    iconClass: 'Presentation',
    typeClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 'seed-6',
    name: 'แบบสำรวจความต้องการใช้งานและประเมินระบบงานบริการดิจิทัล',
    url: 'https://docs.google.com/forms/d/1exampleForm06/viewform',
    category: 'แบบสำรวจและประเมิน',
    fileType: 'Online Form',
    iconClass: 'CheckSquare',
    typeClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  }
];
