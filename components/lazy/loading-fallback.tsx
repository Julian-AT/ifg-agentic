import { Skeleton } from '../ui/skeleton';

export const ComponentLoadingFallback = ({ 
  height = "200px", 
  className = "" 
}: { 
  height?: string; 
  className?: string; 
}) => (
  <div className={`w-full ${className}`} style={{ height }}>
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);

export const MessageLoadingFallback = () => (
  <div className="flex gap-3 p-4">
    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);

export const FormLoadingFallback = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <Skeleton className="h-10 w-32" />
  </div>
);

export const ChartLoadingFallback = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);