import React, { useState } from 'react';
import { 
  Eye, 
  Search, 
  ExternalLink, 
  Copy, 
  FileEdit, 
  Maximize2, 
  FileText, 
  FolderOpen, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocViewerTabProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  onSelectDoc: (doc: DocumentItem) => void;
  onCopyLink: (url: string) => void;
  onInsertToDraft: (doc: DocumentItem) => void;
}

export const DocViewerTab: React.FC<DocViewerTabProps> = ({
  documents,
  selectedDoc,
  onSelectDoc,
  onCopyLink,
  onInsertToDraft,
}) => {
  const [search, setSearch] = useState<string>('');
  const activeDoc = selectedDoc || documents[0] || null;

  const filtered = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl || rawUrl === '#') return '';
    if (rawUrl.includes('docs.google.com') || rawUrl.includes('drive.google.com')) {
      if (rawUrl.includes('/edit')) return rawUrl.replace('/edit', '/preview');
      if (rawUrl.includes('/view')) return rawUrl.replace('/view', '/preview');
      return rawUrl;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">ระบบส่องเอกสาร (Document & PDF Viewer)</h2>
            <p className="text-xs text-slate-500">เลือกดูเอกสารองค์กรแบบฝังในหน้าเว็บ พร้อมคัดลอกหรือดึงเข้าแบบร่างจำลองได้ทันที</p>
          </div>
        </div>
      </div>

      {/* Main Dual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Document Selector */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเอกสารเพื่อส่องดู..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((d) => {
              const isSelected = activeDoc?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDoc(d)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {d.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{d.fileType}</span>
                  </div>
                  <h4 className="text-xs font-semibold mt-1.5 line-clamp-2">{d.name}</h4>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">คลิกเพื่อส่องดู</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertToDraft(d);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <FileEdit className="w-3 h-3" />
                      ส่งเอกสารเข้าแบบร่าง
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Document Viewer Frame */}
        <div className="lg:col-span-8 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          {activeDoc ? (
            <>
              {/* Document Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {activeDoc.category}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                    {activeDoc.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Send to Draft / ส่งเอกสาร */}
                  <button
                    onClick={() => onInsertToDraft(activeDoc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-semibold shadow-xs"
                    title="ส่งเอกสารนี้เข้าแบบร่างจำลอง"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>ส่งเอกสาร / ดึงเข้าแบบร่าง</span>
                  </button>
                  <button
                    onClick={() => onCopyLink(activeDoc.url)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600"
                    title="คัดลอกลิงก์"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={activeDoc.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-black dark:hover:bg-white transition-colors shadow-xs"
                    title="เปิดไฟล์เต็ม"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Embedded Frame */}
              <div className="w-full h-[620px] rounded-2xl bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <iframe
                  src={getEmbedUrl(activeDoc.url)}
                  title={activeDoc.name}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">กรุณาเลือกเอกสารที่ต้องการส่องดูจากรายการด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
