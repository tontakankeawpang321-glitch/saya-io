import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus,
  Sliders,
  Check
} from 'lucide-react';
import { AttachedImage, DraftDocument } from '../types';

interface ImageAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedImages: AttachedImage[];
  onUpdateDraft: (updater: (prev: DraftDocument) => DraftDocument) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImageAttachmentModal: React.FC<ImageAttachmentModalProps> = ({
  isOpen,
  onClose,
  attachedImages,
  onUpdateDraft,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [captionInput, setCaptionInput] = useState<string>('');
  const [selectedWidth, setSelectedWidth] = useState<number>(75);
  const [selectedPosition, setSelectedPosition] = useState<'center' | 'left' | 'right'>('center');

  if (!isOpen) return null;

  const handleAddImage = (file: File) => {
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
      const newImg: AttachedImage = {
        id: `img-${Date.now()}`,
        name: file.name,
        url: dataUrl,
        width: selectedWidth,
        caption: captionInput.trim() || undefined,
        position: selectedPosition,
      };

      onUpdateDraft((prev) => ({
        ...prev,
        attachedImages: [...(prev.attachedImages || []), newImg],
      }));

      setCaptionInput('');
      onShowToast(`แทรกรูปภาพ "${file.name}" ลงในเนื้อหาเอกสารสำเร็จ!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (id: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      attachedImages: (prev.attachedImages || []).filter((img) => img.id !== id),
    }));
    onShowToast('ลบรูปภาพแนบเรียบร้อย', 'info');
  };

  const handleUpdateImage = (id: string, updates: Partial<AttachedImage>) => {
    onUpdateDraft((prev) => ({
      ...prev,
      attachedImages: (prev.attachedImages || []).map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                แทรกรูปภาพประกอบในเนื้อหาเอกสาร
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                แทรกภาพถ่าย แผนภูมิ ผังงาน หรือลายมือชื่อลงในหน้ากระดาษ A4
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
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleAddImage(e.target.files[0]);
              }
            }}
          />

          {/* Add New Image Form */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 block">
              แทรกรูปภาพใหม่จากเครื่อง
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                  คำบรรยายใต้ภาพ (Optional):
                </label>
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="เช่น ภาพที่ ๑ แผนผังระบบงาน"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                  ความกว้างภาพ ({selectedWidth}%):
                </label>
                <div className="flex items-center gap-2">
                  {[35, 50, 75, 100].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWidth(w)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedWidth === w
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {w}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>เลือกไฟล์รูปภาพจากเครื่องคอมพิวเตอร์</span>
            </button>
          </div>

          {/* List of Attached Images */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              รายการรูปภาพในเอกสาร ({attachedImages.length} รูป)
            </label>

            {attachedImages.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                ยังไม่มีรูปภาพแทรกในเอกสาร คลิกปุ่มด้านบนเพื่อเพิ่มรูปภาพ
              </div>
            ) : (
              <div className="space-y-3">
                {attachedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {idx + 1}. {img.name}
                        </p>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => handleUpdateImage(img.id, { caption: e.target.value })}
                          placeholder="คำบรรยายใต้ภาพ..."
                          className="w-full mt-1 px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Width & Position Controls */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">ขนาด:</span>
                        {[35, 50, 75, 100].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleUpdateImage(img.id, { width: w })}
                            className={`px-2 py-0.5 rounded-md font-medium ${
                              img.width === w
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {w}%
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateImage(img.id, { position: 'left' })}
                          className={`p-1 rounded-md ${img.position === 'left' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateImage(img.id, { position: 'center' })}
                          className={`p-1 rounded-md ${img.position === 'center' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateImage(img.id, { position: 'right' })}
                          className={`p-1 rounded-md ${img.position === 'right' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
