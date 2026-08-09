import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Sliders, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ShieldCheck, 
  Building2, 
  Stamp, 
  EyeOff,
  Sparkles
} from 'lucide-react';
import { DraftDocument } from '../types';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: DraftDocument;
  onUpdateDraft: (updater: (prev: DraftDocument) => DraftDocument) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const currentSizePx = draft.logoCustomSizePx || (
    draft.garudaSize === 'sm' ? 55 :
    draft.garudaSize === 'md' ? 75 :
    draft.garudaSize === 'lg' ? 95 :
    draft.garudaSize === 'xl' ? 120 : 75
  );

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      onShowToast('ขนาดไฟล์ภาพต้องไม่เกิน 8MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateDraft((prev) => ({
        ...prev,
        showGaruda: true,
        logoType: 'custom_image',
        logoCustomUrl: dataUrl,
        logoCustomName: file.name,
      }));
      onShowToast(`อัปโหลดโลโก้ "${file.name}" จากเครื่องสำเร็จ!`, 'success');
    };
    reader.onerror = () => {
      onShowToast('เกิดข้อผิดพลาดในการอ่านไฟล์ภาพ', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveCustomLogo = () => {
    onUpdateDraft((prev) => ({
      ...prev,
      logoType: 'garuda',
      logoCustomUrl: undefined,
      logoCustomName: undefined,
    }));
    onShowToast('รีเซ็ตเป็นตราครุฑมาตรฐานเรียบร้อย', 'info');
  };

  // Convert px to cm approximation (96 DPI -> ~37.8px = 1cm)
  const sizeInCm = (currentSizePx / 37.8).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                ปรับแต่งตราสัญลักษณ์ & อัปโหลดโลโก้
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เลือกตราทางการ หรือแทรกรูปภาพโลโก้จากเครื่องคอมพิวเตอร์ของคุณ
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Logo Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              1. เลือกประเภทตราสัญลักษณ์ / โลโก้
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Garuda */}
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showGaruda: true, logoType: 'garuda' }));
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all ${
                  draft.showGaruda && draft.logoType === 'garuda'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Garuda_Emblem_of_Thailand.svg/200px-Garuda_Emblem_of_Thailand.svg.png"
                  alt="ตราครุฑ"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xs font-medium text-center">ตราครุฑราชการ</span>
              </button>

              {/* Ministry Emblem */}
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showGaruda: true, logoType: 'ministry' }));
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all ${
                  draft.showGaruda && draft.logoType === 'ministry'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-center">ตราประจำกระทรวง</span>
              </button>

              {/* Corporate Seal */}
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showGaruda: true, logoType: 'circle_seal' }));
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all ${
                  draft.showGaruda && draft.logoType === 'circle_seal'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Stamp className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-center">ตราประทับองค์กร</span>
              </button>

              {/* Custom Image Upload */}
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showGaruda: true, logoType: 'custom_image' }));
                  if (!draft.logoCustomUrl && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all ${
                  draft.showGaruda && draft.logoType === 'custom_image'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                {draft.logoCustomUrl ? (
                  <img
                    src={draft.logoCustomUrl}
                    alt="โลโก้ที่คุณอัปโหลด"
                    className="w-10 h-10 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <span className="text-xs font-medium text-center">อัปโหลดจากเครื่อง</span>
              </button>

              {/* Hide Logo */}
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showGaruda: false, logoType: 'none' }));
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all ${
                  !draft.showGaruda || draft.logoType === 'none'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <EyeOff className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-center">ไม่แสดงตรา</span>
              </button>
            </div>
          </div>

          {/* Upload Zone for Custom Logo */}
          {draft.logoType === 'custom_image' && (
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  ไฟล์รูปภาพโลโก้ของคุณ (PNG / JPG / SVG / WebP)
                </span>
                {draft.logoCustomUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomLogo}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบรูปภาพ
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {draft.logoCustomUrl ? (
                <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <img
                    src={draft.logoCustomUrl}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {draft.logoCustomName || 'custom-logo.png'}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> ใช้งานเป็นตราสัญลักษณ์หลัก
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      เปลี่ยนรูปภาพใหม่...
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-100/50 dark:bg-indigo-900/40'
                      : 'border-indigo-300 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/70 hover:border-indigo-400'
                  }`}
                >
                  <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    รองรับรูปภาพโปร่งใส PNG, JPG, SVG หรือ WebP (สูงสุด 8MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Size Preset & Slider */}
          {draft.showGaruda && draft.logoType !== 'none' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  2. ขนาดตราสัญลักษณ์ ({sizeInCm} ซม. / {currentSizePx}px)
                </label>
              </div>

              {/* Standard Presets */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateDraft((prev) => ({ ...prev, garudaSize: 'sm', logoCustomSizePx: 55 }));
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                    currentSizePx === 55
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  เล็ก (1.5 ซม.)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateDraft((prev) => ({ ...prev, garudaSize: 'md', logoCustomSizePx: 75 }));
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                    currentSizePx === 75
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  มาตรฐาน 3 ซม.
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateDraft((prev) => ({ ...prev, garudaSize: 'lg', logoCustomSizePx: 95 }));
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                    currentSizePx === 95
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  หนังสือภายนอก 4.5 ซม.
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateDraft((prev) => ({ ...prev, garudaSize: 'xl', logoCustomSizePx: 120 }));
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                    currentSizePx === 120
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  ใหญ่ (5 ซม.)
                </button>
              </div>

              {/* Fine Slider */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min="35"
                  max="180"
                  value={currentSizePx}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateDraft((prev) => ({
                      ...prev,
                      garudaSize: 'custom',
                      logoCustomSizePx: val,
                    }));
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>35px (1.0 ซม.)</span>
                  <span>100px (2.6 ซม.)</span>
                  <span>180px (4.8 ซม.)</span>
                </div>
              </div>
            </div>
          )}

          {/* Alignment / Position */}
          {draft.showGaruda && draft.logoType !== 'none' && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. ตำแหน่งการจัดวาง
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateDraft((prev) => ({ ...prev, garudaPosition: 'left' }))}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                    draft.garudaPosition === 'left'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  ชิดซ้าย (บันทึกข้อความ)
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateDraft((prev) => ({ ...prev, garudaPosition: 'center' }))}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                    draft.garudaPosition === 'center'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                  กึ่งกลาง (หนังสือภายนอก/ประกาศ)
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateDraft((prev) => ({ ...prev, garudaPosition: 'right' }))}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                    draft.garudaPosition === 'right'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                  ชิดขวา
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
          >
            เสร็จสิ้น & บันทึกตราสัญลักษณ์
          </button>
        </div>
      </div>
    </div>
  );
};
