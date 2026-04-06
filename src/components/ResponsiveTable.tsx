'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  cellClassName?: string;
  headerClassName?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  loading?: boolean;
  loadingRows?: number;
  
  // Pagination
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  };
  
  // Row actions
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  
  // Mobile card customization
  mobileCardTitle?: (item: T) => React.ReactNode;
  mobileCardSubtitle?: (item: T) => React.ReactNode;
  mobileCardBadge?: (item: T) => React.ReactNode;
  mobileCardActions?: (item: T) => React.ReactNode;
}

// Skeleton loader for table rows
function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4 border-b border-[var(--gray-100)]">
          <div className="h-4 bg-[var(--gray-200)] rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}

// Skeleton loader for mobile cards
function MobileCardSkeleton() {
  return (
    <div className="bg-white border-2 border-[var(--gray-200)] rounded-[var(--radius)] p-4 mb-3 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-2/3">
          <div className="h-5 bg-[var(--gray-200)] rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-[var(--gray-200)] rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-[var(--gray-200)] rounded w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--gray-200)] rounded w-full"></div>
        <div className="h-3 bg-[var(--gray-200)] rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'لا توجد بيانات',
  emptyIcon = '📋',
  loading = false,
  loadingRows = 5,
  pagination,
  onRowClick,
  rowClassName,
  mobileCardTitle,
  mobileCardSubtitle,
  mobileCardBadge,
  mobileCardActions,
}: ResponsiveTableProps<T>) {
  
  // Desktop Table View
  const DesktopTable = () => (
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--gray-100)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  text-right py-3.5 px-4 text-sm font-extrabold text-[var(--gray-400)]
                  border-b-2 border-[var(--gray-200)]
                  ${column.headerClassName || ''}
                `}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center">
                <div className="text-[var(--gray-400)]">
                  <div className="text-5xl mb-3">{emptyIcon}</div>
                  <p className="text-lg font-bold">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  transition-colors duration-200
                  hover:bg-[var(--teal-light)]
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${rowClassName?.(item) || ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={`${keyExtractor(item)}-${column.key}`}
                    className={`
                      py-4 px-4 text-base text-[var(--gray-800)]
                      border-b border-[var(--gray-100)]
                      ${column.cellClassName || ''}
                    `}
                  >
                    {column.render 
                      ? column.render(item) 
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {loading ? (
        Array.from({ length: loadingRows }).map((_, i) => (
          <MobileCardSkeleton key={i} />
        ))
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-[var(--gray-400)]">
          <div className="text-5xl mb-3">{emptyIcon}</div>
          <p className="text-lg font-bold">{emptyMessage}</p>
        </div>
      ) : (
        data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={`
              bg-white border-2 border-[var(--gray-200)] rounded-[var(--radius)] p-4
              transition-all duration-200
              hover:border-[var(--teal)] hover:shadow-md
              ${onRowClick ? 'cursor-pointer' : ''}
              ${rowClassName?.(item) || ''}
            `}
            data-label="order-card"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {mobileCardTitle ? (
                  mobileCardTitle(item)
                ) : (
                  <div className="font-extrabold text-[var(--navy)] text-lg">
                    {(item as any).name || (item as any).id || '—'}
                  </div>
                )}
                {mobileCardSubtitle && (
                  <div className="text-sm text-[var(--gray-400)] mt-1">
                    {mobileCardSubtitle(item)}
                  </div>
                )}
              </div>
              {mobileCardBadge && (
                <div className="flex-shrink-0 mr-2">
                  {mobileCardBadge(item)}
                </div>
              )}
            </div>

            {/* Card Body - Data Fields */}
            <div className="space-y-2">
              {columns
                .filter(col => col.key !== 'actions' && col.key !== 'id')
                .map((column) => (
                  <div 
                    key={column.key}
                    className="flex items-center justify-between py-1 border-b border-[var(--gray-100)] last:border-0"
                    data-label={column.header}
                  >
                    <span className="text-sm text-[var(--gray-400)] font-bold">
                      {column.header}:
                    </span>
                    <span className="text-sm text-[var(--gray-800)] font-medium">
                      {column.render 
                        ? column.render(item) 
                        : (item as any)[column.key] || '—'
                      }
                    </span>
                  </div>
                ))}
            </div>

            {/* Card Actions */}
            {mobileCardActions && (
              <div className="mt-4 pt-3 border-t border-[var(--gray-100)]">
                {mobileCardActions(item)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages, onPageChange, totalItems, itemsPerPage } = pagination;
    const startItem = page * itemsPerPage + 1;
    const endItem = Math.min((page + 1) * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[var(--gray-100)]">
        <div className="text-sm text-[var(--gray-400)] font-bold order-2 sm:order-1">
          عرض {startItem}–{endItem} من {totalItems}
        </div>
        
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="
              flex items-center gap-1 px-3 py-2 rounded-lg
              bg-[var(--gray-100)] text-[var(--gray-600)] font-bold
              hover:bg-[var(--gray-200)] disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => {
              // Show first, last, current, and neighbors
              const show = 
                i === 0 || 
                i === totalPages - 1 || 
                Math.abs(i - page) <= 1;
              
              const showEllipsis = 
                (i === 1 && page > 2) || 
                (i === totalPages - 2 && page < totalPages - 3);

              if (showEllipsis) {
                return <span key={i} className="px-2 text-[var(--gray-400)]">...</span>;
              }

              if (!show) return null;

              return (
                <button
                  key={i}
                  onClick={() => onPageChange(i)}
                  className={`
                    w-10 h-10 rounded-lg font-bold text-sm
                    transition-colors
                    ${i === page 
                      ? 'bg-[var(--teal)] text-white' 
                      : 'bg-[var(--gray-100)] text-[var(--gray-600)] hover:bg-[var(--gray-200)]'
                    }
                  `}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="
              flex items-center gap-1 px-3 py-2 rounded-lg
              bg-[var(--gray-100)] text-[var(--gray-600)] font-bold
              hover:bg-[var(--gray-200)] disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full" dir="rtl">
      <DesktopTable />
      <MobileCards />
      <Pagination />
    </div>
  );
}

// Simplified version for quick usage
export function SimpleResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  ...props
}: Omit<ResponsiveTableProps<T>, 'mobileCardTitle' | 'mobileCardSubtitle' | 'mobileCardBadge' | 'mobileCardActions'>) {
  return (
    <ResponsiveTable
      data={data}
      columns={columns}
      keyExtractor={keyExtractor}
      {...props}
    />
  );
}
