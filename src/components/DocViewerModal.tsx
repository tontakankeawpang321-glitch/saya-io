import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  FileEdit, 
  Maximize2, 
  Minimize2, 
  Download, 
  Eye, 
  FileText, 
  FileSpreadsheet, 
  FileCode2, 
  Presentation, 
  CheckSquare, 
  File, 
  Layers, 
  Share2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocViewerModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: (url: string) => void;
  onInsertToDraft: (doc: DocumentItem) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DocViewerModal: React.FC<DocViewerModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onCopyLink,
  onInsertToDraft,
  onShowToast,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);

  if (!isOpen || !doc) return null;

  // Construct best embed url
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl || rawUrl === '#') return '';
    if (rawUrl.includes('docs.google.com') || rawUrl.includes('drive.google.com')) {
      if (rawUrl.includes('/edit')) {
        return rawUrl.replace('/edit', '/preview');
      }
      if (rawUrl.includes('/view')) {
        return rawUrl.replace('/view', '/preview');
      }
      return rawUrl;
    }
    // Universal Google Docs Viewer Embed for external PDFs / DOCs
    return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
  };

  const embedUrl = getEmbedUrl(doc.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        className={`w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-2 sm:inset-4 rounded-2xl z-50' : 'max-w-4xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${doc.typeClass}`}>
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {doc.category}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-lg mt-0.5">
                {doc.name}
              </h3>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Insert to Draft / ส่งเอกสาร */}
            <button
              onClick={() => {
                onInsertToDraft(doc);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-semibold shadow-xs"
              title="ส่งเอกสารนี้เข้าแบบร่างจำลอง"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>ส่งเอกสาร / ดึงเข้าแบบร่าง</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => onCopyLink(doc.url)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="คัดลอกลิงก์"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Open in new tab */}
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer noopener"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="เปิดในแท็บใหม่"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'ย่อขนาด' : 'ขยายเต็มหน้าจอ'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Viewer Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex flex-col">
          {embedUrl && !iframeError ? (
            <iframe
              src={embedUrl}
              title={doc.name}
              className="w-full h-full border-0"
              onError={() => setIframeError(true)}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 m-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                {doc.name}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mb-6">
                เอกสารนี้เป็นไฟล์ภายนอกหรือระบบป้องกันการฝัง iframe คุณสามารถเปิดดูโดยตรงหรือดึงชื่อเข้าสู่ระบบจำลองร่างเอกสารได้ทันที
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดดูเอกสารต้นฉบับ</span>
                </a>
                <button
                  onClick={() => {
                    onInsertToDraft(doc);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>ดึงเข้าแบบร่างจำลอง</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>ประเภท: <strong>{doc.fileType}</strong></span>
            <span>•</span>
            <span>หมวดหมู่: <strong>{doc.category}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            Corporate Document Viewer
          </div>
        </div>
      </div>
    </div>
  );
};
