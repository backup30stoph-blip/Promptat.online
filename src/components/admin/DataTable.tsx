import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, Eye } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchKeys,
  searchPlaceholder = 'Search records...',
  itemsPerPage = 10,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filtered data based on searchKeys
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        
        if (Array.isArray(value)) {
          return value.some(val => String(val).toLowerCase().includes(lowerSearch));
        }
        return String(value).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchTerm, searchKeys]);

  // Paginated data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filteredData.length);

  return (
    <div className="space-y-4">
      {/* Search Bar / Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium placeholder-slate-400 focus:border-slate-900 focus:outline-none transition-all"
          />
        </div>
        <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Found {filteredData.length} of {data.length} entries
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-slate-100 text-start rtl:text-right ltr:text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                {columns.map(col => (
                  <th key={col.key} scope="col" className={`px-4 py-3.5 ${col.className || ''}`}>
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th scope="col" className="w-28 px-4 py-3.5 text-end rtl:text-left ltr:text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading catalog assets...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} className="px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-400">No matching assets found.</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300 mt-1">Try resetting your search filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {columns.map(col => {
                      const value = (item as any)[col.key];
                      return (
                        <td key={col.key} className={`px-4 py-3.5 max-w-[200px] truncate ${col.className || ''}`}>
                          {col.render ? col.render(value, item) : <span dir="auto" className="truncate block">{String(value ?? '')}</span>}
                        </td>
                      );
                    })}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-4 py-3.5 text-end rtl:text-left ltr:text-right">
                        <div className="flex items-center justify-end rtl:justify-start gap-1">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              title="View Details"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              title="Edit Entry"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              title="Delete Entry"
                              className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Showing {startIdx} to {endIdx} of {filteredData.length} records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
