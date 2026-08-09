import React from 'react';
import { X, Bookmark, Trash2, ExternalLink, Copy, FileEdit, FolderOpen } from 'lucide-react';
import { DocumentItem } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  documents: DocumentItem[];
  onToggleFavorite: (id: string) => void;
  onCopyLink: (url: string) => void;
  onPreviewDoc: (doc: DocumentItem) => void;
  onInsertToDraft: (doc: DocumentItem) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  documents,
  onToggleFavorite,
  onCopyLink,
  onPreviewDoc,
  onInsertToDraft,
}) => {
  if (!isOpen) return null;

  const favoriteDocs = documents.filter((d) => favorites.includes(d.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-500">
              <Bookmark className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">รายการโปรดที่บันทึกไว้</h3>
              <p className="text-xs text-slate-500">เอกสารที่คุณบุ๊กมาร์กไว้เพื่อเข้าถึงอย่างรวดเร็ว ({favoriteDocs.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {favoriteDocs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">ยังไม่มีรายการโปรด</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                กดไอคอนหัวใจที่เอกสารใดก็ได้ในหน้าหลัก เพื่อบันทึกไว้ดูในหน้านี้
              </p>
            </div>
          ) : (
            favoriteDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3 hover:border-indigo-300 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {doc.category}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-1 line-clamp-2">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        onPreviewDoc(doc);
                        onClose();
                      }}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      ส่องเอกสาร
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => {
                        onInsertToDraft(doc);
                        onClose();
                      }}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      ดึงเข้าแบบร่าง
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onCopyLink(doc.url)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="คัดลอกลิงก์"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="เปิดไฟล์"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onToggleFavorite(doc.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950"
                    title="นำออกจากรายการโปรด"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
