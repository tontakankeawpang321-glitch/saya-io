import React from 'react';
import { Layers, Folder } from 'lucide-react';
import { CategoryInfo } from '../types';

interface CategoryChipsProps {
  categories: CategoryInfo[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  totalCount,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -my-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {/* All category chip */}
        <button
          onClick={() => onSelectCategory('All')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === 'All'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-2 ring-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          id="chip-category-all"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ทั้งหมด</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === 'All'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Dynamic category chips */}
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-2 ring-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
              id={`chip-category-${encodeURIComponent(cat.name)}`}
            >
              <Folder className="w-3.5 h-3.5 opacity-70" />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
