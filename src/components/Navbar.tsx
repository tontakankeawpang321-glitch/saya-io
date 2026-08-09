import React from 'react';
import { 
  FolderSearch, 
  FileEdit, 
  Eye, 
  BookmarkCheck, 
  Layers
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  favoritesCount: number;
  totalDocumentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount,
  totalDocumentsCount,
}) => {
  const tabs = [
    {
      id: 'directory' as ActiveTab,
      label: 'คลังเอกสาร',
      subLabel: `${totalDocumentsCount} ไฟล์`,
      icon: FolderSearch,
    },
    {
      id: 'draft' as ActiveTab,
      label: 'ร่างจำลองเอกสาร',
      subLabel: 'ลากวาง DOC/PDF',
      icon: FileEdit,
      badge: 'PRO',
    },
    {
      id: 'viewer' as ActiveTab,
      label: 'ส่องเอกสาร',
      subLabel: 'Doc/PDF Viewer',
      icon: Eye,
    },
    {
      id: 'favorites' as ActiveTab,
      label: 'รายการโปรด',
      subLabel: `${favoritesCount} รายการ`,
      icon: BookmarkCheck,
      count: favoritesCount,
    },
  ];

  return (
    <>
      {/* Desktop Main Navigation Bar (Sub-header) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-16 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                  id={`desktop-tab-${tab.id}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>

                  {tab.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                      {tab.badge}
                    </span>
                  )}

                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                      {tab.count}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (ปุ่มด้านล่างอีกหน้า รองรับมือถือเต็มรูปแบบ) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl safe-area-pb">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onChangeTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                id={`mobile-nav-${tab.id}`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <span className="text-[11px] tracking-tight leading-none truncate max-w-[72px]">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
