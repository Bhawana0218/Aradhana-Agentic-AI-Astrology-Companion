import { Search, X } from 'lucide-react';
import { useRef } from 'react';
import clsx from 'clsx';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={clsx('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-starlight-muted/50 pointer-events-none" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-nebula/60 border border-starlight/8 rounded-xl pl-9 pr-8 py-2.5 text-sm text-starlight placeholder:text-starlight-muted/30 focus:outline-none focus:border-aurora/30 transition-colors"
      />
      {value && (
        <button
          onClick={() => { onChange(''); ref.current?.focus(); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-starlight/5 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-starlight-muted/50" />
        </button>
      )}
    </div>
  );
}
