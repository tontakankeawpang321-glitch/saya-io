import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTItiReSbPwa0Fz_Afzmi8BrcUdpzdOINQiV7xFkiKWvl_x1KzmEKItpJjQNjtz1SgheZYdL3s4cSiy/pub?output=csv';

interface DocItem {
  id: string;
  name: string;
  url: string;
  category: string;
  fileType: string;
  iconClass: string;
  typeClass: string;
}

let cachedDocs: DocItem[] = [];
let lastFetchedTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Reliable CSV parser supporting quoted newlines and escaped commas
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function detectFileType(url: string, name: string) {
  const combined = (url + ' ' + name).toLowerCase();
  if (combined.includes('sheet') || combined.includes('excel') || combined.includes('.csv') || combined.includes('.xlsx') || combined.includes('spreadsheets')) {
    return { type: 'Spreadsheet', icon: 'FileSpreadsheet', bgClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  } else if (combined.includes('pdf') || url.includes('.pdf')) {
    return { type: 'PDF Document', icon: 'FileText', bgClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  } else if (combined.includes('doc') || combined.includes('word') || combined.includes('.docx') || combined.includes('document')) {
    return { type: 'Word Document', icon: 'FileCode2', bgClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  } else if (combined.includes('slide') || combined.includes('presentation') || combined.includes('.pptx')) {
    return { type: 'Presentation', icon: 'Presentation', bgClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  } else if (combined.includes('forms') || combined.includes('แบบฟอร์ม')) {
    return { type: 'Online Form', icon: 'CheckSquare', bgClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
  }
  return { type: 'Link / Archive', icon: 'File', bgClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
}

// Fallback high quality seed in case Google Sheet is unreachable
const fallbackData: DocItem[] = [
  {
    id: 'doc-001',
    name: 'คู่มือระเบียบสารบรรณและมาตรฐานงานธุรการองค์กร ประจำปี 2568',
    url: 'https://docs.google.com/document/d/1exampleDoc01/edit',
    category: 'ระเบียบและข้อบังคับ',
    fileType: 'Word Document',
    iconClass: 'FileCode2',
    typeClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'doc-002',
    name: 'แบบฟอร์มขออนุมัติจัดซื้อจัดจ้างและใบขอเสนอราคา (PR / PO Template)',
    url: 'https://docs.google.com/spreadsheets/d/1exampleSheet02/edit',
    category: 'พัสดุและการเงิน',
    fileType: 'Spreadsheet',
    iconClass: 'FileSpreadsheet',
    typeClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'doc-003',
    name: 'ประกาศคำสั่งเรื่องแนวทางการปฏิบัติงานและรักษาความปลอดภัยสารสนเทศ',
    url: 'https://example.com/files/it_security_policy_2025.pdf',
    category: 'ประกาศและคำสั่ง',
    fileType: 'PDF Document',
    iconClass: 'FileText',
    typeClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  },
  {
    id: 'doc-004',
    name: 'แบบร่างบันทึกข้อความราชการมาตรฐาน (แบบครุฑและบันทึกภายใน)',
    url: 'https://docs.google.com/document/d/1exampleMemo04/edit',
    category: 'แบบฟอร์มเอกสาร',
    fileType: 'Word Document',
    iconClass: 'FileCode2',
    typeClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'doc-005',
    name: 'สไลด์นำเสนอแผนยุทธศาสตร์องค์กรและการพัฒนานวัตกรรมดิจิทัล 2026-2028',
    url: 'https://docs.google.com/presentation/d/1exampleSlide05/edit',
    category: 'แผนงานและโครงการ',
    fileType: 'Presentation',
    iconClass: 'Presentation',
    typeClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 'doc-006',
    name: 'รายงานผลการประเมินความพึงพอใจและสถิติการใช้งานระบบบริการข้อมูล',
    url: 'https://docs.google.com/spreadsheets/d/1exampleSheet06/edit',
    category: 'รายงานและสถิติ',
    fileType: 'Spreadsheet',
    iconClass: 'FileSpreadsheet',
    typeClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }
];

async function fetchGoogleSheetData(): Promise<DocItem[]> {
  const now = Date.now();
  if (cachedDocs.length > 0 && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedDocs;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(CSV_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Google Sheets responded with status ${res.status}`);
    }

    const text = await res.text();
    const rows = parseCSV(text);

    if (rows.length <= 1) {
      if (cachedDocs.length > 0) return cachedDocs;
      return fallbackData;
    }

    const header = rows[0].map((h) => h.toLowerCase());
    let nameIdx = header.findIndex((h) => h.includes('name') || h.includes('ชื่อ') || h.includes('title') || h.includes('เรื่อง') || h.includes('รายการ'));
    let urlIdx = header.findIndex((h) => h.includes('url') || h.includes('link') || h.includes('ลิงก์') || h.includes('href') || h.includes('ที่อยู่'));
    let catIdx = header.findIndex((h) => h.includes('category') || h.includes('หมวด') || h.includes('group') || h.includes('ประเภท'));

    if (nameIdx === -1) nameIdx = 0;
    if (urlIdx === -1) urlIdx = header.length > 1 ? 1 : 0;

    const parsed: DocItem[] = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (cols.length < 1 || !cols.some((c) => c.trim().length > 0)) continue;

      const name = cols[nameIdx] || `เอกสารลำดับที่ ${i}`;
      const rawUrl = (urlIdx !== -1 && cols[urlIdx]) ? cols[urlIdx] : '#';
      let cat = (catIdx !== -1 && cols[catIdx]) ? cols[catIdx].trim() : 'ทั่วไป';
      if (!cat) cat = 'ทั่วไป';

      const fileMeta = detectFileType(rawUrl, name);
      const safeId = `doc-${i}-${Buffer.from(name + rawUrl).toString('base64').replace(/[/+=]/g, '').substring(0, 16)}`;

      parsed.push({
        id: safeId,
        name,
        url: rawUrl,
        category: cat,
        fileType: fileMeta.type,
        iconClass: fileMeta.icon,
        typeClass: fileMeta.bgClass,
      });
    }

    if (parsed.length > 0) {
      cachedDocs = parsed;
      lastFetchedTime = now;
      return parsed;
    }
  } catch (error) {
    console.error('Error fetching Google Sheet CSV:', error);
  }

  if (cachedDocs.length > 0) return cachedDocs;
  return fallbackData;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/documents', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    if (force) lastFetchedTime = 0;

    const docs = await fetchGoogleSheetData();
    const categoriesMap: Record<string, number> = {};

    docs.forEach((d) => {
      categoriesMap[d.category] = (categoriesMap[d.category] || 0) + 1;
    });

    res.json({
      success: true,
      count: docs.length,
      documents: docs,
      categories: Object.entries(categoriesMap).map(([name, count]) => ({ name, count })),
      lastUpdated: new Date(lastFetchedTime || Date.now()).toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

// AI Draft Assistant Endpoint
app.post('/api/ai/draft', async (req, res) => {
  try {
    const { templateType, title, recipient, department, notes, keywords } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return structured fallback draft if API key not set
      const thaiDate = new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date());
      return res.json({
        success: true,
        isAiGenerated: false,
        draft: {
          docNumber: 'กห ๐๒๐๑/ว ๑๒๕',
          department: department || 'ฝ่ายบริหารงานทั่วไปและยุทธศาสตร์องค์กร',
          date: thaiDate,
          subject: title || 'ขออนุมัติดำเนินการตามแผนงานและโครงการพัฒนา',
          to: recipient || 'ผู้อำนวยการฝ่าย / ผู้บริหารระดับสูง',
          content: `ด้วย ${department || 'หน่วยงาน'} มีความประสงค์จะดำเนินการ ${title || 'โครงการพัฒนาระบบข้อมูลและการจัดเก็บเอกสาร'}\n\nโดยมีรายละเอียดและวัตถุประสงค์เพื่อยกระดับมาตรฐานการปฏิบัติงานให้เป็นไปอย่างมีประสิทธิภาพ โปร่งใส และเกิดประโยชน์สูงสุดต่อองค์กร\n\nจึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ`,
          signName: '( นายสมศักดิ์ นำพาความก้าวหน้า )',
          signPosition: 'หัวหน้ากลุ่มงานบริหารและวิเทศสัมพันธ์'
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `คุณคือผู้เชี่ยวชาญการร่างหนังสือราชการและเอกสารองค์กรภาษาไทยอย่างเป็นทางการ
กรุณาร่างเอกสารประเภท "${templateType || 'บันทึกข้อความ'}" 
- เรื่อง/หัวข้อ: "${title || 'รายงานและขออนุมัติ'}"
- เรียน: "${recipient || 'ผู้อำนวยการ'}"
- หน่วยงานเจ้าของเรื่อง: "${department || 'สำนักบริหารงานกลาง'}"
- วัตถุประสงค์และใจความสำคัญ: "${notes || 'ขออนุมัติการดำเนินงานตามแผนยุทธศาสตร์'}"
- คีย์เวิร์ดประกอบ: "${keywords || 'มีประสิทธิภาพ, รวดเร็ว, ถูกต้อง'}"

โปรดส่งคืนผลลัพธ์เป็น JSON ล้วน (ไม่มี markdown code block หรือคำนำ) ตามโครงสร้าง:
{
  "docNumber": "เลขที่หนังสือ เช่น ศธ ๐๒๑๐/๒๕๖๘",
  "department": "ชื่อหน่วยงาน",
  "date": "วันที่ภาษาไทย เช่น ๘ สิงหาคม ๒๕๖๘",
  "subject": "เรื่อง",
  "to": "เรียน",
  "content": "เนื้อหาเอกสาร 2-3 ย่อหน้า พร้อมเหตุผลและความจำเป็น และคำลงท้ายทางการ",
  "signName": "( ชื่อ-นามสกุล ผู้ลงนาม )",
  "signPosition": "ตำแหน่งผู้ลงนาม"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.json({
      success: true,
      isAiGenerated: true,
      draft: parsed,
    });
  } catch (err: any) {
    console.error('AI Draft Generation error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'AI generation failed',
    });
  }
});

// Vite middleware for development & Static server for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Corporate Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
