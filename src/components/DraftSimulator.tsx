import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Copy, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Plus, 
  GripVertical, 
  Eye, 
  FileCode2, 
  Check, 
  Trash2,
  Wand2,
  Layers,
  Search,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileDown,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Smartphone,
  Maximize,
  HelpCircle,
  Hash,
  Calendar,
  UserCheck,
  CheckCircle2,
  PenTool,
  Paperclip,
  BookmarkPlus,
  Upload,
  Image as ImageIcon,
  Ruler,
  Maximize2,
  Settings2,
  ShieldCheck,
  Stamp,
  UploadCloud,
  FileCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { DraftDocument, DraftToken, DocumentItem, AttachedImage } from '../types';
import { DEFAULT_TOKENS, TEMPLATES } from '../data/mockData';
import { 
  toThaiNumerals, 
  toArabicNumerals, 
  getThaiCurrentDate, 
  createDraftFromRepositoryDoc, 
  exportToMicrosoftWordDoc,
  getPaperDimensions,
  getPaperMargins
} from '../utils/draftHelpers';
import { LogoCustomizerModal } from './LogoCustomizerModal';
import { FileUploadModal } from './FileUploadModal';
import { ImageAttachmentModal } from './ImageAttachmentModal';
import { PaperSettingsModal } from './PaperSettingsModal';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { ExportWordModal } from './ExportWordModal';

interface DraftSimulatorProps {
  documents: DocumentItem[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialDocRef?: DocumentItem | null;
  onClearInitialDocRef?: () => void;
}

export const DraftSimulator: React.FC<DraftSimulatorProps> = ({
  documents,
  onShowToast,
  initialDocRef,
  onClearInitialDocRef,
}) => {
  // Modals
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState<boolean>(false);
  const [showImageAttachModal, setShowImageAttachModal] = useState<boolean>(false);
  const [showPaperModal, setShowPaperModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showZoomDialog, setShowZoomDialog] = useState<boolean>(false);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [showExportWordModal, setShowExportWordModal] = useState<boolean>(false);

  // Bottom Text Panel & Raw Text mode
  const [showBottomText, setShowBottomText] = useState<boolean>(true);
  const [bottomTextMode, setBottomTextMode] = useState<'formatted' | 'raw'>('formatted');
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Zoom & View
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 46;
      if (window.innerWidth < 1024) return 65;
      return 85;
    }
    return 85;
  });

  const [activeTemplate, setActiveTemplate] = useState<string>('official_memo');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('');

  // Repository search inside Simulator
  const [repoSearch, setRepoSearch] = useState<string>('');
  const [repoCategory, setRepoCategory] = useState<string>('All');

  // Document State
  const [draft, setDraft] = useState<DraftDocument>(() => {
    const saved = localStorage.getItem('corporate_draft_doc_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.docNumber) return parsed;
      } catch (e) {}
    }
    return {
      id: 'draft-1',
      ...TEMPLATES.official_memo,
      logoType: 'garuda',
      attachedImages: [],
      paperSize: 'a4',
      paperOrientation: 'portrait',
      paperMargin: 'standard_thai',
      showPageRuler: false,
      showPageBorders: true,
    };
  });

  const [activeTabPanel, setActiveTabPanel] = useState<'edit' | 'sign' | 'logo' | 'paper' | 'tokens' | 'docs' | 'templates'>('edit');
  const [selectedTokenCategory, setSelectedTokenCategory] = useState<string>('all');
  const [draggedToken, setDraggedToken] = useState<DraftToken | null>(null);

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('corporate_draft_doc_v3', JSON.stringify(draft));
  }, [draft]);

  // Manual save draft handler with explicit confirmation
  const handleManualSaveDraft = () => {
    localStorage.setItem('corporate_draft_doc_v3', JSON.stringify(draft));
    const sigCount = draft.digitalSignatures?.length || 0;
    onShowToast(`บันทึกแบบร่างเอกสาร "${draft.subject || draft.docTypeTitle}" เรียบร้อยแล้ว ${sigCount > 0 ? `(พร้อม ${sigCount} ลายเซ็นดิจิทัล)` : ''}`, 'success');
  };

  // Handle incoming document reference from directory
  useEffect(() => {
    if (initialDocRef) {
      const generatedDraft = createDraftFromRepositoryDoc(initialDocRef);
      setDraft(generatedDraft);
      setActiveTemplate('custom');
      onShowToast(`ดึงเอกสาร "${initialDocRef.name}" เข้าแบบร่างจำลองเรียบร้อย`, 'success');
      if (onClearInitialDocRef) onClearInitialDocRef();
    }
  }, [initialDocRef]);

  // Paper and Margin calculation
  const paperDim = getPaperDimensions(
    draft.paperSize || 'a4',
    draft.paperOrientation || 'portrait',
    draft.customWidthMm,
    draft.customHeightMm
  );

  const paperMargin = getPaperMargins(
    draft.paperMargin || 'standard_thai',
    draft.customMarginTopCm,
    draft.customMarginBottomCm,
    draft.customMarginLeftCm,
    draft.customMarginRightCm
  );

  // Zoom Helpers: Fit Whole Paper Page (เห็นทั้งกระดาษ), Fit Width (พอดีความกว้าง), Real 100%
  const setFitWholePage = () => {
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const availableH = Math.max(screenH - 260, 480);
    const availableW = screenW < 1024 ? screenW - 40 : 800;
    const baseH = paperDim.heightPx || 1123;
    const baseW = paperDim.widthPx || 794;
    const scaleH = (availableH / baseH) * 100;
    const scaleW = (availableW / baseW) * 100;
    const fitVal = Math.min(scaleH, scaleW);
    const finalZoom = Math.min(Math.max(Math.round(fitVal), 32), 85);
    setZoomLevel(finalZoom);
    onShowToast(`ปรับมุมมองเห็นทั้งกระดาษ (${finalZoom}%)`, 'info');
  };

  const setFitWidth = () => {
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const availableW = screenW < 1024 ? screenW - 40 : 800;
    const baseW = paperDim.widthPx || 794;
    const fitVal = Math.min(Math.max(Math.round((availableW / baseW) * 100), 38), 120);
    setZoomLevel(fitVal);
    onShowToast(`ปรับพอดีความกว้าง (${fitVal}%)`, 'info');
  };

  const setRealSize100 = () => {
    setZoomLevel(100);
    onShowToast(`ปรับเป็นขนาดพิมพ์จริง 100% (${paperDim.label})`, 'info');
  };

  // Generate plain text summary of whole document
  const generateFullPlainText = (d: DraftDocument) => {
    const parts: string[] = [];
    parts.push(`[${d.docTypeTitle || 'บันทึกข้อความ'}]`);
    parts.push(`ส่วนราชการ: ${d.department || ''} ${d.departmentSub ? `(${d.departmentSub})` : ''} ${d.phone ? `โทร. ${d.phone}` : ''}`.trim());
    parts.push(`ที่: ${d.docNumber || ''}\tวันที่: ${d.date || ''}`);
    parts.push(`เรื่อง: ${d.subject || ''}`);
    parts.push(`เรียน: ${d.to || ''}`);
    if (d.hasReference && d.reference) parts.push(`อ้างถึง: ${d.reference}`);
    if (d.hasAttachments && d.attachments) parts.push(`สิ่งที่ส่งมาด้วย: ${d.attachments}`);
    parts.push('');
    parts.push(d.content || '');
    parts.push('');
    parts.push(d.closingPhrase || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ');

    // Signatures
    if (d.digitalSignatures && d.digitalSignatures.length > 0) {
      parts.push('\n[การลงนามดิจิทัล / E-Signatures]');
      d.digitalSignatures.forEach((s) => {
        parts.push(`(ลงชื่อ) ${s.signerName} - ${s.signerPosition} [${s.roleLabel}]`);
        parts.push(`  ✓ Cert ID: ${s.certificateId} | วันที่ลงนาม: ${s.signedAtThai}`);
      });
    } else {
      parts.push(`\n(ลงชื่อ)\n${d.signName || ''}\n${d.signPosition || ''}`);
      if (d.hasActingPosition && d.signActing) parts.push(d.signActing);
    }

    if (d.hasRoutingSlip && d.routingComment) {
      parts.push(`\n--- การเกษียณหนังสือ ---\n${d.routingComment}\n(ลงชื่อ) ${d.routingSignName || d.signName}\nวันที่ ${d.routingDate || d.date}`);
    }
    return parts.join('\n');
  };

  // Copy full document text
  const handleCopyAllText = () => {
    const fullText = generateFullPlainText(draft);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullText).then(() => {
        onShowToast('คัดลอกข้อความเอกสารทั้งหมดแล้ว', 'success');
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = fullText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('คัดลอกข้อความเอกสารทั้งหมดแล้ว', 'success');
    }
  };

  // Download plain text (.txt)
  const handleDownloadTxt = () => {
    const fullText = generateFullPlainText(draft);
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.subject || 'เอกสารจำลอง'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('ดาวน์โหลดไฟล์ข้อความ (.txt) สำเร็จ', 'success');
  };

  // Convert numbers
  const handleConvertToThaiNumerals = () => {
    setDraft((prev) => ({
      ...prev,
      docNumber: toThaiNumerals(prev.docNumber),
      date: toThaiNumerals(prev.date),
      subject: toThaiNumerals(prev.subject),
      department: toThaiNumerals(prev.department),
      departmentSub: prev.departmentSub ? toThaiNumerals(prev.departmentSub) : '',
      phone: prev.phone ? toThaiNumerals(prev.phone) : '',
      reference: prev.reference ? toThaiNumerals(prev.reference) : '',
      attachments: prev.attachments ? toThaiNumerals(prev.attachments) : '',
      content: toThaiNumerals(prev.content),
      closingPhrase: toThaiNumerals(prev.closingPhrase),
      signName: toThaiNumerals(prev.signName),
      signPosition: toThaiNumerals(prev.signPosition),
      routingComment: prev.routingComment ? toThaiNumerals(prev.routingComment) : '',
      routingDate: prev.routingDate ? toThaiNumerals(prev.routingDate) : '',
      useThaiNumerals: true,
    }));
    onShowToast('แปลงตัวเลขทั้งหมดเป็นเลขไทย (๑ ๒ ๓) เรียบร้อย', 'success');
  };

  const handleConvertToArabicNumerals = () => {
    setDraft((prev) => ({
      ...prev,
      docNumber: toArabicNumerals(prev.docNumber),
      date: toArabicNumerals(prev.date),
      subject: toArabicNumerals(prev.subject),
      department: toArabicNumerals(prev.department),
      departmentSub: prev.departmentSub ? toArabicNumerals(prev.departmentSub) : '',
      phone: prev.phone ? toArabicNumerals(prev.phone) : '',
      reference: prev.reference ? toArabicNumerals(prev.reference) : '',
      attachments: prev.attachments ? toArabicNumerals(prev.attachments) : '',
      content: toArabicNumerals(prev.content),
      closingPhrase: toArabicNumerals(prev.closingPhrase),
      signName: toArabicNumerals(prev.signName),
      signPosition: toArabicNumerals(prev.signPosition),
      routingComment: prev.routingComment ? toArabicNumerals(prev.routingComment) : '',
      routingDate: prev.routingDate ? toArabicNumerals(prev.routingDate) : '',
      useThaiNumerals: false,
    }));
    onShowToast('แปลงตัวเลขทั้งหมดเป็นเลขอารบิก (1 2 3) เรียบร้อย', 'info');
  };

  // Change Template
  const handleSelectTemplate = (templateKey: string) => {
    setActiveTemplate(templateKey);
    const tmpl = TEMPLATES[templateKey];
    if (tmpl) {
      setDraft({
        id: `draft-${Date.now()}`,
        ...tmpl,
      });
      onShowToast(`โหลดแม่แบบ "${tmpl.title}" เรียบร้อย`, 'info');
    }
  };

  // Load a document from repository into draft
  const handleLoadDocFromRepository = (doc: DocumentItem) => {
    const newDraft = createDraftFromRepositoryDoc(doc);
    setDraft(newDraft);
    setActiveTemplate('custom');
    onShowToast(`ดึงเอกสาร "${doc.name}" มาสร้างเป็นแบบร่างจำลองเรียบร้อยแล้ว`, 'success');
  };

  // Insert Token into Document
  const handleInsertToken = (token: DraftToken) => {
    if (token.category === 'header' && token.value === '[ตราครุฑ]') {
      setShowLogoModal(true);
      return;
    }

    if (token.category === 'meta' && token.id === 't-subject') {
      setDraft((prev) => ({ ...prev, subject: token.value }));
    } else if (token.category === 'meta' && token.id === 't-to') {
      setDraft((prev) => ({ ...prev, to: token.value }));
    } else if (token.category === 'meta' && token.id === 't-docno') {
      setDraft((prev) => ({ ...prev, docNumber: token.value + '๑๒๓/๒๕๖๘' }));
    } else if (token.category === 'header' && token.id === 't-dept') {
      setDraft((prev) => ({ ...prev, department: token.value }));
    } else if (token.category === 'date') {
      setDraft((prev) => ({ ...prev, date: token.value }));
    } else if (token.category === 'signature') {
      const lines = token.value.split('\n');
      setDraft((prev) => ({
        ...prev,
        signName: lines[0] || prev.signName,
        signPosition: lines[1] || prev.signPosition,
      }));
    } else {
      setDraft((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${token.value}` : token.value,
      }));
    }

    onShowToast(`แทรกข้อความ "${token.label}" สำเร็จ`, 'success');
  };

  // AI Draft Generator
  const handleGenerateAiDraft = async () => {
    if (!aiTopic.trim()) {
      onShowToast('กรุณาระบุหัวข้อหรือวัตถุประสงค์ที่ต้องการร่าง', 'error');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: draft.docTypeTitle || draft.title,
          title: aiTopic,
          recipient: draft.to,
          department: draft.department,
          notes: aiTopic,
        }),
      });

      const data = await res.json();
      if (data.success && data.draft) {
        const d = data.draft;
        setDraft((prev) => ({
          ...prev,
          docNumber: d.docNumber || prev.docNumber,
          department: d.department || prev.department,
          date: d.date || prev.date,
          subject: d.subject || prev.subject,
          to: d.to || prev.to,
          content: d.content || prev.content,
          signName: d.signName || prev.signName,
          signPosition: d.signPosition || prev.signPosition,
        }));
        setShowAiModal(false);
        setAiTopic('');
        onShowToast(data.isAiGenerated ? 'AI ร่างเอกสารให้เรียบร้อยแล้ว!' : 'สร้างร่างเอกสารจากแม่แบบเรียบร้อย', 'success');
      } else {
        throw new Error(data.message || 'Draft failed');
      }
    } catch (err: any) {
      onShowToast(`การร่างข้อความขัดข้อง: ${err.message}`, 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Export Microsoft Word (.doc) File Modal Opener
  const handleExportWordDoc = () => {
    setShowExportWordModal(true);
  };

  const signaturesCount = draft.digitalSignatures?.length || 0;
  const isDocSigned = signaturesCount > 0;

  // Filter Tokens
  const filteredTokens = DEFAULT_TOKENS.filter((t) => {
    if (selectedTokenCategory === 'all') return true;
    return t.category === selectedTokenCategory;
  });

  // Filter Repository Docs
  const filteredRepoDocs = documents.filter((d) => {
    const matchesCat = repoCategory === 'All' || d.category === repoCategory;
    const matchesSearch = !repoSearch || d.name.toLowerCase().includes(repoSearch.toLowerCase()) || d.category.toLowerCase().includes(repoSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Categories list for repo filter
  const repoCategories = ['All', ...Array.from(new Set(documents.map((d) => d.category)))];

  // Determine Logo Image Source
  let logoImgSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png';
  if (draft.logoType === 'custom_image' && draft.logoCustomUrl) {
    logoImgSrc = draft.logoCustomUrl;
  } else if (draft.logoType === 'ministry') {
    logoImgSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png';
  } else if (draft.logoType === 'circle_seal') {
    logoImgSrc = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png';
  }

  const logoSizePx = draft.logoCustomSizePx || (
    draft.garudaSize === 'sm' ? 55 :
    draft.garudaSize === 'md' ? 75 :
    draft.garudaSize === 'lg' ? 95 :
    draft.garudaSize === 'xl' ? 120 : 75
  );

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Import Local File (Word / PDF / Image) */}
            <button
              type="button"
              onClick={() => setShowFileUploadModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>นำเข้าไฟล์ (Word / PDF / เครื่อง)</span>
            </button>

            {/* Logo & Emblem Customizer */}
            <button
              type="button"
              onClick={() => setShowLogoModal(true)}
              className="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              <span>ปรับตรา / ใส่โลโก้</span>
            </button>

            {/* Insert Images into Body */}
            <button
              type="button"
              onClick={() => setShowImageAttachModal(true)}
              className="px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>แทรกรูปภาพ ({draft.attachedImages?.length || 0})</span>
            </button>

            {/* Paper Sizing & Margins */}
            <button
              type="button"
              onClick={() => setShowPaperModal(true)}
              className="px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <Ruler className="w-4 h-4 text-amber-500" />
              <span>ขนาดกระดาษ ({draft.paperSize?.toUpperCase() || 'A4'})</span>
            </button>

            {/* Digital Signature Modal Opener */}
            <button
              type="button"
              onClick={() => setShowSignatureModal(true)}
              className={`px-3 py-2 rounded-2xl border font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                isDocSigned
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}
              title="เซ็นสัญญาดิจิทัล หรือ จัดการลายเซ็นอิเล็กทรอนิกส์"
            >
              <PenTool className={`w-4 h-4 ${isDocSigned ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-500'}`} />
              <span>{isDocSigned ? `✍️ เซ็นแล้ว (${signaturesCount})` : '✍️ เซ็นสัญญาดิจิทัล'}</span>
              {isDocSigned && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-3 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI ช่วยร่าง</span>
            </button>

            {/* Bottom Text Display Toggle Button */}
            <button
              type="button"
              onClick={() => setShowBottomText(!showBottomText)}
              className={`px-3 py-2 rounded-2xl border font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                showBottomText
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}
              title="แสดงหรือซ่อนกล่องข้อความเอกสารทั้งหมดด้านล่างกระดาษ"
            >
              <FileText className="w-4 h-4" />
              <span>{showBottomText ? 'ซ่อนข้อความด้านล่าง' : 'แสดงข้อความด้านล่าง'}</span>
            </button>
          </div>

          {/* Export & Utility Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleManualSaveDraft}
              title="บันทึกแบบร่างเอกสาร (Auto-save + Manual Save)"
              className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>บันทึกแบบร่าง</span>
            </button>

            {/* Number Mode Switcher */}
            <button
              type="button"
              onClick={draft.useThaiNumerals ? handleConvertToArabicNumerals : handleConvertToThaiNumerals}
              title="สลับระหว่างเลขไทยกับเลขอารบิก"
              className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              {draft.useThaiNumerals ? 'เลขไทย (๑ ๒ ๓)' : 'เลขอารบิก (1 2 3)'}
            </button>

            {/* Export Word (.doc) with Thai Fonts standard */}
            <button
              type="button"
              onClick={handleExportWordDoc}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileDown className="w-4 h-4 text-blue-400 dark:text-blue-600" />
              <span>ส่งออก Word (.doc)</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              title="พิมพ์ หรือ บันทึกเป็น PDF"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Left Controls + Right Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar Control Panels (5 Cols on large) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          {/* Panel Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTabPanel('edit')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTabPanel === 'edit'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              แก้ไขฟิลด์
            </button>

            <button
              type="button"
              onClick={() => setActiveTabPanel('sign')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${
                activeTabPanel === 'sign'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>เซ็นสัญญา</span>
              {signaturesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  {signaturesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTabPanel('logo')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTabPanel === 'logo'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ตรา & รูปภาพ
            </button>

            <button
              type="button"
              onClick={() => setActiveTabPanel('paper')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTabPanel === 'paper'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              หน้ากระดาษ
            </button>

            <button
              type="button"
              onClick={() => setActiveTabPanel('docs')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTabPanel === 'docs'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ดึงจากคลัง
            </button>

            <button
              type="button"
              onClick={() => setActiveTabPanel('templates')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTabPanel === 'templates'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              แม่แบบ
            </button>

            <button
              type="button"
              onClick={() => setActiveTabPanel('tokens')}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTabPanel === 'tokens'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              คลังคำ
            </button>
          </div>

          {/* Panel Contents */}
          <div className="p-4 sm:p-5 max-h-[78vh] overflow-y-auto space-y-4 text-xs">
            {/* Tab: Quick Field Editor */}
            {activeTabPanel === 'edit' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ประเภทเอกสาร / หัวกระดาษ:
                  </label>
                  <input
                    type="text"
                    value={draft.docTypeTitle}
                    onChange={(e) => setDraft((p) => ({ ...p, docTypeTitle: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ส่วนราชการ / หน่วยงาน:
                  </label>
                  <input
                    type="text"
                    value={draft.department}
                    onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ที่ (เลขที่หนังสือ):
                    </label>
                    <input
                      type="text"
                      value={draft.docNumber}
                      onChange={(e) => setDraft((p) => ({ ...p, docNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      วันที่:
                    </label>
                    <input
                      type="text"
                      value={draft.date}
                      onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เรื่อง:
                  </label>
                  <input
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เรียน:
                  </label>
                  <input
                    type="text"
                    value={draft.to}
                    onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Reference & Attachments Toggles */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      อ้างถึง (Reference):
                    </label>
                    <input
                      type="checkbox"
                      checked={draft.hasReference}
                      onChange={(e) => setDraft((p) => ({ ...p, hasReference: e.target.checked }))}
                    />
                  </div>
                  {draft.hasReference && (
                    <input
                      type="text"
                      value={draft.reference || ''}
                      onChange={(e) => setDraft((p) => ({ ...p, reference: e.target.value }))}
                      placeholder="ระบุหนังสือที่อ้างถึง..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      สิ่งที่ส่งมาด้วย (Attachments):
                    </label>
                    <input
                      type="checkbox"
                      checked={draft.hasAttachments}
                      onChange={(e) => setDraft((p) => ({ ...p, hasAttachments: e.target.checked }))}
                    />
                  </div>
                  {draft.hasAttachments && (
                    <textarea
                      rows={2}
                      value={draft.attachments || ''}
                      onChange={(e) => setDraft((p) => ({ ...p, attachments: e.target.value }))}
                      placeholder="๑. รายการเอกสารแนบ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
                    />
                  )}
                </div>

                {/* Body Content */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เนื้อหาเอกสาร (Content Body):
                  </label>
                  <textarea
                    rows={6}
                    value={draft.content}
                    onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed font-sans"
                  />
                </div>

                {/* Closing & Signer */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    คำลงท้าย:
                  </label>
                  <input
                    type="text"
                    value={draft.closingPhrase}
                    onChange={(e) => setDraft((p) => ({ ...p, closingPhrase: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อผู้ลงนาม:
                    </label>
                    <input
                      type="text"
                      value={draft.signName}
                      onChange={(e) => setDraft((p) => ({ ...p, signName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ตำแหน่ง:
                    </label>
                    <input
                      type="text"
                      value={draft.signPosition}
                      onChange={(e) => setDraft((p) => ({ ...p, signPosition: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Routing slip */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      ท้ายบันทึก / เกษียณหนังสือ (Routing Slip):
                    </label>
                    <input
                      type="checkbox"
                      checked={draft.hasRoutingSlip}
                      onChange={(e) => setDraft((p) => ({ ...p, hasRoutingSlip: e.target.checked }))}
                    />
                  </div>
                  {draft.hasRoutingSlip && (
                    <textarea
                      rows={2}
                      value={draft.routingComment || ''}
                      onChange={(e) => setDraft((p) => ({ ...p, routingComment: e.target.value }))}
                      placeholder="คำสั่ง / บันทึกการเกษียณ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Tab: Digital Signatures (เซ็นสัญญาดิจิทัล) */}
            {activeTabPanel === 'sign' && (
              <div className="space-y-4">
                {/* Main Action Banner */}
                <div className="p-4 bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        เซ็นสัญญา & ลายเซ็นดิจิทัล
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {signaturesCount > 0 ? `ลงนามแล้ว ${signaturesCount} ลายเซ็น` : 'ยังไม่มีการลงนามในเอกสารนี้'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSignatureModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{signaturesCount > 0 ? 'จัดการ / เพิ่มผู้ลงนามในสัญญา' : '✍️ เปิดหน้าต่างเซ็นสัญญาดิจิทัล'}</span>
                  </button>
                </div>

                {/* Signers List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>รายชื่อผู้ลงนาม ({signaturesCount})</span>
                    </label>
                    {signaturesCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((p) => ({ ...p, digitalSignatures: [] }));
                          onShowToast('ลบลายเซ็นทั้งหมดเรียบร้อย', 'info');
                        }}
                        className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline"
                      >
                        ลบทั้งหมด
                      </button>
                    )}
                  </div>

                  {signaturesCount === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        เอกสารนี้ยังไม่ได้ลงนาม คุณสามารถเซ็นด้วยการวาดมือ, พิมพ์ชื่อ หรืออัปโหลดไฟล์ภาพลายเซ็นได้
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowSignatureModal(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + เซ็นสัญญาตอนนี้
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draft.digitalSignatures?.map((sig, idx) => (
                        <div
                          key={sig.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs">
                                  {sig.signerName}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {sig.signerPosition}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {sig.roleLabel}
                            </span>
                          </div>

                          {/* Signature Preview */}
                          {sig.signatureDataUrl && (
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-center">
                              <img
                                src={sig.signatureDataUrl}
                                alt="ลายเซ็น"
                                className="max-h-12 max-w-full object-contain"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                            <span>ID: {sig.certificateId}</span>
                            <span>{sig.signedAtThai.split(' ')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification Badge settings */}
                {signaturesCount > 0 && (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <label className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>แสดงตราประทับรับรองดิจิทัล</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={draft.digitalSignatures?.[0]?.showStampBadge ?? true}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setDraft((p) => ({
                            ...p,
                            digitalSignatures: (p.digitalSignatures || []).map((s) => ({ ...s, showStampBadge: val })),
                          }));
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      * แสดงแถบรับรอง E-Signature พร้อมรหัสตรวจสอบ ID และเวลาที่ลงนาม เพื่อความถูกต้องตามมาตรฐาน พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Logo & Images */}
            {activeTabPanel === 'logo' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                      ตราปัจจุบัน: {draft.logoType === 'custom_image' ? 'ภาพที่คุณอัปโหลด' : draft.logoType === 'ministry' ? 'ตรากระทรวง' : draft.logoType === 'circle_seal' ? 'ตราองค์กร' : draft.showGaruda ? 'ตราครุฑทางการ' : 'ไม่แสดง'}
                    </p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      ขนาด: {logoSizePx}px • ตำแหน่ง: {draft.garudaPosition === 'left' ? 'ชิดซ้าย' : draft.garudaPosition === 'center' ? 'กึ่งกลาง' : 'ชิดขวา'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogoModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs"
                  >
                    ปรับแต่ง
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    รูปภาพประกอบในเอกสาร ({draft.attachedImages?.length || 0} รูป)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImageAttachModal(true)}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>แทรกรูปภาพจากเครื่องคอมพิวเตอร์</span>
                  </button>

                  {draft.attachedImages?.map((img) => (
                    <div
                      key={img.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5"
                    >
                      <img src={img.url} alt={img.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{img.name}</p>
                        <p className="text-[10px] text-slate-400">กว้าง {img.width}% • {img.position}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((p) => ({
                            ...p,
                            attachedImages: (p.attachedImages || []).filter((i) => i.id !== img.id),
                          }));
                          onShowToast('ลบรูปภาพแนบเรียบร้อย', 'info');
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Paper & Margins */}
            {activeTabPanel === 'paper' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">{paperDim.label}</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    {paperDim.widthMm} × {paperDim.heightMm} มม. (ขอบซ้าย {paperMargin.leftCm} ซม., บน {paperMargin.topCm} ซม.)
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPaperModal(true)}
                    className="mt-2 w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs text-center block"
                  >
                    ตั้งค่าขนาดกระดาษ & ขอบละเอียด
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    ขนาดมาตรฐาน:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['a4', 'legal', 'letter', 'a5'].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setDraft((p) => ({ ...p, paperSize: fmt as any }));
                          onShowToast(`เปลี่ยนขนาดเป็น ${fmt.toUpperCase()}`, 'info');
                        }}
                        className={`p-2 rounded-xl border text-center font-medium ${
                          draft.paperSize === fmt
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation Quick Toggle */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    ทิศทาง:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, paperOrientation: 'portrait' }))}
                      className={`p-2 rounded-xl border text-center font-medium ${
                        draft.paperOrientation === 'portrait'
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      แนวตั้ง
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, paperOrientation: 'landscape' }))}
                      className={`p-2 rounded-xl border text-center font-medium ${
                        draft.paperOrientation === 'landscape'
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      แนวนอน
                    </button>
                  </div>
                </div>

                {/* Visual Guides Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">แสดงไม้บรรทัดมาตราส่วน (Ruler):</span>
                    <input
                      type="checkbox"
                      checked={draft.showPageRuler}
                      onChange={(e) => setDraft((p) => ({ ...p, showPageRuler: e.target.checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">แสดงเส้นประขอบพิมพ์:</span>
                    <input
                      type="checkbox"
                      checked={draft.showPageBorders}
                      onChange={(e) => setDraft((p) => ({ ...p, showPageBorders: e.target.checked }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Repository Search & Pull */}
            {activeTabPanel === 'docs' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="ค้นหาเอกสารในคลัง..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  {filteredRepoDocs.slice(0, 15).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        {doc.name}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                        <span>{doc.category} • {doc.fileType}</span>
                        <button
                          type="button"
                          onClick={() => handleLoadDocFromRepository(doc)}
                          className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1"
                        >
                          <span>ดึงมาแก้ไข</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Templates */}
            {activeTabPanel === 'templates' && (
              <div className="space-y-2.5">
                {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTemplate(key)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all ${
                      activeTemplate === key
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">{tmpl.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tmpl.subject}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Tokens */}
            {activeTabPanel === 'tokens' && (
              <div className="space-y-3">
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {['all', 'header', 'meta', 'body', 'signature'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTokenCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap ${
                        selectedTokenCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat === 'all' ? 'ทั้งหมด' : cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {filteredTokens.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleInsertToken(t)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{t.label}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{t.value}</p>
                      </div>
                      <Plus className="w-4 h-4 text-indigo-500 group-hover:scale-125 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Canvas (8 Cols on large) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-100 dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto min-h-[85vh]">
          {/* Paper Canvas Scaler Container */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="relative select-text"
          >
            {/* Top Ruler (if enabled) */}
            {draft.showPageRuler && (
              <div
                style={{ width: `${paperDim.widthPx}px` }}
                className="h-6 bg-amber-100 dark:bg-amber-950/70 border-b border-amber-300 dark:border-amber-800 flex items-end text-[9px] font-mono text-amber-800 dark:text-amber-200 px-2 justify-between mb-1 rounded-t-md select-none"
              >
                <span>0 cm</span>
                <span>5 cm</span>
                <span>10 cm</span>
                <span>15 cm</span>
                <span>20 cm</span>
                <span>{paperDim.widthMm / 10} cm</span>
              </div>
            )}

            {/* Paper Sheet */}
            <div
              id="printable-saraban-sheet"
              style={{
                width: `${paperDim.widthPx}px`,
                minHeight: `${paperDim.heightPx}px`,
                paddingTop: `${paperMargin.topPx}px`,
                paddingBottom: `${paperMargin.bottomPx}px`,
                paddingLeft: `${paperMargin.leftPx}px`,
                paddingRight: `${paperMargin.rightPx}px`,
                fontFamily: "'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', 'Cordia New', sans-serif",
                color: '#000000',
                backgroundColor: '#ffffff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              }}
              className={`relative text-[16pt] leading-[1.3] text-black ${
                draft.showPageBorders ? 'outline-1 outline-dashed outline-indigo-300/80' : ''
              }`}
            >
              {/* Logo / Garuda Header Block (Clickable!) */}
              {draft.showGaruda && draft.logoType !== 'none' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      draft.garudaPosition === 'center'
                        ? 'center'
                        : draft.garudaPosition === 'right'
                        ? 'flex-end'
                        : 'flex-start',
                    marginBottom: '10pt',
                  }}
                  className="group relative cursor-pointer"
                  onClick={() => setShowLogoModal(true)}
                  title="คลิกเพื่อปรับแต่งตราสัญลักษณ์ หรืออัปโหลดภาพโลโก้ของคุณ"
                >
                  <div className="relative inline-block">
                    <img
                      src={logoImgSrc}
                      alt="ตราสัญลักษณ์"
                      style={{
                        width: `${logoSizePx}px`,
                        height: `${logoSizePx}px`,
                        objectFit: 'contain',
                      }}
                      className="transition-transform group-hover:scale-105"
                    />
                    <span className="opacity-0 group-hover:opacity-100 absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-sm transition-opacity font-sans pointer-events-none">
                      คลิกเพื่อเปลี่ยนตรา/โลโก้
                    </span>
                  </div>
                </div>
              )}

              {/* Main Title */}
              <div className="text-center font-bold text-[28pt] leading-tight mb-3 tracking-tight font-sarabun">
                {draft.docTypeTitle || 'บันทึกข้อความ'}
              </div>

              {/* Header Info Block */}
              <div className="space-y-1.5 mb-4 text-[16pt]">
                <div className="flex items-baseline">
                  <span className="font-bold shrink-0 mr-2">ส่วนราชการ:</span>
                  <span className="flex-1 border-b border-dotted border-transparent hover:border-slate-300">
                    {draft.department} {draft.departmentSub ? `(${draft.departmentSub})` : ''} {draft.phone ? `โทร. ${draft.phone}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-baseline">
                    <span className="font-bold shrink-0 mr-2">ที่:</span>
                    <span className="flex-1">{draft.docNumber}</span>
                  </div>
                  <div className="flex items-baseline justify-end">
                    <span className="font-bold shrink-0 mr-2">วันที่:</span>
                    <span>{draft.date}</span>
                  </div>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold shrink-0 mr-2">เรื่อง:</span>
                  <span className="flex-1 font-bold">{draft.subject}</span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold shrink-0 mr-2">เรียน:</span>
                  <span className="flex-1">{draft.to}</span>
                </div>

                {draft.hasReference && draft.reference && (
                  <div className="flex items-baseline">
                    <span className="font-bold shrink-0 mr-2">อ้างถึง:</span>
                    <span className="flex-1">{draft.reference}</span>
                  </div>
                )}

                {draft.hasAttachments && draft.attachments && (
                  <div className="flex items-start">
                    <span className="font-bold shrink-0 mr-2">สิ่งที่ส่งมาด้วย:</span>
                    <span className="flex-1 whitespace-pre-line">{draft.attachments}</span>
                  </div>
                )}
              </div>

              {/* Divider Line */}
              <div className="border-b border-slate-300 my-3" />

              {/* Document Body Paragraphs */}
              <div className="mt-4 space-y-4 text-justify" style={{ textJustify: 'inter-cluster' }}>
                {draft.content.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} className="indent-[2.5cm] leading-[1.35] whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>

              {/* Attached Inline Images */}
              {draft.attachedImages && draft.attachedImages.length > 0 && (
                <div className="my-6 space-y-4">
                  {draft.attachedImages.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems:
                          img.position === 'center'
                            ? 'center'
                            : img.position === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                      }}
                      className="my-3"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        style={{ width: `${img.width || 75}%`, maxHeight: '350px', objectFit: 'contain' }}
                        className="rounded border border-slate-300 p-1 bg-white"
                      />
                      {img.caption && (
                        <span className="text-[13pt] text-slate-700 mt-1 font-sans">
                          {img.caption}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Closing Phrase */}
              <div className="indent-[2.5cm] mt-6 mb-8 text-[16pt]">
                {draft.closingPhrase || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ'}
              </div>

              {/* Digital Signature Block on Paper Canvas (รองรับ 1 ท่าน และ สัญญาหลายฝ่าย) */}
              {draft.digitalSignatures && draft.digitalSignatures.length > 0 ? (
                draft.digitalSignatures.length === 1 ? (
                  /* Single Signer */
                  <div
                    onClick={() => setShowSignatureModal(true)}
                    className="ml-[45%] w-[55%] text-center space-y-1 mt-6 mb-6 cursor-pointer group hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 p-2.5 rounded-2xl border border-dashed border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all select-none"
                    title="คลิกเพื่อจัดการหรือเซ็นสัญญาดิจิทัล"
                  >
                    {draft.digitalSignatures[0].signatureDataUrl ? (
                      <div className="flex justify-center mb-1">
                        <img
                          src={draft.digitalSignatures[0].signatureDataUrl}
                          alt="ลายเซ็นดิจิทัล"
                          style={{ maxHeight: '60px', maxWidth: '220px', objectFit: 'contain' }}
                          className="mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-slate-400 text-xs font-sans">
                        [ลงนามดิจิทัล]
                      </div>
                    )}
                    <div>(ลงชื่อ)....................................................</div>
                    <div className="font-bold mt-1 text-[16pt]">
                      {draft.digitalSignatures[0].signerName || draft.signName}
                    </div>
                    <div className="text-[15pt]">
                      {draft.digitalSignatures[0].signerPosition || draft.signPosition}
                    </div>
                    {draft.hasActingPosition && draft.signActing && (
                      <div className="text-[14pt] text-slate-600">{draft.signActing}</div>
                    )}

                    {/* Certified Digital Stamp Badge */}
                    {draft.digitalSignatures[0].showStampBadge && (
                      <div className="mt-2.5 mx-auto max-w-[290px] p-2 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-800 text-[10pt] font-sans flex items-center justify-center gap-2 shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="text-left leading-tight">
                          <div className="font-bold flex items-center gap-1">
                            <span>ลงนามอิเล็กทรอนิกส์</span>
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-200 text-emerald-900 rounded font-mono font-normal">CERTIFIED</span>
                          </div>
                          <div className="text-[8.5pt] text-emerald-700 font-mono">
                            ID: {draft.digitalSignatures[0].certificateId}
                          </div>
                          <div className="text-[8pt] text-emerald-600">
                            {draft.digitalSignatures[0].signedAtThai}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Multi-Party Contract Signers (สัญญาหลายฝ่าย / พยาน) */
                  <div
                    onClick={() => setShowSignatureModal(true)}
                    className="mt-8 mb-6 cursor-pointer group hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 p-3 rounded-2xl border border-dashed border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-4 select-none"
                    title="คลิกเพื่อจัดการหรือเซ็นสัญญาดิจิทัล"
                  >
                    <div className="grid grid-cols-2 gap-6 text-center">
                      {draft.digitalSignatures.map((sig) => (
                        <div key={sig.id} className="space-y-1 p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                          {sig.signatureDataUrl ? (
                            <div className="flex justify-center mb-1">
                              <img
                                src={sig.signatureDataUrl}
                                alt="ลายเซ็น"
                                style={{ maxHeight: '55px', maxWidth: '180px', objectFit: 'contain' }}
                                className="mix-blend-multiply dark:mix-blend-normal"
                              />
                            </div>
                          ) : (
                            <div className="h-10 flex items-center justify-center text-slate-400 text-xs font-sans">
                              [ลงนามอิเล็กทรอนิกส์]
                            </div>
                          )}
                          <div>(ลงชื่อ)....................................................</div>
                          <div className="font-bold text-[15pt]">{sig.signerName}</div>
                          <div className="text-[13pt] text-slate-700">{sig.signerPosition}</div>
                          <div className="text-[11pt] text-slate-500 font-sans">[ {sig.roleLabel} ]</div>
                          {sig.showStampBadge && (
                            <div className="text-[9pt] font-mono text-emerald-700 mt-1 flex items-center justify-center gap-1 font-sans">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{sig.certificateId}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Overall Certificate Status Bar */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-800 text-[11pt] font-sans flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="leading-tight text-left">
                        <div className="font-bold">
                          เอกสารนี้ผ่านการลงนามอิเล็กทรอนิกส์สมบูรณ์ ({draft.digitalSignatures.length} ลายเซ็น)
                        </div>
                        <div className="text-[9.5pt] text-emerald-700 font-mono">
                          มีผลสมบูรณ์ตาม พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์ • รหัสอ้างอิง: {draft.digitalSignatures[0]?.certificateId}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Default Single Signature (Unsigned, click to sign) */
                <div
                  onClick={() => setShowSignatureModal(true)}
                  className="ml-[50%] text-center space-y-1 mt-8 mb-6 cursor-pointer group hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 p-2.5 rounded-2xl border border-dashed border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all select-none"
                  title="คลิกเพื่อลงนาม / เซ็นสัญญาดิจิทัล"
                >
                  <div className="h-10 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 text-xs font-sans transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                      <PenTool className="w-3.5 h-3.5" /> คลิกเพื่อเซ็นสัญญาดิจิทัล
                    </span>
                  </div>
                  <div>(ลงชื่อ)....................................................</div>
                  <div className="font-bold mt-1">{draft.signName}</div>
                  <div>{draft.signPosition}</div>
                  {draft.hasActingPosition && draft.signActing && (
                    <div className="text-[14pt] text-slate-600">{draft.signActing}</div>
                  )}
                </div>
              )}

              {/* Optional Routing Slip */}
              {draft.hasRoutingSlip && (
                <div className="border-t-2 border-slate-900 mt-8 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-[14pt]">
                    <div className="border-r border-dashed border-slate-400 pr-4 space-y-2">
                      <span className="font-bold">คำสั่ง / การเกษียณหนังสือ:</span>
                      <p className="whitespace-pre-line">{draft.routingComment || 'อนุมัติตามเสนอ ดำเนินการต่อไป'}</p>
                      <div className="text-center pt-4">
                        <div>(ลงชื่อ)....................................................</div>
                        <div className="font-semibold">{draft.routingSignName || draft.signName}</div>
                        <div>วันที่ {draft.routingDate || draft.date}</div>
                      </div>
                    </div>
                    <div className="pl-4 space-y-2">
                      <span className="font-bold">บันทึกความเห็นเพิ่มเติม:</span>
                      <p className="text-slate-400">...........................................................................</p>
                      <p className="text-slate-400">...........................................................................</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Toggle Button Under Sheet */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-2">
            <button
              type="button"
              onClick={() => setShowBottomText(!showBottomText)}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>{showBottomText ? 'ซ่อนกล่องข้อความด้านล่าง' : 'แสดงข้อความด้านล่าง (ฉบับเต็ม / คัดลอก)'}</span>
              {showBottomText ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>

          {/* Bottom Full Text Panel */}
          {showBottomText && (
            <div className="w-full max-w-4xl mt-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4 select-text">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      ข้อความเอกสารฉบับเต็ม (Plain Document Text)
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{draft.content ? draft.content.split(/\s+/).filter(Boolean).length : 0} คำ</span>
                      <span>•</span>
                      <span>{draft.content ? draft.content.length : 0} ตัวอักษร</span>
                      <span>•</span>
                      <span>{draft.content ? draft.content.split('\n\n').filter(Boolean).length : 0} ย่อหน้า</span>
                    </div>
                  </div>
                </div>

                {/* Mode & Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setBottomTextMode('formatted')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        bottomTextMode === 'formatted'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      จัดรูปแบบอ่านง่าย
                    </button>
                    <button
                      type="button"
                      onClick={() => setBottomTextMode('raw')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        bottomTextMode === 'raw'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      กล่องข้อความดิบ
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAllText}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="คัดลอกข้อความทั้งหมด"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    <span>คัดลอกทั้งหมด</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="ดาวน์โหลดเป็นไฟล์ข้อความ (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ดาวน์โหลด .txt</span>
                  </button>
                </div>
              </div>

              {/* Content View according to mode */}
              {bottomTextMode === 'formatted' ? (
                <div className="space-y-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="text-center font-bold text-base sm:text-lg text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800 font-sarabun">
                    {draft.docTypeTitle || 'บันทึกข้อความ'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">ส่วนราชการ:</span>{' '}
                      {draft.department} {draft.departmentSub ? `(${draft.departmentSub})` : ''} {draft.phone ? `โทร. ${draft.phone}` : ''}
                    </div>
                    <div className="sm:text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">ที่:</span> {draft.docNumber}{' '}
                      <span className="font-semibold text-slate-900 dark:text-white ml-2">วันที่:</span> {draft.date}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">เรื่อง:</span> {draft.subject}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">เรียน:</span> {draft.to}
                    </div>
                    {draft.hasReference && draft.reference && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-slate-900 dark:text-white">อ้างถึง:</span> {draft.reference}
                      </div>
                    )}
                    {draft.hasAttachments && draft.attachments && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-slate-900 dark:text-white">สิ่งที่ส่งมาด้วย:</span> {draft.attachments}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs block">เนื้อหาเอกสาร:</span>
                    {draft.content.split('\n\n').map((para, idx) => (
                      <p key={idx} className="indent-6 text-justify text-slate-800 dark:text-slate-200">
                        {para}
                      </p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">คำลงท้าย:</span> {draft.closingPhrase}
                      </div>
                      {signaturesCount > 0 && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ลงนามอิเล็กทรอนิกส์แล้ว ({signaturesCount} ลายเซ็น)</span>
                        </div>
                      )}
                    </div>

                    {signaturesCount > 0 ? (
                      <div className="space-y-1 pt-1">
                        {draft.digitalSignatures?.map((sig, sIdx) => (
                          <div key={sig.id} className="flex items-center justify-between text-[11px] bg-slate-100/70 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-xl">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{sIdx + 1}. (ลงชื่อ) {sig.signerName}</span>
                              <span className="text-slate-500 ml-1">({sig.signerPosition})</span>
                              <span className="text-indigo-600 dark:text-indigo-400 ml-1">[{sig.roleLabel}]</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">ID: {sig.certificateId}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">ผู้ลงนาม:</span> (ลงชื่อ) {draft.signName} ({draft.signPosition})
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={12}
                    value={generateFullPlainText(draft)}
                    readOnly
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                  />
                  <span className="text-[11px] text-slate-400 block text-right">
                    * กดปุ่ม "คัดลอกทั้งหมด" หรือคลิกเลือกข้อความในกล่องเพื่อนำไปใช้งานได้ทันที
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Zoom Controls Bar (ปุ่มลอย ปรับขนาด ซูม ลดลง ขยาย พอดีขอบ เห็นทั้งกระดาษ) */}
      <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 transition-all hover:shadow-2xl">
        {/* Zoom Out Button (ลดลง) */}
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(30, z - 10))}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="ซูมลดลง (-10%)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom Level & Open Dialog Button (เลือกขนาดซูม) */}
        <button
          type="button"
          onClick={() => setShowZoomDialog(true)}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-900/70 text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-2xs"
          title="คลิกเพื่อเปิดกล่องเลือกขนาดซูม (Zoom Dialog)"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
          <span>{zoomLevel}%</span>
        </button>

        {/* Zoom In Button (ขยาย) */}
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="ซูมขยาย (+10%)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Fit Whole Page (เห็นทั้งกระดาษ) */}
        <button
          type="button"
          onClick={setFitWholePage}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 transition-colors"
          title="ปรับมุมมองให้เห็นทั้งหน้ากระดาษ A4"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">เห็นทั้งกระดาษ</span>
        </button>

        {/* Fit Width (พอดีขอบ / พอดีกว้าง) */}
        <button
          type="button"
          onClick={setFitWidth}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition-colors"
          title="ปรับความกว้างพอดีหน้าจอ"
        >
          <span>พอดีขอบ</span>
        </button>

        {/* Real 100% Size (100% จริง) */}
        <button
          type="button"
          onClick={setRealSize100}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition-colors"
          title="ปรับเป็นขนาดพิมพ์จริง 100%"
        >
          <span>100% จริง</span>
        </button>
      </div>

      {/* Modals */}
      <LogoCustomizerModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        draft={draft}
        onUpdateDraft={setDraft}
        onShowToast={onShowToast}
      />

      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onApplyDraft={(newDraft) => setDraft(newDraft)}
        onShowToast={onShowToast}
      />

      <ImageAttachmentModal
        isOpen={showImageAttachModal}
        onClose={() => setShowImageAttachModal(false)}
        attachedImages={draft.attachedImages || []}
        onUpdateDraft={setDraft}
        onShowToast={onShowToast}
      />

      <PaperSettingsModal
        isOpen={showPaperModal}
        onClose={() => setShowPaperModal(false)}
        draft={draft}
        onUpdateDraft={setDraft}
        onShowToast={onShowToast}
      />

      <DigitalSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        draft={draft}
        onUpdateDraft={setDraft}
        onShowToast={onShowToast}
      />

      <ExportWordModal
        isOpen={showExportWordModal}
        onClose={() => setShowExportWordModal(false)}
        draft={draft}
        onShowToast={onShowToast}
      />

      {/* Zoom Dialog Modal (กล่องเลือกขนาดซูมแบบ Dialog) */}
      {showZoomDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    ปรับขนาดซูมและการแสดงผลกระดาษ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    เลือกขนาดซูมที่ต้องการ หรือเลื่อนสไลเดอร์เพื่อปรับละเอียด
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowZoomDialog(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ขนาดมุมมองมาตรฐาน:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFitWholePage();
                    setShowZoomDialog(false);
                  }}
                  className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Maximize2 className="w-4 h-4 text-indigo-600" />
                  <span>เห็นทั้งกระดาษ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFitWidth();
                    setShowZoomDialog(false);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>พอดีขอบกว้าง</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRealSize100();
                    setShowZoomDialog(false);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>100% ขนาดจริง</span>
                </button>
              </div>
            </div>

            {/* Percentage Scale Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                เลือกระดับมาตราส่วน (%):
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[35, 50, 65, 75, 85, 100, 125, 150].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setZoomLevel(val);
                      onShowToast(`ปรับขนาดซูมเป็น ${val}%`, 'info');
                      setShowZoomDialog(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                      zoomLevel === val
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">ปรับความละเอียด:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {zoomLevel}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(30, z - 5))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="ลดซูม"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="30"
                  max="160"
                  step="5"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(160, z + 5))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="เพิ่มซูม"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Paper Info Footer */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>ขนาดกระดาษ:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{paperDim.label} ({paperDim.widthMm} × {paperDim.heightMm} มม.)</span>
              </div>
              <div className="flex justify-between">
                <span>ทิศทาง:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{draft.paperOrientation === 'landscape' ? 'แนวนอน (Landscape)' : 'แนวตั้ง (Portrait)'}</span>
              </div>
              <div className="flex justify-between">
                <span>ระยะขอบพิมพ์:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">ซ้าย {paperMargin.leftCm} ซม. / ขวา {paperMargin.rightCm} ซม. / บน {paperMargin.topCm} ซม. / ล่าง {paperMargin.bottomCm} ซม.</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowZoomDialog(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-xs"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>AI ช่วยร่างหนังสือราชการ / เอกสารองค์กร</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              ระบุหัวข้อ วัตถุประสงค์ หรือใจความสำคัญที่ต้องการให้ AI ช่วยร่างตามระเบียบงานสารบรรณ
            </p>

            <textarea
              rows={4}
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="เช่น ขออนุมัติจัดซื้อคอมพิวเตอร์แม่ข่าย 5 เครื่อง วงเงิน 200,000 บาท เพื่อรองรับระบบคลังเอกสารดิจิทัล..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs text-slate-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isGeneratingAI || !aiTopic.trim()}
                onClick={handleGenerateAiDraft}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingAI ? 'กำลังประมวลผล...' : 'เริ่มร่างข้อความ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
