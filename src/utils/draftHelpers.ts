import mammoth from 'mammoth';
import { DraftDocument, DocumentItem, AttachedImage } from '../types';

// Convert Arabic digits to Thai digits
export function toThaiNumerals(str: string): string {
  if (!str) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit, 10)]);
}

// Convert Thai digits to Arabic digits
export function toArabicNumerals(str: string): string {
  if (!str) return '';
  const thaiDigits: Record<string, string> = {
    '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
    '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9'
  };
  return str.replace(/[๐-๙]/g, (char) => thaiDigits[char] || char);
}

// Format current date in Thai official format
export function getThaiCurrentDate(): string {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const now = new Date();
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear() + 543;
  return `${toThaiNumerals(day.toString())} ${month} ๒๕๖๘`;
}

// Paper dimensions in mm and standard px (at 96 DPI: 1mm = 3.779527559px)
export interface PaperDimensionResult {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  label: string;
}

export function getPaperDimensions(
  paperSize: 'a4' | 'letter' | 'legal' | 'a5' | 'a3' | 'custom',
  orientation: 'portrait' | 'landscape' = 'portrait',
  customWidthMm?: number,
  customHeightMm?: number
): PaperDimensionResult {
  let w = 210;
  let h = 297;
  let label = 'A4 (210 × 297 มม.)';

  switch (paperSize) {
    case 'a4':
      w = 210;
      h = 297;
      label = 'A4 (210 × 297 มม.)';
      break;
    case 'letter':
      w = 215.9;
      h = 279.4;
      label = 'Letter (215.9 × 279.4 มม.)';
      break;
    case 'legal':
      w = 215.9;
      h = 355.6;
      label = 'Legal (216 × 356 มม.)';
      break;
    case 'a5':
      w = 148;
      h = 210;
      label = 'A5 (148 × 210 มม.)';
      break;
    case 'a3':
      w = 297;
      h = 420;
      label = 'A3 (297 × 420 มม.)';
      break;
    case 'custom':
      w = customWidthMm && customWidthMm > 50 ? customWidthMm : 210;
      h = customHeightMm && customHeightMm > 50 ? customHeightMm : 297;
      label = `กำหนดเอง (${w} × ${h} มม.)`;
      break;
  }

  if (orientation === 'landscape') {
    const temp = w;
    w = h;
    h = temp;
    label += ' [แนวนอน]';
  }

  const mmToPx = 3.779527559;
  return {
    widthMm: w,
    heightMm: h,
    widthPx: Math.round(w * mmToPx),
    heightPx: Math.round(h * mmToPx),
    label,
  };
}

export interface PaperMarginResult {
  topCm: number;
  bottomCm: number;
  leftCm: number;
  rightCm: number;
  topPx: number;
  bottomPx: number;
  leftPx: number;
  rightPx: number;
}

export function getPaperMargins(
  marginType: 'standard_thai' | 'narrow' | 'normal' | 'wide' | 'custom',
  customTop?: number,
  customBottom?: number,
  customLeft?: number,
  customRight?: number
): PaperMarginResult {
  let top = 2.5;
  let bottom = 2.0;
  let left = 3.0; // Official standard thai sarabun left margin is 2.5 - 3.0 cm
  let right = 2.0;

  switch (marginType) {
    case 'standard_thai':
      top = 2.5;
      bottom = 2.0;
      left = 3.0;
      right = 2.0;
      break;
    case 'narrow':
      top = 1.27;
      bottom = 1.27;
      left = 1.27;
      right = 1.27;
      break;
    case 'normal':
      top = 2.54;
      bottom = 2.54;
      left = 2.54;
      right = 2.54;
      break;
    case 'wide':
      top = 2.54;
      bottom = 2.54;
      left = 3.81;
      right = 3.81;
      break;
    case 'custom':
      top = customTop ?? 2.5;
      bottom = customBottom ?? 2.0;
      left = customLeft ?? 3.0;
      right = customRight ?? 2.0;
      break;
  }

  // 1cm = 10mm = 37.795px
  const cmToPx = 37.79527559;
  return {
    topCm: top,
    bottomCm: bottom,
    leftCm: left,
    rightCm: right,
    topPx: Math.round(top * cmToPx),
    bottomPx: Math.round(bottom * cmToPx),
    leftPx: Math.round(left * cmToPx),
    rightPx: Math.round(right * cmToPx),
  };
}

// Extract structured Thai official letter fields from raw text
export function parseThaiOfficialFields(rawText: string, fileName?: string) {
  let docNumber = '';
  let department = '';
  let departmentSub = '';
  let date = '';
  let subject = '';
  let to = '';
  let reference = '';
  let attachments = '';
  let closingPhrase = 'จึงเรียนมาเพื่อโปรดพิจารณา';
  let signName = '';
  let signPosition = '';

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Look for "ที่"
  for (const line of lines) {
    if (!docNumber && /^ที่\s*[:\s](.+)$/i.test(line)) {
      docNumber = line.replace(/^ที่\s*[:\s]*/i, '').trim();
    }
    if (!department && /^(ส่วนราชการ|จาก|หน่วยงาน)\s*[:\s](.+)$/i.test(line)) {
      department = line.replace(/^(ส่วนราชการ|จาก|หน่วยงาน)\s*[:\s]*/i, '').trim();
    }
    if (!date && /^(วันที่|ณ\s*วันที่)\s*[:\s](.+)$/i.test(line)) {
      date = line.replace(/^(วันที่|ณ\s*วันที่)\s*[:\s]*/i, '').trim();
    }
    if (!subject && /^(เรื่อง|หัวข้อ)\s*[:\s](.+)$/i.test(line)) {
      subject = line.replace(/^(เรื่อง|หัวข้อ)\s*[:\s]*/i, '').trim();
    }
    if (!to && /^(เรียน|กราบเรียน|ถึง)\s*[:\s](.+)$/i.test(line)) {
      to = line.replace(/^(เรียน|กราบเรียน|ถึง)\s*[:\s]*/i, '').trim();
    }
    if (!reference && /^(อ้างถึง)\s*[:\s](.+)$/i.test(line)) {
      reference = line.replace(/^(อ้างถึง)\s*[:\s]*/i, '').trim();
    }
    if (!attachments && /^(สิ่งที่ส่งมาด้วย)\s*[:\s](.+)$/i.test(line)) {
      attachments = line.replace(/^(สิ่งที่ส่งมาด้วย)\s*[:\s]*/i, '').trim();
    }
    if (/^(จึงเรียนมาเพื่อ|ขอแสดงความนับถือ|ประกาศ\s*ณ)/i.test(line)) {
      closingPhrase = line.trim();
    }
    if (!signName && /^\((.+)\)$/.test(line)) {
      signName = line.trim();
    }
  }

  if (!subject && fileName) {
    subject = fileName.replace(/\.[^/.]+$/, '');
  }

  // Filter out header lines from content body
  const bodyLines = lines.filter((l) => {
    if (/^(บันทึกข้อความ|หนังสือภายนอก|คำสั่ง|ประกาศ)$/i.test(l)) return false;
    if (/^(ส่วนราชการ|ที่|วันที่|เรื่อง|เรียน|อ้างถึง|สิ่งที่ส่งมาด้วย)\s*[:\s]/i.test(l)) return false;
    if (/^\((นาย|นาง|นางสาว|ดร\.|พล|พัน|ร้อย|ผศ\.|รศ\.|ศ\.).+\)$/.test(l)) return false;
    return true;
  });

  const content = bodyLines.length > 0 ? bodyLines.join('\n\n') : rawText;

  return {
    docNumber: docNumber || 'กห ๐๒๐๑/ว ' + toThaiNumerals(Math.floor(100 + Math.random() * 899).toString()),
    department: department || 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล',
    departmentSub: departmentSub || 'กลุ่มงานพัฒนาระบบเอกสารสารบรรณ',
    date: date || getThaiCurrentDate(),
    subject: subject || (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'บันทึกข้อความและรายงานผลการดำเนินงาน'),
    to: to || 'ผู้อำนวยการสำนักบริหารงานกลาง / ผู้มีอำนาจลงนาม',
    reference,
    attachments,
    content,
    closingPhrase,
    signName: signName || '( นายสมศักดิ์ นำพาความก้าวหน้า )',
    signPosition: signPosition || 'หัวหน้ากลุ่มงานพัฒนาระบบข้อมูลองค์กร',
  };
}

// Parse uploaded file (Word .docx, PDF, txt, md, etc.)
export async function parseUploadedFile(file: File): Promise<{
  title: string;
  docNumber: string;
  department: string;
  departmentSub: string;
  date: string;
  subject: string;
  to: string;
  reference: string;
  attachments: string;
  content: string;
  closingPhrase: string;
  signName: string;
  signPosition: string;
  rawText: string;
  fileType: string;
  isImage?: boolean;
  imageDataUrl?: string;
}> {
  const fileName = file.name;
  const extension = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();

  // If user uploaded an image file
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(extension)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          title: `รูปภาพ: ${fileName}`,
          docNumber: 'กห ๐๒๐๑/ว ' + toThaiNumerals(Math.floor(100 + Math.random() * 899).toString()),
          department: 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล',
          departmentSub: 'กลุ่มงานประชาสัมพันธ์และสารสนเทศ',
          date: getThaiCurrentDate(),
          subject: `เอกสารแนบรูปภาพ: ${fileName.replace(/\.[^/.]+$/, '')}`,
          to: 'ผู้บริหารและผู้เกี่ยวข้องทุกท่าน',
          reference: '',
          attachments: `๑. ไฟล์ภาพต้นฉบับ ${fileName}`,
          content: `๑. รายละเอียดภาพ\nไฟล์ภาพ "${fileName}" ได้รับการนำเข้าสู่ระบบเพื่อใช้เป็นตราสัญลักษณ์ หรือรูปภาพประกอบในหนังสือราชการ\n\n๒. วัตถุประสงค์\nเพื่อใช้เป็นหลักฐานและเอกสารประกอบการดำเนินงานอย่างเป็นทางการ`,
          closingPhrase: 'จึงเรียนมาเพื่อโปรดทราบและพิจารณา',
          signName: '( นายสมศักดิ์ นำพาความก้าวหน้า )',
          signPosition: 'หัวหน้ากลุ่มงานพัฒนานวัตกรรมดิจิทัล',
          rawText: `Image file: ${fileName}`,
          fileType: 'Image',
          isImage: true,
          imageDataUrl: dataUrl,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // If Word Document (.docx)
  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value || '';
      const parsed = parseThaiOfficialFields(rawText, fileName);

      return {
        title: `นำเข้าจาก Word: ${fileName}`,
        ...parsed,
        rawText,
        fileType: 'Word Document (.docx)',
      };
    } catch (e: any) {
      console.warn('Mammoth extraction fallback:', e);
      return {
        title: `นำเข้าจาก Word: ${fileName}`,
        docNumber: 'กห ๐๒๐๑/ว ๕๐๑',
        department: 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล',
        departmentSub: 'กลุ่มงานบริหารเอกสารอิเล็กทรอนิกส์',
        date: getThaiCurrentDate(),
        subject: fileName.replace(/\.[^/.]+$/, ''),
        to: 'ผู้อำนวยการสำนักบริหารงานกลาง',
        reference: `ไฟล์นำเข้า: ${fileName}`,
        attachments: '๑. สำเนาไฟล์ Word ต้นฉบับ',
        content: `๑. ความเป็นมา\nตามที่ได้รับไฟล์เอกสาร ${fileName} เพื่อนำมาปรับปรุงแก้ไขในระบบร่างเอกสารเสมือนจริง\n\n๒. รายละเอียดเนื้อหา\nเอกสารนี้ถูกนำเข้าเพื่อการจัดทำแบบร่างและส่งออกตามมาตรฐานงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม`,
        closingPhrase: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ',
        signName: '( นายสมศักดิ์ นำพาความก้าวหน้า )',
        signPosition: 'หัวหน้ากลุ่มงานพัฒนานวัตกรรมดิจิทัล',
        rawText: `Word Document: ${fileName}`,
        fileType: 'Word Document (.docx)',
      };
    }
  }

  // If PDF file
  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    // Try to extract readable text strings from PDF binary stream
    let extracted = '';
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const raw = decoder.decode(arrayBuffer);
      // Look for stream text blocks or standard text
      const matches = raw.match(/\(([^)]+)\)\s*Tj/g) || raw.match(/BT[\s\S]*?ET/g);
      if (matches && matches.length > 0) {
        extracted = matches
          .map((m) => m.replace(/[\(\)Tj\\\/]/g, ' ').trim())
          .filter((m) => m.length > 3)
          .join('\n');
      }
    } catch (err) {
      console.warn('PDF stream decode:', err);
    }

    const parsed = parseThaiOfficialFields(extracted || `เอกสาร ${fileName}`, fileName);

    return {
      title: `นำเข้าจาก PDF: ${fileName}`,
      ...parsed,
      content: parsed.content && parsed.content.length > 30
        ? parsed.content
        : `๑. ความเป็นมาและสาระสำคัญ\nตามที่ได้นำเข้าเอกสารไฟล์ PDF ชื่อ "${fileName}" เข้าสู่ระบบเพื่อทำการแก้ไข ดัดแปลง หรือจัดทำแบบร่างมาตรฐานนั้น\n\n๒. รายละเอียดข้อพิจารณา\nหน่วยงานได้ทำการตรวจสอบโครงสร้างเอกสาร และจัดวางรูปแบบให้สอดคล้องกับระเบียบงานสารบรรณ โดยสามารถแก้ไขข้อความ ตราสัญลักษณ์ และข้อมูลผู้ลงนามได้โดยตรงบนหน้ากระดาษ A4 เสมือนจริง\n\n๓. ข้อเสนอแนะ\nเห็นควรใช้แบบร่างนี้เป็นต้นแบบในการออกหนังสือราชการหรือเอกสารทางการต่อไป`,
      rawText: extracted || `PDF File: ${fileName}`,
      fileType: 'PDF Document (.pdf)',
    };
  }

  // Plain text / Markdown / CSV / JSON
  const text = await file.text();
  const parsed = parseThaiOfficialFields(text, fileName);

  return {
    title: `นำเข้าจากไฟล์: ${fileName}`,
    ...parsed,
    rawText: text,
    fileType: extension.toUpperCase() + ' File',
  };
}

// Intelligently generate a realistic Thai official draft from a Repository DocumentItem
export function createDraftFromRepositoryDoc(doc: DocumentItem): DraftDocument {
  const nowStr = getThaiCurrentDate();
  const cleanDocName = doc.name.trim();

  // Determine appropriate department & subject based on category & fileType
  let dept = 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล';
  let deptSub = 'กลุ่มงานพัฒนานวัตกรรมและระบบข้อมูล';
  let recipient = 'ผู้อำนวยการสำนักบริหาร / ผู้มีอำนาจสั่งการ';
  let prefix = 'ขอส่งมอบและรายงานความก้าวหน้า';

  if (doc.category.includes('ระเบียบ') || doc.category.includes('ข้อบังคับ')) {
    dept = 'กลุ่มงานนิติการและระเบียบสารบรรณ';
    deptSub = 'กองบริหารกลาง';
    recipient = 'หัวหน้าส่วนราชการและบุคลากรทุกท่าน';
    prefix = 'แจ้งแนวทางปฏิบัติตาม';
  } else if (doc.category.includes('งบประมาณ') || doc.category.includes('แผนงาน') || doc.category.includes('พัสดุ')) {
    dept = 'กองแผนงานและงบประมาณการคลัง';
    deptSub = 'ฝ่ายบริหารพัสดุและสัญญา';
    recipient = 'ประธานคณะกรรมการจัดซื้อจัดจ้างและติดตามงบประมาณ';
    prefix = 'ขออนุมัติดำเนินการตามแบบฟอร์ม';
  } else if (doc.category.includes('ประกาศ') || doc.category.includes('คำสั่ง')) {
    dept = 'คณะกรรมการบริหารงานบุคคลและองค์กร';
    deptSub = 'สำนักอำนวยการ';
    recipient = 'พนักงานและเจ้าหน้าที่ผู้เกี่ยวข้องทุกท่าน';
    prefix = 'เรื่อง ประกาศถือปฏิบัติตาม';
  } else if (doc.category.includes('รายงาน') || doc.category.includes('สถิติ')) {
    dept = 'ศูนย์ข้อมูลและสารสนเทศยุทธศาสตร์';
    deptSub = 'กลุ่มวิเคราะห์และประเมินผล';
    recipient = 'คณะกรรมการบริหารและผู้บริหารระดับสูง';
    prefix = 'รายงานผลการดำเนินงานและสถิติข้อมูล';
  }

  const subject = `${prefix} ${cleanDocName}`;
  const docNum = `กห ๐๒๐๑/ว ${toThaiNumerals(Math.floor(100 + Math.random() * 899).toString())}`;

  const content = `๑. ความเป็นมาและวัตถุประสงค์
ตามที่ หน่วยงานได้มีการจัดเก็บและบริหารจัดการข้อมูลในคลังเอกสารองค์กร เรื่อง "${cleanDocName}" (หมวดหมู่: ${doc.category}) นั้น

๒. สาระสำคัญและรายละเอียดเอกสาร
จากการรวบรวมและตรวจสอบข้อมูลในระบบ Corporate Document Hub พบว่าเอกสารดังกล่าวเป็นเอกสารประเภท ${doc.fileType} ซึ่งมีความสำคัญต่อการอ้างอิงและการปฏิบัติงานของเจ้าหน้าที่ภายในหน่วยงาน โดยมีสาระสำคัญที่ต้องถือปฏิบัติและขับเคลื่อนให้เกิดผลสัมฤทธิ์อย่างเป็นรูปธรรม

๓. ข้อพิจารณาและข้อเสนอแนะ
เพื่อให้การประสานงานและการปฏิบัติราชการเป็นไปด้วยความเรียบร้อย ถูกต้องตามระเบียบงานสารบรรณ จึงเห็นควรดำเนินการดังนี้:
   ๓.๑ มอบหมายเจ้าหน้าที่ผู้รับผิดชอบนำข้อมูลตามเอกสารไปใช้ในการดำเนินงาน
   ๓.๒ ให้เผยแพร่และเชื่อมโยงเอกสารในระบบจำลองร่างดิจิทัลเพื่อการใช้งานร่วมกัน
   ๓.๓ บันทึกประวัติการแก้ไขและส่งออกเป็นเอกสารมาตรฐาน`;

  return {
    id: `draft-${Date.now()}`,
    title: `ดึงจากคลัง: ${cleanDocName.slice(0, 32)}...`,
    docType: 'official_memo',
    docTypeTitle: 'บันทึกข้อความ',
    docNumber: docNum,
    department: dept,
    departmentSub: deptSub,
    phone: '๐ ๒๑๒๓ ๔๕๖๗ ต่อ ๘๙๐',
    email: 'saraban.center@corporate-hub.go.th',
    date: nowStr,
    subject: subject,
    to: recipient,
    reference: `เอกสารในคลังรหัส [${doc.id}]: ${cleanDocName}`,
    attachments: `๑. สำเนา ${cleanDocName} (${doc.fileType}) จำนวน ๑ ชุด\n๒. ลิงก์เอกสารต้นฉบับในคลังข้อมูล`,
    hasReference: true,
    hasAttachments: true,
    content: content,
    closingPhrase: 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ / เห็นชอบ',
    signName: '( นายสมศักดิ์ นำพาความก้าวหน้า )',
    signPosition: 'หัวหน้ากลุ่มงานพัฒนานวัตกรรมและระบบข้อมูล',
    signActing: '',
    hasActingPosition: false,
    hasRoutingSlip: true,
    routingComment: 'อนุมัติตามเสนอ มอบหมายเจ้าหน้าที่ดำเนินการต่อไป',
    routingSignName: '( นายวิเชียร บริหารการดี )',
    routingDate: nowStr,
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
    watermarkText: 'ดึงจากคลังเอกสาร',
    fontSize: 'base',
    lineSpacing: 'relaxed',
    textAlign: 'justify',
    useThaiNumerals: true,
    sourceDocId: doc.id,
    sourceDocName: doc.name,
    sourceDocUrl: doc.url,
    sourceFileType: doc.fileType,
  };
}

// Generate Microsoft Word (.doc) Content with standard Thai fonts, digital signature embedding, and full formatting
export function exportToMicrosoftWordDoc(draft: DraftDocument, selectedFont: 'thsarabun' | 'angsana' | 'cordia' | 'browallia' | 'tahoma' | 'sarabun' | 'prompt' = 'thsarabun'): void {
  const paperDim = getPaperDimensions(draft.paperSize || 'a4', draft.paperOrientation || 'portrait', draft.customWidthMm, draft.customHeightMm);
  const paperMargin = getPaperMargins(draft.paperMargin || 'standard_thai', draft.customMarginTopCm, draft.customMarginBottomCm, draft.customMarginLeftCm, draft.customMarginRightCm);

  // Font family configuration for Microsoft Word compatibility
  let primaryFontName = 'TH Sarabun New';
  let fontCssRule = "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Angsana New', 'Cordia New', Tahoma, sans-serif";
  let msoAsciiFont = 'TH Sarabun New';
  let msoHansiFont = 'TH Sarabun New';
  let msoBidiFont = 'TH Sarabun New';

  switch (selectedFont) {
    case 'angsana':
      primaryFontName = 'Angsana New';
      fontCssRule = "'Angsana New', 'AngsanaUPC', 'Cordia New', 'TH Sarabun New', Tahoma, sans-serif";
      msoAsciiFont = 'Angsana New';
      msoHansiFont = 'Angsana New';
      msoBidiFont = 'Angsana New';
      break;
    case 'cordia':
      primaryFontName = 'Cordia New';
      fontCssRule = "'Cordia New', 'CordiaUPC', 'Angsana New', 'TH Sarabun New', Tahoma, sans-serif";
      msoAsciiFont = 'Cordia New';
      msoHansiFont = 'Cordia New';
      msoBidiFont = 'Cordia New';
      break;
    case 'browallia':
      primaryFontName = 'Browallia New';
      fontCssRule = "'Browallia New', 'BrowalliaUPC', 'TH Sarabun New', sans-serif";
      msoAsciiFont = 'Browallia New';
      msoHansiFont = 'Browallia New';
      msoBidiFont = 'Browallia New';
      break;
    case 'tahoma':
      primaryFontName = 'Tahoma';
      fontCssRule = "Tahoma, Arial, 'TH Sarabun New', sans-serif";
      msoAsciiFont = 'Tahoma';
      msoHansiFont = 'Tahoma';
      msoBidiFont = 'Tahoma';
      break;
    case 'sarabun':
      primaryFontName = 'Sarabun';
      fontCssRule = "Sarabun, 'TH Sarabun New', sans-serif";
      msoAsciiFont = 'Sarabun';
      msoHansiFont = 'Sarabun';
      msoBidiFont = 'Sarabun';
      break;
    case 'prompt':
      primaryFontName = 'Prompt';
      fontCssRule = "Prompt, 'TH Sarabun New', sans-serif";
      msoAsciiFont = 'Prompt';
      msoHansiFont = 'Prompt';
      msoBidiFont = 'Prompt';
      break;
    case 'thsarabun':
    default:
      primaryFontName = 'TH Sarabun New';
      fontCssRule = "'TH Sarabun New', 'TH Sarabun PSK', Sarabun, 'Angsana New', 'Cordia New', Tahoma, sans-serif";
      msoAsciiFont = 'TH Sarabun New';
      msoHansiFont = 'TH Sarabun New';
      msoBidiFont = 'TH Sarabun New';
      break;
  }

  // Convert newlines in content to HTML paragraphs with standard Thai indent (2.5cm)
  const paragraphs = draft.content
    .split('\n\n')
    .map((p) => `<p class="MsoNormal thai-body-paragraph" style="text-indent: 2.5cm; margin-bottom: 6pt; line-height: 1.35; text-align: justify; text-justify: inter-cluster; font-size: 16pt;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  // Attached images inside body
  const imagesHtml = (draft.attachedImages || [])
    .map(
      (img) => `
      <div style="text-align: ${img.position || 'center'}; margin: 15pt 0;">
        <img src="${img.url}" alt="${img.name || 'เอกสารแนบ'}" style="max-width: ${img.width || 80}%; border: 1px solid #ccc; padding: 4px;" />
        ${img.caption ? `<div style="font-size: 14pt; color: #555; margin-top: 4pt;">${img.caption}</div>` : ''}
      </div>
    `
    )
    .join('');

  // Digital Signatures HTML generation
  const signatures = draft.digitalSignatures || [];
  let signatureSectionHtml = '';

  if (signatures.length === 0) {
    // Standard default unsigned block
    signatureSectionHtml = `
      <div class="signature-block">
        <br/><br/>
        <div>(ลงชื่อ)....................................................</div>
        <div style="font-weight: bold; margin-top: 4pt;">${draft.signName}</div>
        <div style="margin-top: 2pt;">${draft.signPosition}</div>
        ${draft.hasActingPosition && draft.signActing ? `<div style="font-size: 14pt; color: #444;">${draft.signActing}</div>` : ''}
      </div>
    `;
  } else if (signatures.length === 1) {
    // Single digital signature
    const sig = signatures[0];
    signatureSectionHtml = `
      <div class="signature-block" style="margin-top: 20pt; margin-left: 45%; width: 55%; text-align: center;">
        ${sig.signatureDataUrl ? `
          <div style="text-align: center; margin-bottom: -5pt;">
            <img src="${sig.signatureDataUrl}" alt="ลายเซ็นดิจิทัล" style="max-height: 60pt; max-width: 180pt; object-fit: contain;" />
          </div>
        ` : '<br/><br/>'}
        <div>(ลงชื่อ)....................................................</div>
        <div style="font-weight: bold; margin-top: 4pt; font-size: 16pt;">${sig.signerName || draft.signName}</div>
        <div style="margin-top: 2pt; font-size: 16pt;">${sig.signerPosition || draft.signPosition}</div>
        ${draft.hasActingPosition && draft.signActing ? `<div style="font-size: 14pt; color: #444;">${draft.signActing}</div>` : ''}
        ${sig.showStampBadge ? `
          <div style="margin-top: 8pt; border: 1px solid #16a34a; background-color: #f0fdf4; border-radius: 4pt; padding: 6pt 10pt; font-size: 11pt; color: #15803d; text-align: center;">
            <strong>✓ ลงนามดิจิทัลได้รับการรับรอง (Digital Signature Certified)</strong><br/>
            <span>รหัสใบรับรอง: ${sig.certificateId} • วันที่: ${sig.signedAtThai}</span>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    // Multiple digital signatures (e.g. Contract Parties & Witnesses)
    const primarySigs = signatures.filter((s) => s.role === 'primary' || s.role === 'contractor');
    const witnessSigs = signatures.filter((s) => s.role === 'witness1' || s.role === 'witness2' || s.role === 'approver');

    signatureSectionHtml = `
      <div style="margin-top: 25pt;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 15pt;">
          <tr>
            ${primarySigs.map((sig) => `
              <td style="width: 50%; vertical-align: top; text-align: center; padding: 10pt;">
                ${sig.signatureDataUrl ? `
                  <div style="text-align: center; margin-bottom: -5pt;">
                    <img src="${sig.signatureDataUrl}" alt="ลายเซ็น" style="max-height: 55pt; max-width: 160pt; object-fit: contain;" />
                  </div>
                ` : '<br/><br/>'}
                <div>(ลงชื่อ)....................................................</div>
                <div style="font-weight: bold; margin-top: 4pt; font-size: 15pt;">${sig.signerName}</div>
                <div style="font-size: 14pt; color: #333;">${sig.signerPosition}</div>
                <div style="font-size: 12pt; color: #666; margin-top: 2pt;">[ ${sig.roleLabel.split('(')[0]} ]</div>
                ${sig.showStampBadge ? `
                  <div style="margin-top: 6pt; font-size: 10pt; color: #15803d; border-top: 1px dashed #22c55e; padding-top: 3pt;">
                    ✓ E-Signed: ${sig.certificateId}
                  </div>
                ` : ''}
              </td>
            `).join('')}
          </tr>
          ${witnessSigs.length > 0 ? `
          <tr>
            ${witnessSigs.map((sig) => `
              <td style="width: 50%; vertical-align: top; text-align: center; padding: 15pt 10pt 5pt 10pt;">
                ${sig.signatureDataUrl ? `
                  <div style="text-align: center; margin-bottom: -5pt;">
                    <img src="${sig.signatureDataUrl}" alt="ลายเซ็นพยาน" style="max-height: 45pt; max-width: 140pt; object-fit: contain;" />
                  </div>
                ` : '<br/>'}
                <div>(ลงชื่อ)....................................................</div>
                <div style="font-weight: bold; margin-top: 4pt; font-size: 14pt;">${sig.signerName}</div>
                <div style="font-size: 13pt; color: #333;">${sig.signerPosition}</div>
                <div style="font-size: 11pt; color: #666;">[ ${sig.roleLabel.split('(')[0]} ]</div>
              </td>
            `).join('')}
          </tr>
          ` : ''}
        </table>

        <!-- Digital Audit Trail Certificate Badge -->
        <table style="width: 100%; margin-top: 18pt; border: 1px solid #16a34a; background-color: #f0fdf4; border-radius: 6pt; padding: 8pt; font-family: ${fontCssRule};">
          <tr>
            <td style="width: 30pt; text-align: center; vertical-align: middle; font-size: 20pt; color: #16a34a;">
              🔒
            </td>
            <td style="font-size: 11pt; color: #15803d; line-height: 1.3;">
              <strong>เอกสารนี้ผ่านการลงนามอิเล็กทรอนิกส์ (Digital Signature Verified)</strong><br/>
              <span>จำนวนผู้ลงนาม: ${signatures.length} ท่าน • มีผลบังคับใช้ตาม พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. ๒๕๔๔</span><br/>
              <span style="font-size: 9.5pt; color: #166534;">รหัสอ้างอิง: ${signatures[0].certificateId} | บันทึกความสมบูรณ์ Checksum: ${signatures[0].checksumHash}</span>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  // Routing slip section for Word
  const routingHtml = draft.hasRoutingSlip
    ? `
    <table style="width: 100%; border-top: 2px solid #000000; margin-top: 30pt; padding-top: 10pt; font-family: ${fontCssRule};">
      <tr>
        <td style="width: 50%; vertical-align: top; border-right: 1px dashed #999999; padding-right: 15pt; font-size: 14pt;">
          <strong>คำสั่ง / การเกษียณหนังสือ:</strong><br/>
          ${draft.routingComment || 'อนุมัติตามเสนอ ดำเนินการต่อไป'}<br/><br/>
          <div style="text-align: center; margin-top: 15pt;">
            (ลงชื่อ)....................................................<br/>
            ${draft.routingSignName || '( ผู้มีอำนาจลงนาม )'}<br/>
            วันที่ ${draft.routingDate || draft.date}
          </div>
        </td>
        <td style="width: 50%; vertical-align: top; padding-left: 15pt; font-size: 14pt;">
          <strong>บันทึกความเห็นเพิ่มเติม:</strong><br/>
          ...........................................................................<br/>
          ...........................................................................<br/>
        </td>
      </tr>
    </table>
  `
    : '';

  // Determine Logo Image / Emblem URL
  let logoImgSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png';
  if (draft.logoType === 'custom_image' && draft.logoCustomUrl) {
    logoImgSrc = draft.logoCustomUrl;
  } else if (draft.logoType === 'ministry') {
    logoImgSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png';
  } else if (draft.logoType === 'circle_seal') {
    logoImgSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png';
  }

  const logoSizePx = draft.logoCustomSizePx || (draft.garudaSize === 'sm' ? 55 : draft.garudaSize === 'lg' ? 95 : draft.garudaSize === 'xl' ? 120 : 75);

  const logoHtml = (draft.showGaruda && draft.logoType !== 'none')
    ? `<div style="text-align: ${draft.garudaPosition === 'center' ? 'center' : draft.garudaPosition === 'right' ? 'right' : 'left'}; margin-bottom: 10pt;">
         <img width="${logoSizePx}" height="${logoSizePx}" src="${logoImgSrc}" alt="ตราสัญลักษณ์" style="object-fit: contain;" />
       </div>`
    : '';

  const wordHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <title>${draft.subject || 'เอกสารราชการ'}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
        <w:Compatibility>
          <w:UseWord2002TableStyleRules/>
          <w:GrowAutofit/>
        </w:Compatibility>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @font-face {
        font-family: "${primaryFontName}";
        panose-1: 2 11 6 4 2 2 2 2 2 4;
        mso-font-charset: 222;
        mso-generic-font-family: swiss;
        mso-font-pitch: variable;
        mso-font-signature: 16777219 0 0 0 65536 0;
      }
      @page Section1 {
        size: ${paperDim.widthMm}mm ${paperDim.heightMm}mm;
        margin: ${paperMargin.topCm * 10}mm ${paperMargin.rightCm * 10}mm ${paperMargin.bottomCm * 10}mm ${paperMargin.leftCm * 10}mm;
        mso-header-margin: 35.4pt;
        mso-footer-margin: 35.4pt;
        mso-paper-source: 0;
      }
      div.Section1 {
        page: Section1;
        font-family: ${fontCssRule};
      }
      body {
        font-family: ${fontCssRule};
        font-size: 16pt;
        line-height: 1.25;
        color: #000000;
        mso-ascii-font-family: "${msoAsciiFont}";
        mso-hansi-font-family: "${msoHansiFont}";
        mso-bidi-font-family: "${msoBidiFont}";
      }
      p, div, td, span {
        font-family: ${fontCssRule};
        font-size: 16pt;
        margin: 0;
        padding: 0;
        mso-ascii-font-family: "${msoAsciiFont}";
        mso-hansi-font-family: "${msoHansiFont}";
        mso-bidi-font-family: "${msoBidiFont}";
      }
      .doc-main-title {
        font-size: 29pt;
        font-weight: bold;
        text-align: center;
        margin-bottom: 12pt;
        letter-spacing: -0.5pt;
      }
      .field-label {
        font-weight: bold;
      }
      .meta-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12pt;
      }
      .meta-table td {
        padding: 2pt 0;
        vertical-align: top;
      }
      .signature-block {
        margin-top: 30pt;
        margin-left: 50%;
        text-align: center;
        width: 50%;
      }
    </style>
  </head>
  <body lang="TH" style="tab-interval: 36.0pt;">
    <div class="Section1">
      ${logoHtml}

      <div class="doc-main-title">${draft.docTypeTitle || 'บันทึกข้อความ'}</div>

      <table class="meta-table" style="width: 100%;">
        <tr>
          <td colspan="2" style="font-size: 16pt; padding-bottom: 4pt;">
            <span class="field-label">ส่วนราชการ:</span> ${draft.department} ${draft.departmentSub ? `(${draft.departmentSub})` : ''} ${draft.phone ? `โทร. ${draft.phone}` : ''}
          </td>
        </tr>
        <tr>
          <td style="width: 50%; font-size: 16pt; padding-bottom: 4pt;">
            <span class="field-label">ที่:</span> ${draft.docNumber}
          </td>
          <td style="width: 50%; font-size: 16pt; padding-bottom: 4pt; text-align: right;">
            <span class="field-label">วันที่:</span> ${draft.date}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="font-size: 16pt; padding-bottom: 4pt;">
            <span class="field-label">เรื่อง:</span> <strong>${draft.subject}</strong>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="font-size: 16pt; padding-bottom: 4pt;">
            <span class="field-label">เรียน:</span> ${draft.to}
          </td>
        </tr>
        ${draft.hasReference && draft.reference ? `
        <tr>
          <td colspan="2" style="font-size: 16pt; padding-bottom: 4pt;">
            <span class="field-label">อ้างถึง:</span> ${draft.reference}
          </td>
        </tr>
        ` : ''}
        ${draft.hasAttachments && draft.attachments ? `
        <tr>
          <td colspan="2" style="font-size: 16pt; padding-bottom: 4pt;">
            <span class="field-label">สิ่งที่ส่งมาด้วย:</span> ${draft.attachments.replace(/\n/g, '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}
          </td>
        </tr>
        ` : ''}
      </table>

      <!-- Document Body Content -->
      <div style="margin-top: 15pt; font-size: 16pt;">
        ${paragraphs}
      </div>

      <!-- Attached Images -->
      ${imagesHtml}

      <!-- Closing Phrase -->
      <p class="MsoNormal" style="text-indent: 2.5cm; margin-top: 12pt; margin-bottom: 18pt; font-size: 16pt;">
        ${draft.closingPhrase || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ'}
      </p>

      <!-- Signature Section -->
      ${signatureSectionHtml}

      <!-- Optional Routing Slip -->
      ${routingHtml}
    </div>
  </body>
  </html>
  `;

  // Create Blob as application/msword with UTF-8 BOM (\ufeff)
  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const fileName = `${(draft.subject || 'บันทึกข้อความ').replace(/[/\\?%*:|"<>]/g, '_')}.doc`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
