import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  size?: 'small' | 'default';
  simple?: boolean;
  className?: string;
}

export const TablePagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal,
  pageSizeOptions = [10, 20, 50, 100],
  onChange,
  onShowSizeChange,
  size = 'default',
  simple = false,
  className = ''
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange?.(page, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const newTotalPages = Math.ceil(total / newPageSize);
    const newCurrent = Math.min(current, newTotalPages);
    onShowSizeChange?.(newCurrent, newPageSize);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current <= 4) {
        // Show first 5 pages
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('ellipsis');
          pages.push(totalPages);
        }
      } else if (current >= totalPages - 3) {
        // Show last 5 pages
        pages.push('ellipsis');
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages - 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else {
        // Show current page and surrounding pages
        pages.push('ellipsis');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (simple) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="text-sm text-gray-700">
          {showTotal
            ? showTotal(total, [startItem, endItem])
            : `${startItem}-${endItem} of ${total}`}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-700">
            {current} / {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      {/* Total Info */}
      <div className="text-sm text-gray-700">
        {showTotal
          ? showTotal(total, [startItem, endItem])
          : `Showing ${startItem} to ${endItem} of ${total} entries`}
      </div>

      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={`px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                size === 'small' ? 'text-xs' : ''
              }`}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        )}

        {/* Quick Jumper */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className={`px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-16 ${
                size === 'small' ? 'text-xs' : ''
              }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={current === 1}
            className={`p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              size === 'small' ? 'p-0.5' : ''
            }`}
            title="First page"
          >
            <ChevronsLeft className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className={`p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              size === 'small' ? 'p-0.5' : ''
            }`}
            title="Previous page"
          >
            <ChevronLeft className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === 'ellipsis' ? (
                  <span className={`px-2 text-gray-500 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-1 rounded transition-colors ${
                      size === 'small' ? 'text-xs px-2 py-0.5' : 'text-sm'
                    } ${
                      page === current
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            className={`p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              size === 'small' ? 'p-0.5' : ''
            }`}
            title="Next page"
          >
            <ChevronRight className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>

          {/* Last Page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={current === totalPages}
            className={`p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              size === 'small' ? 'p-0.5' : ''
            }`}
            title="Last page"
          >
            <ChevronsRight className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
