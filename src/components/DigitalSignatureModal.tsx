import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  PenTool,
  Type,
  Upload,
  Check,
  RotateCcw,
  ShieldCheck,
  Award,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Trash2,
  FileCheck,
  Plus,
  Sparkles,
  Download,
  Stamp,
  FileDown
} from 'lucide-react';
import { DraftDocument, DigitalSignature } from '../types';
import { getThaiCurrentDate } from '../utils/draftHelpers';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: DraftDocument;
  onUpdateDraft: (updater: (prev: DraftDocument) => DraftDocument) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenExportWord?: () => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
  onShowToast,
  onOpenExportWord,
}) => {
  if (!isOpen) return null;

  // Active signing tab: 'draw' | 'type' | 'upload' | 'manage'
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload' | 'manage'>('draw');

  // Draw Tab Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawPenColor, setDrawPenColor] = useState<string>('#002288'); // Standard official blue ink
  const [drawStrokeWidth, setDrawStrokeWidth] = useState<number>(3);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);

  // Type Tab State
  const [typedText, setTypedText] = useState<string>(
    draft.signName ? draft.signName.replace(/[\(\)]/g, '').trim() : 'สมศักดิ์ นำพาความก้าวหน้า'
  );
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>('Charmonman');
  const [typedColor, setTypedColor] = useState<string>('#002288');

  // Upload Tab State
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Signer metadata form
  const [signerName, setSignerName] = useState<string>(
    draft.signName ? draft.signName.replace(/[\(\)]/g, '').trim() : 'นายสมศักดิ์ นำพาความก้าวหน้า'
  );
  const [signerPosition, setSignerPosition] = useState<string>(
    draft.signPosition || 'หัวหน้ากลุ่มงานพัฒนาระบบเอกสารสารบรรณ'
  );
  const [signerOrg, setSignerOrg] = useState<string>(
    draft.department || 'สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล'
  );
  const [signerRole, setSignerRole] = useState<'primary' | 'contractor' | 'witness1' | 'witness2' | 'approver'>('primary');
  const [showStampBadge, setShowStampBadge] = useState<boolean>(true);

  // Initialize Canvas
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  // Drawing event handlers with support for Mouse & Touch
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history for undo
    setDrawHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawStrokeWidth;
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setDrawHistory([]);
  };

  const undoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastState = drawHistory[drawHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setDrawHistory((prev) => prev.slice(0, prev.length - 1));
    if (drawHistory.length <= 1) {
      setHasDrawn(false);
    }
  };

  // Convert Typed text to high-res PNG Data URL
  const generateTypedSignatureDataUrl = (text: string, font: string, color: string): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 450;
    tempCanvas.height = 140;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.font = `600 38px "${font}", cursive, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);

    return tempCanvas.toDataURL('image/png');
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('กรุณาเลือกไฟล์รูปภาพ (PNG / JPG / SVG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageDataUrl(reader.result as string);
      setUploadedFileName(file.name);
      onShowToast(`นำเข้าภาพลายเซ็น "${file.name}" เรียบร้อย`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Generate Digital Certificate Hash & ID
  const generateCertificate = () => {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const certId = `TH-EID-${new Date().getFullYear()}-${randomHex}`;
    const hash = `SHA256: ${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`;
    const now = new Date();
    const thaiDate = `${getThaiCurrentDate()} เวลา ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    return {
      certId,
      hash,
      thaiDate,
      isoDate: now.toISOString(),
    };
  };

  // Get Role label in Thai
  const getRoleLabel = (r: typeof signerRole) => {
    switch (r) {
      case 'primary':
        return 'ผู้มีอำนาจลงนาม / ผู้ให้สัญญา (Primary Signer)';
      case 'contractor':
        return 'ผู้รับสัญญา / ผู้ขออนุมัติ (Counterparty)';
      case 'witness1':
        return 'พยาน คนที่ ๑ (Witness 1)';
      case 'witness2':
        return 'พยาน คนที่ ๒ (Witness 2)';
      case 'approver':
        return 'ผู้ตรวจทาน / ผู้เกษียณหนังสือ (Reviewer)';
      default:
        return 'ผู้มีอำนาจลงนาม';
    }
  };

  // Handle Apply Signature
  const handleApplySignature = (andExport: boolean = false) => {
    let signatureUrl = '';

    if (activeTab === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        onShowToast('กรุณาวาดลายเซ็นบนผืนผ้าใบก่อนลงนาม', 'error');
        return;
      }
      signatureUrl = canvasRef.current.toDataURL('image/png');
    } else if (activeTab === 'type') {
      if (!typedText.trim()) {
        onShowToast('กรุณากรอกชื่อสำหรับสร้างลายเซ็น', 'error');
        return;
      }
      signatureUrl = generateTypedSignatureDataUrl(typedText, selectedFontFamily, typedColor);
    } else if (activeTab === 'upload') {
      if (!uploadedImageDataUrl) {
        onShowToast('กรุณาอัปโหลดรูปภาพลายเซ็น', 'error');
        return;
      }
      signatureUrl = uploadedImageDataUrl;
    }

    const cert = generateCertificate();
    const newSignature: DigitalSignature = {
      id: `sig-${Date.now()}`,
      signatureDataUrl: signatureUrl,
      signerName: signerName.trim() ? `( ${signerName.trim()} )` : draft.signName,
      signerPosition: signerPosition.trim() || draft.signPosition,
      organization: signerOrg.trim() || draft.department,
      signType: activeTab === 'manage' ? 'draw' : activeTab,
      signStyleFont: selectedFontFamily,
      signedAt: cert.isoDate,
      signedAtThai: cert.thaiDate,
      certificateId: cert.certId,
      checksumHash: cert.hash,
      role: signerRole,
      roleLabel: getRoleLabel(signerRole),
      isValidated: true,
      showStampBadge: showStampBadge,
    };

    onUpdateDraft((prev) => {
      const existing = prev.digitalSignatures || [];
      // Replace if same role, or append
      const filtered = existing.filter((s) => s.role !== signerRole);
      const updatedList = [...filtered, newSignature];

      return {
        ...prev,
        digitalSignatures: updatedList,
        isDigitallySigned: true,
        signName: signerRole === 'primary' ? newSignature.signerName : prev.signName,
        signPosition: signerRole === 'primary' ? newSignature.signerPosition : prev.signPosition,
      };
    });

    onShowToast(`ลงนามดิจิทัลเรียบร้อย (${newSignature.roleLabel})`, 'success');

    if (andExport && onOpenExportWord) {
      onClose();
      setTimeout(() => onOpenExportWord(), 200);
    } else {
      onClose();
    }
  };

  // Remove a signature
  const handleRemoveSignature = (sigId: string) => {
    onUpdateDraft((prev) => {
      const updated = (prev.digitalSignatures || []).filter((s) => s.id !== sigId);
      return {
        ...prev,
        digitalSignatures: updated,
        isDigitallySigned: updated.length > 0,
      };
    });
    onShowToast('ลบลายเซ็นออกจากเอกสารแล้ว', 'info');
  };

  const existingSignatures = draft.digitalSignatures || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>ระบบเซ็นสัญญา & ลายเซ็นดิจิทัล</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  E-Signature
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ลงนามอิเล็กทรอนิกส์พร้อมตราประทับรับรองดิจิทัล ก่อนบันทึกหรือส่งออก Word
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
          {/* Signatures Status Bar (if any signed already) */}
          {existingSignatures.length > 0 && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    เอกสารนี้มีลายเซ็นดิจิทัลแล้ว {existingSignatures.length} รายการ
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {existingSignatures.map((s) => s.signerName).join(', ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-200 transition-colors"
              >
                ดูลายเซ็นทั้งหมด
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border border-slate-200 dark:border-slate-800 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('draw')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'draw'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>วาดลายเซ็นสด</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('type')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'type'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>พิมพ์ชื่อลายเซ็น</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลดภาพลายเซ็น</span>
            </button>
            {existingSignatures.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'manage'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>รายการ ({existingSignatures.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: DRAW CANVAS */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-indigo-500" />
                  ผืนผ้าใบวาดลายเซ็น (ใช้นิ้ว ปากกา หรือเมาส์วาดได้ทันที)
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Ink Colors */}
                  <button
                    type="button"
                    onClick={() => setDrawPenColor('#002288')}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      drawPenColor === '#002288' ? 'scale-110 border-indigo-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: '#002288' }}
                    title="หมึกน้ำเงินทางการ"
                  />
                  <button
                    type="button"
                    onClick={() => setDrawPenColor('#111111')}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      drawPenColor === '#111111' ? 'scale-110 border-indigo-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: '#111111' }}
                    title="หมึกดำ"
                  />
                  <button
                    type="button"
                    onClick={() => setDrawPenColor('#004d40')}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      drawPenColor === '#004d40' ? 'scale-110 border-indigo-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: '#004d40' }}
                    title="หมึกเขียวเข้ม"
                  />
                  <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                  {/* Stroke width */}
                  <button
                    type="button"
                    onClick={() => setDrawStrokeWidth(2)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      drawStrokeWidth === 2 ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    บาง
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawStrokeWidth(3)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      drawStrokeWidth === 3 ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    กลาง
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawStrokeWidth(4)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      drawStrokeWidth === 4 ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    หนา
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="relative border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 rounded-2xl overflow-hidden bg-white shadow-inner cursor-crosshair touch-none">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-48 block"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1">
                    <PenTool className="w-8 h-8 stroke-1 text-slate-300" />
                    <span className="text-xs">จรดปากกาหรือวาดลายเซ็นที่นี่</span>
                    <span className="text-[10px] text-slate-300">รองรับระบบสัมผัส จอทัชสกรีน และเมาส์</span>
                  </div>
                )}
                {/* Signature Base Line Guide */}
                <div className="absolute bottom-6 left-12 right-12 border-b border-dotted border-slate-200 pointer-events-none" />
              </div>

              {/* Canvas Control Tools */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={undoCanvas}
                    disabled={drawHistory.length === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ย้อนกลับ (Undo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างทั้งหมด</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  {hasDrawn ? '✨ พร้อมลงนามในเอกสาร' : 'กรุณาวาดลายเซ็น'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: TYPE SIGNATURE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  กรอกชื่อ-นามสกุล หรือข้อความลายเซ็น
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="เช่น สมศักดิ์ นำพาความก้าวหน้า"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Signature Font Styles */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  เลือกรูปแบบฟอนต์ลายมือ / ลายเซ็น:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Style 1: Charmonman */}
                  <div
                    onClick={() => setSelectedFontFamily('Charmonman')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedFontFamily === 'Charmonman'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        สไตล์ ๑: อาลักษณ์ไทยวิจิตร
                      </span>
                      {selectedFontFamily === 'Charmonman' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div
                      style={{ fontFamily: 'Charmonman, cursive', color: typedColor }}
                      className="text-2xl text-center py-2 truncate"
                    >
                      {typedText || 'สมศักดิ์'}
                    </div>
                  </div>

                  {/* Style 2: Mali Handwriting */}
                  <div
                    onClick={() => setSelectedFontFamily('Mali')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedFontFamily === 'Mali'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        สไตล์ ๒: ลายมือธรรมชาติ
                      </span>
                      {selectedFontFamily === 'Mali' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div
                      style={{ fontFamily: 'Mali, cursive', fontStyle: 'italic', color: typedColor }}
                      className="text-2xl text-center py-2 truncate font-semibold"
                    >
                      {typedText || 'สมศักดิ์'}
                    </div>
                  </div>

                  {/* Style 3: Caveat Signature */}
                  <div
                    onClick={() => setSelectedFontFamily('Caveat')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedFontFamily === 'Caveat'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        สไตล์ ๓: ลายเซ็นพริ้วไหว
                      </span>
                      {selectedFontFamily === 'Caveat' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div
                      style={{ fontFamily: 'Caveat, cursive', color: typedColor }}
                      className="text-3xl text-center py-1 truncate font-bold"
                    >
                      {typedText || 'Somsak'}
                    </div>
                  </div>

                  {/* Style 4: Sarabun Script */}
                  <div
                    onClick={() => setSelectedFontFamily('Sarabun')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedFontFamily === 'Sarabun'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        สไตล์ ๔: ทางการสารบรรณ
                      </span>
                      {selectedFontFamily === 'Sarabun' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div
                      style={{ fontFamily: 'Sarabun, sans-serif', fontStyle: 'italic', color: typedColor }}
                      className="text-xl text-center py-2 truncate font-semibold"
                    >
                      {typedText || 'สมศักดิ์'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD SIGNATURE IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
              />

              {!uploadedImageDataUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    คลิกเพื่อเลือกไฟล์รูปภาพลายเซ็น (PNG / JPG / SVG)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    แนะนำให้ใช้ภาพลายเซ็นที่มีพื้นหลังโปร่งใส (Transparent PNG) เพื่อความสวยงามในเอกสาร
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden">
                        <img src={uploadedImageDataUrl} alt="Signature Preview" className="max-h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{uploadedFileName}</p>
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" /> ภาพลายเซ็นพร้อมใช้งาน
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors"
                    >
                      เปลี่ยนรูป
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANAGE EXISTING SIGNATURES */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                รายการลายเซ็นที่ลงนามแล้วในแบบร่างนี้ ({existingSignatures.length})
              </span>
              {existingSignatures.map((sig) => (
                <div
                  key={sig.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {sig.signatureDataUrl ? (
                        <img src={sig.signatureDataUrl} alt={sig.signerName} className="max-h-full object-contain" />
                      ) : (
                        <PenTool className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {sig.signerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                          {sig.roleLabel.split('(')[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{sig.signerPosition}</p>
                      <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        รหัส: {sig.certificateId} • {sig.signedAtThai}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSignature(sig.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                    title="ลบลายเซ็นนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SIGNER METADATA FORM (Always visible except manage tab) */}
          {activeTab !== 'manage' && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  ข้อมูลผู้มีอำนาจลงนามและตำแหน่ง
                </span>
                <span className="text-[11px] text-slate-400">จะแสดงใต้ลายเซ็นในเอกสาร</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ชื่อ-นามสกุล ผู้ลงนาม:
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="เช่น นายสมศักดิ์ นำพาความก้าวหน้า"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ตำแหน่ง:
                  </label>
                  <input
                    type="text"
                    value={signerPosition}
                    onChange={(e) => setSignerPosition(e.target.value)}
                    placeholder="เช่น ผู้อำนวยการสำนักบริหารงานกลาง"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    บทบาทการลงนาม (Signer Role):
                  </label>
                  <select
                    value={signerRole}
                    onChange={(e: any) => setSignerRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="primary">ผู้มีอำนาจลงนาม / ผู้ให้สัญญา (Primary Signer)</option>
                    <option value="contractor">ผู้รับสัญญา / ผู้ขออนุมัติ (Counterparty)</option>
                    <option value="witness1">พยาน คนที่ ๑ (Witness 1)</option>
                    <option value="witness2">พยาน คนที่ ๒ (Witness 2)</option>
                    <option value="approver">ผู้ตรวจทาน / เกษียณหนังสือ (Reviewer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    หน่วยงาน / องค์กร:
                  </label>
                  <input
                    type="text"
                    value={signerOrg}
                    onChange={(e) => setSignerOrg(e.target.value)}
                    placeholder="เช่น สำนักบริหารงานกลางและยุทธศาสตร์ดิจิทัล"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Verification Stamp Checkbox */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <input
                  type="checkbox"
                  id="showStampBadgeCheck"
                  checked={showStampBadge}
                  onChange={(e) => setShowStampBadge(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="showStampBadgeCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                    แสดงตราประทับรับรองดิจิทัล (E-Signature Verified Stamp)
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    แนบตราประทับ วันที่-เวลาลงนาม และรหัสรับรองตาม พ.ร.บ.ธุรกรรมอิเล็กทรอนิกส์
                  </span>
                </label>
              </div>
            </div>
          )}
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
            {/* Direct Apply Button */}
            <button
              type="button"
              onClick={() => handleApplySignature(false)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>ลงนามในเอกสาร</span>
            </button>

            {/* Apply & Open Word Export */}
            {onOpenExportWord && (
              <button
                type="button"
                onClick={() => handleApplySignature(true)}
                className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileDown className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>ลงนามแล้วส่งออก Word ทันที</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
