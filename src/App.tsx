import React, { useState, useEffect, useCallback } from 'react';
import { 
  DocumentItem, 
  CategoryInfo, 
  ActiveTab, 
  DocViewerState 
} from './types';
import { INITIAL_DOCUMENTS } from './data/mockData';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { DirectoryView } from './components/DirectoryView';
import { DraftSimulator } from './components/DraftSimulator';
import { DocViewerTab } from './components/DocViewerTab';
import { DocViewerModal } from './components/DocViewerModal';
import { CategoryDrawer } from './components/CategoryDrawer';
import { FavoritesModal } from './components/FavoritesModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('corporate_theme_v3') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('corporate_theme_v3', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('corporate_theme_v3', 'light');
    }
  }, [isDarkMode]);

  // Main Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');

  // Document & Category State
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('corporate_favorites_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('corporate_favorites_v3', JSON.stringify(favorites));
  }, [favorites]);

  // Modals & Drawers
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState<boolean>(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState<boolean>(false);
  const [viewerModalState, setViewerModalState] = useState<DocViewerState>({
    isOpen: false,
    document: null,
    mode: 'doc',
  });

  // Selected document for the dedicated DocViewerTab
  const [selectedDocForViewerTab, setSelectedDocForViewerTab] = useState<DocumentItem | null>(null);

  // Draft Simulator reference document injection
  const [draftInitialDocRef, setDraftInitialDocRef] = useState<DocumentItem | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Documents from server API or Google Sheets directly
  const fetchDocuments = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents${force ? '?force=true' : ''}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      if (data.success && Array.isArray(data.documents) && data.documents.length > 0) {
        setDocuments(data.documents);
        setCategories(data.categories || []);
        if (force) showToast('อัปเดตข้อมูลเอกสารเรียบร้อยแล้ว', 'success');
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.warn('Using local fallback document store due to fetch issue:', err);
      // Generate categories from existing documents
      const catMap: Record<string, number> = {};
      documents.forEach((d) => {
        catMap[d.category] = (catMap[d.category] || 0) + 1;
      });
      setCategories(Object.entries(catMap).map(([name, count]) => ({ name, count })));
      if (force) showToast('เชื่อมต่อฐานข้อมูลล้มเหลว กำลังใช้ข้อมูลสำรอง', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [documents, showToast]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Favorite toggle
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('นำออกจากรายการโปรดแล้ว', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('บันทึกในรายการโปรดเรียบร้อย', 'success');
        return [...prev, id];
      }
    });
  };

  // Copy Link with Clipboard fallback
  const handleCopyLink = (url: string) => {
    if (!url || url === '#') {
      showToast('ไม่มีลิงก์เอกสาร', 'error');
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('คัดลอกลิงก์เอกสารเรียบร้อยแล้ว', 'success');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('คัดลอกลิงก์เอกสารเรียบร้อยแล้ว', 'success');
      } catch (err) {
        showToast('ไม่สามารถคัดลอกลิงก์ได้', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  // Preview Doc in modal
  const handlePreviewDoc = (doc: DocumentItem) => {
    setViewerModalState({
      isOpen: true,
      document: doc,
      mode: 'doc',
    });
    setSelectedDocForViewerTab(doc);
  };

  // Insert Document to Draft Simulator
  const handleInsertToDraft = (doc: DocumentItem) => {
    setDraftInitialDocRef(doc);
    setActiveTab('draft');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onRefreshData={() => fetchDocuments(true)}
        isLoading={isLoading}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesModalOpen(true)}
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
      />

      {/* Navigation (Desktop Sub-header + Mobile Bottom Nav) */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        favoritesCount={favorites.length}
        totalDocumentsCount={documents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-24 md:pb-12">
        {activeTab === 'directory' && (
          <DirectoryView
            documents={documents}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onCopyLink={handleCopyLink}
            onPreviewDoc={handlePreviewDoc}
            onInsertToDraft={handleInsertToDraft}
            isLoading={isLoading}
            onRetry={() => fetchDocuments(true)}
          />
        )}

        {activeTab === 'draft' && (
          <DraftSimulator
            documents={documents}
            onShowToast={showToast}
            initialDocRef={draftInitialDocRef}
            onClearInitialDocRef={() => setDraftInitialDocRef(null)}
          />
        )}

        {activeTab === 'viewer' && (
          <DocViewerTab
            documents={documents}
            selectedDoc={selectedDocForViewerTab}
            onSelectDoc={setSelectedDocForViewerTab}
            onCopyLink={handleCopyLink}
            onInsertToDraft={handleInsertToDraft}
          />
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">รายการเอกสารโปรด ({favorites.length})</h2>
                <p className="text-xs text-slate-500">เอกสารที่คุณบุ๊กมาร์กไว้ทั้งหมด</p>
              </div>
            </div>

            <DirectoryView
              documents={documents.filter((d) => favorites.includes(d.id))}
              categories={categories}
              activeCategory="All"
              onSelectCategory={() => {}}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onCopyLink={handleCopyLink}
              onPreviewDoc={handlePreviewDoc}
              onInsertToDraft={handleInsertToDraft}
              isLoading={isLoading}
              onRetry={() => fetchDocuments(true)}
            />
          </div>
        )}
      </main>

      {/* Category Offcanvas Drawer */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setActiveTab('directory');
        }}
        totalCount={documents.length}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favorites={favorites}
        documents={documents}
        onToggleFavorite={handleToggleFavorite}
        onCopyLink={handleCopyLink}
        onPreviewDoc={handlePreviewDoc}
        onInsertToDraft={handleInsertToDraft}
      />

      {/* Doc & PDF Inspector / Preview Modal */}
      <DocViewerModal
        isOpen={viewerModalState.isOpen}
        document={viewerModalState.document}
        onClose={() => setViewerModalState({ isOpen: false, document: null, mode: 'doc' })}
        onCopyLink={handleCopyLink}
        onInsertToDraft={handleInsertToDraft}
        onShowToast={showToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
