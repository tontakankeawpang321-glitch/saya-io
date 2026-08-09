import React from 'react';
import { 
  X, 
  FileText, 
  Maximize2, 
  RotateCw, 
  Ruler, 
  Sliders, 
  Check, 
  Grid,
  Columns,
  Layers
} from 'lucide-react';
import { DraftDocument } from '../types';
import { getPaperDimensions, getPaperMargins } from '../utils/draftHelpers';

interface PaperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: DraftDocument;
  onUpdateDraft: (updater: (prev: DraftDocument) => DraftDocument) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PaperSettingsModal: React.FC<PaperSettingsModalProps> = ({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const currentDim = getPaperDimensions(
    draft.paperSize || 'a4',
    draft.paperOrientation || 'portrait',
    draft.customWidthMm,
    draft.customHeightMm
  );

  const currentMargins = getPaperMargins(
    draft.paperMargin || 'standard_thai',
    draft.customMarginTopCm,
    draft.customMarginBottomCm,
    draft.customMarginLeftCm,
    draft.customMarginRightCm
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                ตั้งค่าขนาดกระดาษ & ระยะขอบเสมือนจริง
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                จำลองสัดส่วนกระดาษจริง A4, Legal, Letter, A5 พร้อมระยะขอบสารบรรณ
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
          {/* Current Paper Dimension Badge */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Ruler className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  {currentDim.label}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  ขนาดจำลอง: {currentDim.widthMm} × {currentDim.heightMm} มม. ({currentDim.widthPx} × {currentDim.heightPx} px)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-semibold">
              {draft.paperOrientation === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'}
            </span>
          </div>

          {/* Paper Size Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              1. เลือกขนาดกระดาษ (Paper Format)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'a4', name: 'A4 มาตรฐาน', desc: '210 × 297 มม. (ราชการ)' },
                { id: 'legal', name: 'Legal (ยาว)', desc: '216 × 356 มม.' },
                { id: 'letter', name: 'Letter (สหรัฐฯ)', desc: '215.9 × 279.4 มม.' },
                { id: 'a5', name: 'A5 (กึ่ง A4)', desc: '148 × 210 มม.' },
                { id: 'a3', name: 'A3 (สองเท่า A4)', desc: '297 × 420 มม.' },
                { id: 'custom', name: 'กำหนดเอง', desc: 'ระบุขนาด มม. อิสระ' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    onUpdateDraft((prev) => ({ ...prev, paperSize: fmt.id as any }));
                    onShowToast(`เปลี่ยนขนาดกระดาษเป็น ${fmt.name}`, 'info');
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    draft.paperSize === fmt.id
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{fmt.name}</span>
                    {draft.paperSize === fmt.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] text-slate-400">{fmt.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Dimension Inputs */}
            {draft.paperSize === 'custom' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 animate-in fade-in">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    ความกว้าง (มม.):
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={draft.customWidthMm || 210}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateDraft((prev) => ({ ...prev, customWidthMm: val }));
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    ความสูง (มม.):
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={draft.customHeightMm || 297}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateDraft((prev) => ({ ...prev, customHeightMm: val }));
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              2. ทิศทางการวางกระดาษ (Orientation)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, paperOrientation: 'portrait' }));
                }}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-medium transition-colors ${
                  draft.paperOrientation === 'portrait'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="w-4 h-6 border-2 border-current rounded-xs" />
                <span>แนวตั้ง (Portrait)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, paperOrientation: 'landscape' }));
                }}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-medium transition-colors ${
                  draft.paperOrientation === 'landscape'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="w-6 h-4 border-2 border-current rounded-xs" />
                <span>แนวนอน (Landscape)</span>
              </button>
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              3. ระยะขอบกระดาษ (Margins)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'standard_thai', name: 'มาตรฐานสารบรรณ', desc: 'บน 2.5 ซม. / ซ้าย 3.0 ซม.' },
                { id: 'normal', name: 'ปกติ (1 นิ้ว)', desc: '2.54 ซม. ทุกด้าน' },
                { id: 'narrow', name: 'แคบ (Narrow)', desc: '1.27 ซม. ทุกด้าน' },
                { id: 'wide', name: 'กว้าง (Wide)', desc: 'ซ้าย-ขวา 3.8 ซม.' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onUpdateDraft((prev) => ({ ...prev, paperMargin: m.id as any }));
                    onShowToast(`ตั้งระยะขอบเป็น ${m.name}`, 'info');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    draft.paperMargin === m.id
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <p className="text-xs font-semibold">{m.name}</p>
                  <p className={`text-[10px] mt-0.5 ${draft.paperMargin === m.id ? 'text-amber-100' : 'text-slate-400'}`}>
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Guides & Ruler Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              4. เครื่องช่วยแสดงผลจำลอง (Visual Tools)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showPageRuler: !prev.showPageRuler }));
                }}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors ${
                  draft.showPageRuler
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-500" />
                  <span>ไม้บรรทัดมาตราส่วนจริง (cm)</span>
                </div>
                <input
                  type="checkbox"
                  checked={draft.showPageRuler}
                  readOnly
                  className="rounded text-amber-600 focus:ring-0"
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateDraft((prev) => ({ ...prev, showPageBorders: !prev.showPageBorders }));
                }}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors ${
                  draft.showPageBorders
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-amber-500" />
                  <span>เส้นประขอบระยะพิมพ์</span>
                </div>
                <input
                  type="checkbox"
                  checked={draft.showPageBorders}
                  readOnly
                  className="rounded text-amber-600 focus:ring-0"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
          >
            เสร็จสิ้น & บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
