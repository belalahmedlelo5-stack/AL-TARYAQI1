import { Skeleton } from '@/components/ui/skeleton';

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton className="w-14 h-14 rounded-xl mb-3.5" />
      <Skeleton className="w-20 h-8 mb-1" />
      <Skeleton className="w-28 h-4" />
    </div>
  );
}

// Stats Grid Skeleton
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <div className="order-card">
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-24 h-3" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-3.5 border-t border-[var(--gray-100)]">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-28 h-9 rounded-lg" />
      </div>
    </div>
  );
}

// Orders List Skeleton
export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 7 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="w-full h-4" />
        </td>
      ))}
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 7 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="text-right py-3.5 px-4">
                <Skeleton className="w-20 h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[var(--radius)] p-6 shadow-sm border border-[var(--gray-100)] mb-5">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      ))}
      <Skeleton className="w-full h-14 rounded-lg mt-4" />
    </div>
  );
}

// Sidebar Skeleton
export function SidebarSkeleton() {
  return (
    <div className="w-[var(--sidebar-w)] bg-[var(--navy)] h-screen p-5">
      <Skeleton className="w-full h-16 mb-6 rounded-xl" />
      <Skeleton className="w-full h-20 mb-6 rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Page Skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--gray-100)]">
      {/* Topbar Skeleton */}
      <div className="h-[var(--topbar-h)] bg-white border-b-2 border-[var(--gray-200)] px-7 flex items-center justify-between">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-7">
        <StatsGridSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen">
      <SidebarSkeleton />
      <div className="flex-1 mr-[var(--sidebar-w)]">
        <PageSkeleton />
      </div>
    </div>
  );
}

// Modal Skeleton
export function ModalSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[var(--gray-100)]">
        <Skeleton className="w-40 h-7" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="w-full h-20 rounded-xl" />
        <Skeleton className="w-full h-32 rounded-xl" />
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="flex-1 h-14 rounded-lg" />
        <Skeleton className="w-24 h-14 rounded-lg" />
      </div>
    </div>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border-2 border-[var(--gray-200)] rounded-[var(--radius)] p-4 flex items-center gap-3.5">
      <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="w-32 h-5 mb-1" />
        <Skeleton className="w-20 h-4 mb-1" />
        <Skeleton className="w-24 h-3" />
      </div>
    </div>
  );
}

// Featured Products Grid Skeleton
export function FeaturedGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
