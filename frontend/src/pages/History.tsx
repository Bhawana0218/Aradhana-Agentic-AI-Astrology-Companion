import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Search, Star, Trash2, Download, ArrowRight, Clock, MessageCircle } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { SearchInput } from '../components/SearchInput';
import { EmptyState } from '../components/EmptyState';
import { toast } from '../components/Toast';
import { useHistoryStore } from '../store/historyStore';
import { formatDate } from '../lib/utils';
import clsx from 'clsx';
import { useTranslation } from '../i18n';

const SORT_OPTIONS = [
  { id: 'newest', label: 'history.sortNewest' },
  { id: 'oldest', label: 'history.sortOldest' },
  { id: 'messages', label: 'history.sortMessages' },
];

export function History() {
  const { t } = useTranslation();
  const { sessions, deleteSession, toggleBookmark } = useHistoryStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = [...sessions];
    if (filterBookmarked) result = result.filter((s) => s.bookmarked);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(q) || s.preview.toLowerCase().includes(q));
    }
    if (sort === 'oldest') result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === 'messages') result.sort((a, b) => b.message_count - a.message_count);
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [sessions, search, sort, filterBookmarked]);

  const handleDelete = (id: string) => {
    deleteSession(id);
    toast('success', 'Session deleted');
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => deleteSession(id));
    toast('success', `${selectedIds.size} session(s) deleted`);
    setSelectedIds(new Set());
  };

  const handleExport = (session: typeof sessions[0]) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aradhana-session-${session.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Session exported');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('history.title')}</h1>
            <p className="text-sm text-starlight-muted">{t('history.count').replace('{count}', String(sessions.length))}</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-rose-cosmos bg-rose-cosmos/10 border border-rose-cosmos/20 hover:bg-rose-cosmos/15 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
                {t('history.deleteSelected').replace('{count}', String(selectedIds.size))}
              </button>
            )}
            <button onClick={() => setFilterBookmarked(!filterBookmarked)} className={clsx('p-2 rounded-xl border transition-all', filterBookmarked ? 'bg-sol/10 border-sol/25 text-sol' : 'border-starlight/8 text-starlight-muted hover:text-starlight')}>
              <Star className={clsx('w-4 h-4', filterBookmarked && 'fill-sol')} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder={t('history.searchPlaceholder')} className="flex-1" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-nebula/60 border border-starlight/8 rounded-xl px-3 py-2.5 text-xs text-starlight focus:outline-none focus:border-aurora/30">
            {SORT_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{t(opt.label)}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon className="w-7 h-7 text-aurora-light/60" />}
            title={search ? t('history.emptySearchTitle') : t('history.emptyTitle')}
            description={search ? t('history.emptySearchDesc') : t('history.emptyDesc')}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filtered.map((session, i) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03 }}
                  className={clsx(
                    'glass-card-premium rounded-2xl p-4 border transition-all duration-200 group',
                    selectedIds.has(session.id) ? 'border-aurora/40 bg-aurora/5' : 'border-starlight/6 hover:border-aurora/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                      <input type="checkbox" checked={selectedIds.has(session.id)} onChange={() => toggleSelect(session.id)} className="w-4 h-4 rounded border-starlight/20 bg-transparent accent-aurora cursor-pointer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-starlight">{session.title}</h3>
                          <p className="text-[11px] text-starlight-dim mt-1 line-clamp-2">{session.preview}</p>
                        </div>
                        {session.bookmarked && <Star className="w-3.5 h-3.5 text-sol fill-sol flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[10px] text-starlight-muted/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.created_at)}
                        </span>
                        <span className="text-[10px] text-starlight-muted/50 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {session.message_count} messages
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleBookmark(session.id)} className="p-1.5 rounded-lg hover:bg-starlight/5 transition-colors">
                        <Star className={clsx('w-3.5 h-3.5', session.bookmarked ? 'text-sol fill-sol' : 'text-starlight-muted')} />
                      </button>
                      <button onClick={() => handleExport(session)} className="p-1.5 rounded-lg hover:bg-starlight/5 transition-colors">
                        <Download className="w-3.5 h-3.5 text-starlight-muted" />
                      </button>
                      <button onClick={() => handleDelete(session.id)} className="p-1.5 rounded-lg hover:bg-rose-cosmos/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-rose-cosmos/60" />
                      </button>
                      <a href="/chat" className="p-1.5 rounded-lg hover:bg-aurora/10 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-aurora-light" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
}
