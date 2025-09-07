import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
  sorter?: (a: T, b: T) => number;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
  };
  rowKey?: keyof T | ((record: T) => string);
  rowSelection?: {
    type: 'checkbox' | 'radio';
    selectedRowKeys: (string | number)[];
    onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  expandable?: {
    expandedRowKeys: (string | number)[];
    onExpandedRowsChange: (expandedRowKeys: (string | number)[]) => void;
    expandedRowRender: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  onRow?: (record: T, index: number) => {
    onClick?: (event: React.MouseEvent) => void;
    onDoubleClick?: (event: React.MouseEvent) => void;
    onContextMenu?: (event: React.MouseEvent) => void;
  };
  actions?: {
    view?: (record: T) => void;
    edit?: (record: T) => void;
    delete?: (record: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (record: T) => void;
      disabled?: (record: T) => boolean;
    }>;
  };
  className?: string;
}

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  rowKey = 'id',
  rowSelection,
  expandable,
  scroll,
  size = 'middle',
  bordered = false,
  striped = true,
  hoverable = true,
  searchable = true,
  filterable = true,
  exportable = true,
  refreshable = true,
  onRefresh,
  onExport,
  onRow,
  actions,
  className = ''
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Get row key value
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index;
  };

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(record =>
        columns.some(column => {
          const value = column.dataIndex ? (record as any)[column.dataIndex] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        filtered = filtered.filter(record => {
          const recordValue = (record as any)[key];
          return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column) return 0;

      let aValue = column.dataIndex ? (a as any)[column.dataIndex] : '';
      let bValue = column.dataIndex ? (b as any)[column.dataIndex] : '';

      if (column.sorter) {
        return sortConfig.direction === 'asc' 
          ? column.sorter(a, b)
          : column.sorter(b, a);
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  // Handle sort
  const handleSort = (columnKey: string) => {
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  // Handle row selection
  const handleRowSelection = (record: T, checked: boolean) => {
    if (!rowSelection) return;

    const key = getRowKey(record, 0);
    const newSelectedKeys = checked
      ? [...rowSelection.selectedRowKeys, key]
      : rowSelection.selectedRowKeys.filter(k => k !== key);

    const newSelectedRows = data.filter(item => 
      newSelectedKeys.includes(getRowKey(item, 0))
    );

    rowSelection.onChange(newSelectedKeys, newSelectedRows);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!rowSelection) return;

    const keys = paginatedData.map((record, index) => getRowKey(record, index));
    const newSelectedKeys = checked
      ? [...new Set([...rowSelection.selectedRowKeys, ...keys])]
      : rowSelection.selectedRowKeys.filter(key => !keys.includes(key));

    const newSelectedRows = data.filter(item => 
      newSelectedKeys.includes(getRowKey(item, 0))
    );

    rowSelection.onChange(newSelectedKeys, newSelectedRows);
  };

  // Handle expand
  const handleExpand = (record: T) => {
    if (!expandable) return;

    const key = getRowKey(record, 0);
    const newExpandedKeys = expandable.expandedRowKeys.includes(key)
      ? expandable.expandedRowKeys.filter(k => k !== key)
      : [...expandable.expandedRowKeys, key];

    expandable.onExpandedRowsChange(newExpandedKeys);
  };

  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    middle: 'text-base',
    large: 'text-lg'
  };

  const paddingClasses = {
    small: 'px-3 py-2',
    middle: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Table Header */}
      {(searchable || filterable || exportable || refreshable) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {refreshable && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              
              {exportable && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`w-full ${sizeClasses[size]}`}>
          <thead>
            <tr className="border-b border-gray-200">
              {/* Row Selection Header */}
              {rowSelection && (
                <th className={`${paddingClasses[size]} text-left`}>
                  {rowSelection.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every(record => 
                        rowSelection.selectedRowKeys.includes(getRowKey(record, 0))
                      )}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  )}
                </th>
              )}

              {/* Expand Header */}
              {expandable && (
                <th className={`${paddingClasses[size]} text-left`}></th>
              )}

              {/* Column Headers */}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`${paddingClasses[size]} text-${column.align || 'left'} font-medium text-gray-700 bg-gray-50`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4 text-amber-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-amber-600" />
                          )
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUp className="h-3 w-3 text-gray-400" />
                            <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Header */}
              {actions && (
                <th className={`${paddingClasses[size]} text-center`}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0) + (actions ? 1 : 0)}
                  className={`${paddingClasses[size]} text-center`}
                >
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-amber-600 mr-2" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0) + (actions ? 1 : 0)}
                  className={`${paddingClasses[size]} text-center text-gray-500`}
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const key = getRowKey(record, index);
                const isExpanded = expandable?.expandedRowKeys.includes(key);
                const isSelected = rowSelection?.selectedRowKeys.includes(key);

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={`
                        border-b border-gray-100 transition-colors
                        ${striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        ${hoverable ? 'hover:bg-gray-100' : ''}
                        ${isSelected ? 'bg-amber-50' : ''}
                      `}
                      {...onRow?.(record, index)}
                    >
                      {/* Row Selection */}
                      {rowSelection && (
                        <td className={`${paddingClasses[size]}`}>
                          <input
                            type={rowSelection.type}
                            checked={isSelected}
                            onChange={(e) => handleRowSelection(record, e.target.checked)}
                            {...rowSelection.getCheckboxProps?.(record)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                        </td>
                      )}

                      {/* Expand Button */}
                      {expandable && (
                        <td className={`${paddingClasses[size]}`}>
                          {expandable.rowExpandable?.(record) !== false && (
                            <button
                              onClick={() => handleExpand(record)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </td>
                      )}

                      {/* Data Cells */}
                      {columns.map(column => (
                        <td
                          key={column.key}
                          className={`${paddingClasses[size]} text-${column.align || 'left'} ${
                            column.ellipsis ? 'truncate' : ''
                          }`}
                        >
                          {column.render
                            ? column.render(
                                column.dataIndex ? (record as any)[column.dataIndex] : '',
                                record,
                                index
                              )
                            : column.dataIndex
                            ? (record as any)[column.dataIndex]
                            : ''}
                        </td>
                      ))}

                      {/* Actions */}
                      {actions && (
                        <td className={`${paddingClasses[size]} text-center`}>
                          <div className="flex items-center justify-center gap-1">
                            {actions.view && (
                              <button
                                onClick={() => actions.view!(record)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            
                            {actions.edit && (
                              <button
                                onClick={() => actions.edit!(record)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            
                            {actions.delete && (
                              <button
                                onClick={() => actions.delete!(record)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}

                            {actions.custom?.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(record)}
                                disabled={action.disabled?.(record)}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={action.label}
                              >
                                {action.icon || <MoreHorizontal className="h-4 w-4" />}
                              </button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Expanded Row */}
                    {expandable && isExpanded && (
                      <tr>
                        <td
                          colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0) + (actions ? 1 : 0)}
                          className={`${paddingClasses[size]} bg-gray-50`}
                        >
                          {expandable.expandedRowRender(record, index)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              {pagination.showTotal
                ? pagination.showTotal(
                    pagination.total,
                    [
                      (pagination.current - 1) * pagination.pageSize + 1,
                      Math.min(pagination.current * pagination.pageSize, pagination.total)
                    ]
                  )
                : `Showing ${(pagination.current - 1) * pagination.pageSize + 1} to ${Math.min(
                    pagination.current * pagination.pageSize,
                    pagination.total
                  )} of ${pagination.total} entries`}
            </div>

            <div className="flex items-center gap-2">
              {/* Page Size Selector */}
              {pagination.showSizeChanger && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => {
                      // Handle page size change
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              )}

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    // Handle previous page
                  }}
                  disabled={pagination.current === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                  .filter(page => {
                    const current = pagination.current;
                    return page === 1 || page === Math.ceil(pagination.total / pagination.pageSize) || 
                           (page >= current - 2 && page <= current + 2);
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => {
                          // Handle page change
                        }}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          page === pagination.current
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => {
                    // Handle next page
                  }}
                  disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
