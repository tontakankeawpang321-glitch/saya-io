import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileCode2, 
  FileText, 
  File, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  ArrowRight,
  FileCheck,
  RotateCw
} from 'lucide-react';
import { parseUploadedFile } from '../utils/draftHelpers';
import { DraftDocument } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (draft: DraftDocument) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyDraft,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setUploadedFileName(file.name);
    try {
      const result = await parseUploadedFile(file);
      setParsedResult(result);
      onShowToast(`อ่านข้อมูลไฟล์ "${file.name}" สำเร็จ!`, 'success');
    } catch (err: any) {
      console.error('File parsing error:', err);
      onShowToast(`ไม่สามารถอ่านไฟล์ได้: ${err?.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyToEditor = () => {
    if (!parsedResult) return;

    const newDraft: DraftDocument = {
      id: `uploaded-draft-${Date.now()}`,
      title: parsedResult.title || `นำเข้าจาก ${uploadedFileName}`,
      docType: 'official_memo',
      docTypeTitle: 'บันทึกข้อความ',
      docNumber: parsedResult.docNumber || 'กห ๐๒๐๑/ว ๑๐๑',
      department: parsedResult.department || 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล',
      departmentSub: parsedResult.departmentSub || '',
      phone: '๐ ๒๑๒๓ ๔๕๖๗',
      email: 'saraban@digital-hub.go.th',
      date: parsedResult.date || new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date()),
      subject: parsedResult.subject || uploadedFileName.replace(/\.[^/.]+$/, ''),
      to: parsedResult.to || 'ผู้อำนวยการสำนักบริหารงานกลาง',
      reference: parsedResult.reference || '',
      attachments: parsedResult.attachments || '',
      hasReference: Boolean(parsedResult.reference),
      hasAttachments: Boolean(parsedResult.attachments),
      content: parsedResult.content || '',
      closingPhrase: parsedResult.closingPhrase || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ',
      signName: parsedResult.signName || '( นายสมศักดิ์ นำพาความก้าวหน้า )',
      signPosition: parsedResult.signPosition || 'หัวหน้ากลุ่มงานพัฒนานวัตกรรมดิจิทัล',
      signActing: '',
      hasActingPosition: false,
      hasRoutingSlip: true,
      routingComment: 'อนุมัติตามเสนอ มอบหมายเจ้าหน้าที่ดำเนินการต่อไป',
      routingSignName: '( นายวิเชียร บริหารการดี )',
      routingDate: parsedResult.date || new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date()),
      showGaruda: true,
      logoType: parsedResult.isImage && parsedResult.imageDataUrl ? 'custom_image' : 'garuda',
      logoCustomUrl: parsedResult.isImage ? parsedResult.imageDataUrl : undefined,
      logoCustomName: parsedResult.isImage ? uploadedFileName : undefined,
      garudaSize: 'md',
      garudaPosition: 'left',
      attachedImages: [],
      paperSize: 'a4',
      paperOrientation: 'portrait',
      paperMargin: 'standard_thai',
      showPageRuler: false,
      showPageBorders: true,
      showWatermark: false,
      watermarkText: 'นำเข้าจากไฟล์',
      fontSize: 'base',
      lineSpacing: 'relaxed',
      textAlign: 'justify',
      useThaiNumerals: true,
      sourceDocName: uploadedFileName,
      sourceFileType: parsedResult.fileType,
    };

    onApplyDraft(newDraft);
    onShowToast(`โหลดเอกสารจากไฟล์ "${uploadedFileName}" เข้าสู่โปรแกรมแก้ไขเรียบร้อยแล้ว!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                นำเข้าไฟล์เอกสารจากเครื่อง (Word, PDF, Text, Image)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ดึงเนื้อหาจากไฟล์ของคุณเข้ามาแก้ไข จัดหน้า และส่งออกในรูปแบบมาตรฐาน
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.pdf,.txt,.md,.csv,.json,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          {/* Upload Drop Zone */}
          {!parsedResult && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-4 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <RotateCw className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="font-semibold text-slate-900 dark:text-white">
                    กำลังอ่านและแยกแยะโครงสร้างเอกสาร...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <FileCode2 className="w-7 h-7" />
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Upload className="w-7 h-7" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    รองรับไฟล์ <strong>Word (.docx)</strong>, <strong>PDF (.pdf)</strong>, <strong>ข้อความ (.txt / .md)</strong> และ <strong>รูปภาพ (.png / .jpg)</strong>
                  </p>
                </>
              )}
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                      {uploadedFileName}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      ประเภท: {parsedResult.fileType} • แยกแยะฟิลด์สำเร็จ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedResult(null);
                    setUploadedFileName('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline"
                >
                  เลือกไฟล์อื่น
                </button>
              </div>

              {/* Parsed Fields Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2.5 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">เรื่อง / Subject:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{parsedResult.subject}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เลขที่หนังสือ:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{parsedResult.docNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ส่วนราชการ / หน่วยงาน:</span>
                    <span className="text-slate-800 dark:text-slate-200">{parsedResult.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">เรียน / ผู้รับ:</span>
                    <span className="text-slate-800 dark:text-slate-200">{parsedResult.to}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">ตัวอย่างเนื้อหาเอกสาร (Content Preview):</span>
                  <div className="max-h-36 overflow-y-auto bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {parsedResult.content || 'ไม่มีข้อความ'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Format Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="block font-semibold text-blue-600 dark:text-blue-400">Word (.docx)</span>
              <span className="text-[10px] text-slate-400">แยกหัวข้อ & ย่อหน้า</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="block font-semibold text-rose-600 dark:text-rose-400">PDF (.pdf)</span>
              <span className="text-[10px] text-slate-400">ดึงข้อความ & โครง</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="block font-semibold text-emerald-600 dark:text-emerald-400">ข้อความ (.txt)</span>
              <span className="text-[10px] text-slate-400">จัดรูปแบบราชการ</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="block font-semibold text-purple-600 dark:text-purple-400">รูปภาพ / โลโก้</span>
              <span className="text-[10px] text-slate-400">ตราสัญลักษณ์ทันที</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ยกเลิก
          </button>

          {parsedResult && (
            <button
              type="button"
              onClick={handleApplyToEditor}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-colors"
            >
              <span>ดึงมาแก้ไขในเอกสารจำลองทันที</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
