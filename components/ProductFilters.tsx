import React from 'react';

interface ProductFiltersProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  showInStockOnly: boolean;
  setShowInStockOnly: (show: boolean) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  sortOption,
  setSortOption,
  showInStockOnly,
  setShowInStockOnly,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-base-200/50 dark:bg-slate-800/50 rounded-xl border border-base-300/50 dark:border-slate-700/50">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <label htmlFor="sort" className="text-sm font-medium text-text-secondary dark:text-slate-400">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-base-100 dark:bg-slate-700 border-base-300 dark:border-slate-600 rounded-md shadow-sm focus:border-brand-primary focus:ring-brand-primary text-sm p-2 text-text-primary dark:text-slate-50"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>
      <div className="flex items-center w-full md:w-auto">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-secondary dark:text-slate-400">
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-base-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary bg-base-100 dark:bg-slate-700"
          />
          Show in-stock only
        </label>
      </div>
    </div>
  );
};