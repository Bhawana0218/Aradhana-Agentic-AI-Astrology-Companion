import clsx from 'clsx';

interface Props {
  variant?: 'card' | 'list' | 'text' | 'chart' | 'profile';
  count?: number;
  className?: string;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={clsx('skeleton', className)} />;
}

function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-starlight/6 space-y-3">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-3/4" />
      <SkeletonBlock className="h-8 w-28 rounded-xl mt-2" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <SkeletonBlock className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <SkeletonBlock className="h-3 w-16" />
    </div>
  );
}

function TextSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={clsx('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SkeletonBlock className="w-64 h-64 rounded-full" />
      <SkeletonBlock className="h-3 w-40" />
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <SkeletonBlock className="w-20 h-20 rounded-full" />
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-3 w-48" />
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeleton({ variant = 'card', count = 3, className }: Props) {
  const items = Array.from({ length: count });

  if (variant === 'list') {
    return (
      <div className={clsx('divide-y divide-starlight/6', className)}>
        {items.map((_, i) => <ListSkeleton key={i} />)}
      </div>
    );
  }

  if (variant === 'text') {
    return <div className={clsx('space-y-3', className)}><TextSkeleton lines={count} /></div>;
  }

  if (variant === 'chart') {
    return <div className={className}><ChartSkeleton /></div>;
  }

  if (variant === 'profile') {
    return <div className={className}><ProfileSkeleton /></div>;
  }

  return (
    <div className={clsx('grid sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {items.map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
