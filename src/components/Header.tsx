import React from 'react';
import { 
  FolderOpen, 
  Search, 
  X, 
  Sun, 
  Moon, 
  RotateCw, 
  Bookmark, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onRefreshData: () => void;
  isLoading: boolean;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenCategoryDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  onRefreshData,
  isLoading,
  favoritesCount,
  onOpenFavorites,
  onOpenCategoryDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Drawer Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCategoryDrawer}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
            title="หมวดหมู่เอกสาร"
            id="btn-category-drawer"
          >
            <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Corporate Doc Hub</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">v3.0</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">คลังเอกสาร & ระบบร่างจำลอง</p>
            </div>
          </div>
        </div>

        {/* Global Search Header Bar (Visible on md+) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อเอกสาร คีย์เวิร์ด หรือหมวดหมู่..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
              id="header-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                title="ล้างข้อความ"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Refresh Data */}
          <button
            onClick={onRefreshData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all hover:scale-105 disabled:opacity-50"
            title="รีเฟรชฐานข้อมูล Google Sheets"
            id="btn-refresh-data"
          >
            <RotateCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
            title={isDarkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
            id="btn-theme-toggle"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
            title="รายการโปรด"
            id="btn-open-favorites"
          >
            <Bookmark className="w-4 h-4 text-rose-500" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
