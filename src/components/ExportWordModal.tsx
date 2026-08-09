import React, { useState } from 'react';
import {
  X,
  FileDown,
  Type,
  Check,
  ShieldCheck,
  PenTool,
  AlertCircle,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  Settings,
  Layers,
  Ruler
} from 'lucide-react';
import { DraftDocument, ThaiExportFont } from '../types';
import { exportToMicrosoftWordDoc, getPaperDimensions } from '../utils/draftHelpers';

interface ExportWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: DraftDocument;
  onUpdateDraft: (updater: (prev: DraftDocument) => DraftDocument) => void;
  onOpenSignatureModal: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExportWordModal: React.FC<ExportWordModalProps> = ({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
  onOpenSignatureModal,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [selectedFont, setSelectedFont] = useState<ThaiExportFont>(
    draft.exportFont || 'thsarabun'
  );

  const fontOptions: {
    id: ThaiExportFont;
    name: string;
    subname: string;
    description: string;
    badge: string;
    sample: string;
    fontFamilyCss: string;
  }[] = [
    {
      id: 'thsarabun',
      name: 'TH Sarabun New / PSK',
      subname: 'ฟอนต์สารบรรณราชการไทย ๑๓ ฟอนต์มาตรฐาน',
      description: 'มาตรฐานหนังสือราชการ บันทึกข้อความ ประกาศ คำสั่ง ตามระเบียบสำนักนายกรัฐมนตรี',
      badge: 'แนะนำสำหรับราชการ',
      sample: 'บันทึกข้อความ ส่วนราชการ ที่ กห ๐๒๐๑/ว',
      fontFamilyCss: "'TH Sarabun New', 'TH Sarabun PSK', Sarabun, sans-serif",
    },
    {
      id: 'angsana',
      name: 'Angsana New / UPC',
      subname: 'ฟอนต์สัญญาและข้อตกลงมาตรฐาน',
      description: 'นิยมใช้ในสัญญาทางธุรกิจ นิติกรรม และเอกสารกฎหมายไทยทั่วไป',
      badge: 'มาตรฐานสัญญา',
      sample: 'สัญญาจ้างและข้อตกลงการปฏิบัติงาน ฉบับที่ ๑',
      fontFamilyCss: "'Angsana New', 'AngsanaUPC', 'Cordia New', sans-serif",
    },
    {
      id: 'cordia',
      name: 'Cordia New / UPC',
      subname: 'ฟอนต์องค์กรธุรกิจและหนังสือภายนอก',
      description: 'อ่านง่าย ลายเส้นชัดเจน เหมาะสำหรับจดหมายธุรกิจและรายงานองค์กร',
      badge: 'ธุรกิจ & เอกชน',
      sample: 'หนังสือเรียนเชิญและรายงานผลการประชุมประจำปี',
      fontFamilyCss: "'Cordia New', 'CordiaUPC', 'Angsana New', sans-serif",
    },
    {
      id: 'tahoma',
      name: 'Tahoma (Universal Safe Font)',
      subname: 'เปิดได้ 100% บนคอมพิวเตอร์และ Word ทุกเครื่อง',
      description: 'ฟอนต์มาตรฐานที่ติดตั้งมาพร้อมกับ Windows และ Office ทุกเวอร์ชัน ตัวหนังสือไม่ลอย/ไม่พังแน่นอน',
      badge: 'เปิดได้ทุกเครื่อง 100%',
      sample: 'เอกสารดิจิทัลและแบบฟอร์มอิเล็กทรอนิกส์ 2568',
      fontFamilyCss: 'Tahoma, Arial, sans-serif',
    },
    {
      id: 'browallia',
      name: 'Browallia New / UPC',
      subname: 'ฟอนต์สารบรรณแบบดั้งเดิม',
      description: 'ตัวอักษรเรียวบาง เหมาะสำหรับงานพิมพ์ที่ต้องการความกระชับของพื้นที่',
      badge: 'สารบรรณคลาสสิก',
      sample: 'คำสั่งและประกาศระเบียบปฏิบัติราชการ',
      fontFamilyCss: "'Browallia New', 'BrowalliaUPC', sans-serif",
    },
    {
      id: 'sarabun',
      name: 'Sarabun (Google Fonts Universal)',
      subname: 'ฟอนต์มาตรฐานสากลบนเว็บและดิจิทัล',
      description: 'รองรับการแสดงผลทั้งบนเว็บและ Microsoft Word ยุคใหม่',
      badge: 'ดิจิทัลสากล',
      sample: 'ระบบจัดการเอกสารอิเล็กทรอนิกส์ภาครัฐ',
      fontFamilyCss: 'Sarabun, sans-serif',
    },
  ];

  const signatures = draft.digitalSignatures || [];
  const hasSignature = signatures.length > 0;

  const handleExport = () => {
    try {
      // Save chosen font to draft state
      onUpdateDraft((prev) => ({ ...prev, exportFont: selectedFont }));
      exportToMicrosoftWordDoc(draft, selectedFont);
      onShowToast(`ส่งออกไฟล์ Word (.doc) สำเร็จ (ใช้ฟอนต์ ${fontOptions.find((f) => f.id === selectedFont)?.name})`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      onShowToast('เกิดข้อผิดพลาดในการส่งออกไฟล์ Word', 'error');
    }
  };

  const currentDim = getPaperDimensions(draft.paperSize || 'a4', draft.paperOrientation || 'portrait');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>ส่งออก Microsoft Word (.doc / .docx)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                  ฟอนต์มาตรฐานไทย
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รองรับการเปิดบนคอมพิวเตอร์ทั่วไป ตัวหนังสือไม่พัง พร้อมลายเซ็นและตราประทับ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Digital Signature Status Box */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              hasSignature
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  hasSignature
                    ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-600 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/70 text-amber-600 dark:text-amber-300'
                }`}
              >
                {hasSignature ? <ShieldCheck className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${
                    hasSignature ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {hasSignature
                    ? `มีลายเซ็นดิจิทัลแล้ว (${signatures.length} รายการ)`
                    : 'ยังไม่มีลายเซ็นดิจิทัลในเอกสาร'}
                </p>
                <p
                  className={`text-[11px] ${
                    hasSignature ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {hasSignature
                    ? `ผู้ลงนาม: ${signatures.map((s) => s.signerName).join(', ')} พร้อมตราประทับรับรอง`
                    : 'คุณสามารถกดเซ็นสัญญา/ลงนามดิจิทัลก่อนส่งออก เพื่อแนบลายเซ็นลงในไฟล์ Word ได้'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => onOpenSignatureModal(), 150);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                hasSignature
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{hasSignature ? 'จัดการ/เพิ่มลายเซ็น' : '✍️ เซ็นสัญญาดิจิทัลตอนนี้'}</span>
            </button>
          </div>

          {/* Thai Standard Font Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Type className="w-4 h-4 text-indigo-500" />
                เลือกฟอนต์มาตรฐานไทยสำหรับไฟล์ Word (Thai Font Standard):
              </label>
              <span className="text-[11px] text-slate-400">ฝังโค้ดฟอนต์สำหรับ Microsoft Word</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fontOptions.map((font) => (
                <div
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedFont === font.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      {font.name}
                    </span>
                    {selectedFont === font.id ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {font.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                    {font.description}
                  </p>

                  {/* Font Sample Preview */}
                  <div
                    style={{ fontFamily: font.fontFamilyCss }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 truncate"
                  >
                    {font.sample}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Summary Pre-export Checklist */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              สรุปข้อมูลเอกสารที่จะส่งออก:
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
              <div>
                • เรื่อง: <strong className="text-slate-800 dark:text-slate-200">{draft.subject}</strong>
              </div>
              <div>
                • ขนาดกระดาษ: <strong className="text-slate-800 dark:text-slate-200">{currentDim.label}</strong>
              </div>
              <div>
                • ตราสัญลักษณ์: <strong className="text-slate-800 dark:text-slate-200">{draft.showGaruda ? 'มีตราครุฑ/โลโก้' : 'ไม่มี'}</strong>
              </div>
              <div>
                • ลายเซ็นดิจิทัล: <strong className="text-slate-800 dark:text-slate-200">{hasSignature ? `แนบ ${signatures.length} ลายเซ็น` : 'ไม่มีลายเซ็น'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>ดาวน์โหลดไฟล์ Word (.doc) ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
