import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  TableProperties, 
  Eye, 
  FileEdit, 
  Copy, 
  ExternalLink, 
  Heart, 
  FileText, 
  FileSpreadsheet, 
  FileCode2, 
  Presentation, 
  CheckSquare, 
  File, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  FolderOpen,
  Filter
} from 'lucide-react';
import { DocumentItem, CategoryInfo, ViewMode, SortOption } from '../types';
import { CategoryChips } from './CategoryChips';

interface DirectoryViewProps {
  documents: DocumentItem[];
  categories: CategoryInfo[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onCopyLink: (url: string) => void;
  onPreviewDoc: (doc: DocumentItem) => void;
  onInsertToDraft: (doc: DocumentItem) => void;
  isLoading: boolean;
  onRetry: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  documents,
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  favorites,
  onToggleFavorite,
  onCopyLink,
  onPreviewDoc,
  onInsertToDraft,
  isLoading,
  onRetry,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Render matching file icon
  const renderFileIcon = (fileType: string, className = 'w-5 h-5') => {
    switch (fileType) {
      case 'Spreadsheet':
        return <FileSpreadsheet className={className} />;
      case 'PDF Document':
        return <FileText className={className} />;
      case 'Word Document':
        return <FileCode2 className={className} />;
      case 'Presentation':
        return <Presentation className={className} />;
      case 'Online Form':
        return <CheckSquare className={className} />;
      default:
        return <File className={className} />;
    }
  };

  // Filter & Sort
  const filteredDocuments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = documents.filter((doc) => {
      const matchCat = activeCategory === 'All' || doc.category === activeCategory;
      const matchQuery =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.fileType.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    if (sortOption === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    } else if (sortOption === 'za') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'th'));
    } else if (sortOption === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category, 'th'));
    } else if (sortOption === 'type') {
      result.sort((a, b) => a.fileType.localeCompare(b.fileType, 'th'));
    }

    return result;
  }, [documents, activeCategory, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Search keyword highlighter
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 rounded-xs px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mobile Search Bar */}
      <div className="md:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหาชื่อเอกสาร หรือหมวดหมู่..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none shadow-xs focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Category Chips Scroll Bar */}
      <CategoryChips
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          onSelectCategory(cat);
          setCurrentPage(1);
        }}
        totalCount={documents.length}
      />

      {/* Control Bar: Summary, Sorting & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <span>หมวดหมู่:</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
            {activeCategory === 'All' ? 'ทุกหมวดหมู่' : activeCategory}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>พบ <strong>{filteredDocuments.length}</strong> รายการ</span>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer shadow-xs"
              id="select-sort-options"
            >
              <option value="default">เรียงตามลำดับเดิม</option>
              <option value="az">ชื่อเอกสาร (ก - ฮ / A - Z)</option>
              <option value="za">ชื่อเอกสาร (ฮ - ก / Z - A)</option>
              <option value="category">จัดกลุ่มตามหมวดหมู่</option>
              <option value="type">จัดกลุ่มตามประเภทไฟล์</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="มุมมองรายการ"
              id="view-mode-list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="มุมมองการ์ด"
              id="view-mode-grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="มุมมองกะทัดรัด"
              id="view-mode-compact"
            >
              <TableProperties className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลเอกสารจากฐานข้อมูลองค์กร...</p>
        </div>
      )}

      {/* Empty / Not Found State */}
      {!isLoading && filteredDocuments.length === 0 && (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">ไม่พบเอกสารที่ค้นหา</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาเอกสารที่ต้องการ
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onSelectCategory('All');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-500/20"
          >
            <RotateCw className="w-3.5 h-3.5" />
            ล้างการค้นหาและตัวกรอง
          </button>
        </div>
      )}

      {/* Data Views */}
      {!isLoading && filteredDocuments.length > 0 && (
        <>
          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-2.5">
              {paginatedDocs.map((doc) => {
                const isFav = favorites.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800/80 shadow-xs hover:shadow-md transition-all"
                  >
                    {/* Left Icon & 2-Row Title Layout (Row 1 = Category, Row 2 = Document Name below) */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${doc.typeClass} transition-transform group-hover:scale-105 mt-0.5`}
                      >
                        {renderFileIcon(doc.fileType)}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* แถวที่ 1: รายชื่อหมวดหมู่ (Category Badge) + ประเภทไฟล์ */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                            {doc.category}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            {doc.fileType}
                          </span>
                        </div>

                        {/* แถวที่ 2: รายชื่อเอกสาร อยู่ข้างล่างรายชื่อหมวด แสดงข้อความทั้งหมดเต็มแถว */}
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug break-words">
                          {highlightText(doc.name, searchQuery)}
                        </h4>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80">
                      {/* Favorite Button */}
                      <button
                        onClick={() => onToggleFavorite(doc.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          isFav
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        title={isFav ? 'นำออกจากรายการโปรด' : 'บันทึกรายการโปรด'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>

                      {/* Preview Doc/PDF Button */}
                      <button
                        onClick={() => onPreviewDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all text-xs font-medium"
                        title="ส่องเอกสารในเว็บ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ส่องเอกสาร</span>
                      </button>

                      {/* Insert into Draft Button (ส่งเอกสารเข้าแบบร่าง) */}
                      <button
                        onClick={() => onInsertToDraft(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-medium"
                        title="ส่งชื่อและข้อมูลเอกสารนี้เข้าแบบร่างจำลอง"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>ส่งเข้าแบบร่าง</span>
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={() => onCopyLink(doc.url)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        title="คัดลอกลิงก์"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Open External Link */}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs"
                        title="เปิดในแท็บใหม่"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* GRID / CARD VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDocs.map((doc) => {
                const isFav = favorites.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 shadow-xs hover:shadow-lg transition-all"
                  >
                    <div>
                      {/* Card Header: Icon & Favorite */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${doc.typeClass} transition-transform group-hover:scale-105`}
                        >
                          {renderFileIcon(doc.fileType, 'w-6 h-6')}
                        </div>
                        <button
                          onClick={() => onToggleFavorite(doc.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            isFav
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-500'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                          title="รายการโปรด"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* แถวที่ 1: หมวดหมู่ (Category) */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50">
                          {doc.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {doc.fileType}
                        </span>
                      </div>

                      {/* แถวที่ 2: รายชื่อเอกสาร อยู่ข้างล่างรายชื่อหมวด */}
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug break-words mb-3">
                        {highlightText(doc.name, searchQuery)}
                      </h4>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-medium truncate">
                        {doc.fileType}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onPreviewDoc(doc)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="ส่องเอกสาร"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onInsertToDraft(doc)}
                          className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                          title="ส่งเอกสารเข้าแบบร่างจำลอง"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCopyLink(doc.url)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                          title="คัดลอกลิงก์"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          title="เปิดไฟล์"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* COMPACT TABLE VIEW */}
          {viewMode === 'compact' && (
            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">#</th>
                    <th className="py-3 px-4">ชื่อเอกสาร</th>
                    <th className="py-3 px-4 w-36">หมวดหมู่</th>
                    <th className="py-3 px-4 w-28">ประเภท</th>
                    <th className="py-3 px-4 w-36 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedDocs.map((doc, idx) => {
                    const isFav = favorites.includes(doc.id);
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 text-center text-slate-400">{rowNumber}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className={doc.typeClass.split(' ')[0]}>{renderFileIcon(doc.fileType, 'w-4 h-4')}</span>
                            <span className="break-words leading-snug">{highlightText(doc.name, searchQuery)}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{doc.fileType}</td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onToggleFavorite(doc.id)}
                              className={`p-1.5 rounded-lg ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                              title="รายการโปรด"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => onPreviewDoc(doc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600"
                              title="ส่องเอกสาร"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onInsertToDraft(doc)}
                              className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-700"
                              title="ดึงเข้าแบบร่าง"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600"
                              title="เปิดลิงก์"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                หน้า <strong className="text-slate-900 dark:text-white">{currentPage}</strong> จาก <strong>{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="หน้าถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
