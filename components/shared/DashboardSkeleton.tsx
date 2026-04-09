'use client';

import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from './Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen animate-in fade-in duration-500">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-[#120f00] border-r border-amber-900/10 p-6 flex flex-col">
        {/* Logo */}
        <Skeleton className="h-8 w-32 mb-10 rounded-lg" />

        {/* Nav items */}
        <div className="space-y-3 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        {/* User info */}
        <div className="flex items-center space-x-3 mt-auto pt-6 border-t border-amber-900/10">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-2 w-28 rounded" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>

        {/* Chart area */}
        <Skeleton className="h-64 w-full rounded-2xl" />

        {/* Table skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
