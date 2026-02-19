import { cn } from '@/lib/utils';

interface StorageInfo {
  limitMB: number;
  usedMB: number;
  availableMB: number;
}

interface StorageIndicatorProps {
  storageInfo: StorageInfo;
  className?: string;
}

export function StorageIndicator({ storageInfo, className }: StorageIndicatorProps) {
  const { limitMB, usedMB, availableMB } = storageInfo;
  const usagePercentage = (usedMB / limitMB) * 100;
  
  // Color based on usage percentage
  const getColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 75) return 'bg-orange-500';
    if (usagePercentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (usagePercentage >= 90) return 'text-red-700';
    if (usagePercentage >= 75) return 'text-orange-700';
    if (usagePercentage >= 50) return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Storage Usage</span>
        <span className={cn('font-medium', getTextColor())}>
          {usedMB.toFixed(1)}MB / {limitMB}MB
        </span>
      </div>
      
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', getColor())}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{availableMB.toFixed(1)}MB available</span>
        <span>{usagePercentage.toFixed(1)}% used</span>
      </div>
      
      {usagePercentage >= 90 && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-800">
          ⚠️ Storage almost full! Consider deleting unused media files.
        </div>
      )}
      
      {usagePercentage >= 75 && usagePercentage < 90 && (
        <div className="rounded-md bg-orange-50 p-2 text-xs text-orange-800">
          ⚠️ Storage usage is high. Consider managing your media files.
        </div>
      )}
    </div>
  );
}