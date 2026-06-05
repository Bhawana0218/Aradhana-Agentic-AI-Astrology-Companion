import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Sparkles, Heart, Sun, CloudMoon, Smile, Star, Trash2, Bookmark, Edit3, X } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { SearchInput } from '../components/SearchInput';
import { EmptyState } from '../components/EmptyState';
import { toast } from '../components/Toast';
import { useJournalStore } from '../store/journalStore';
import { formatDate } from '../lib/utils';
import type { JournalEntry, Mood, JournalTag } from '../types';
import clsx from 'clsx';
import { useTranslation } from '../i18n';

export function Journal() {
  const { entries, addEntry, updateEntry, deleteEntry, toggleBookmark } = useJournalStore();
  const { t } = useTranslation();

  const MOOD_OPTIONS: { value: Mood; icon: React.ReactNode; label: string; color: string }[] = [
    { value: 'cosmic', icon: <Sparkles className="w-4 h-4" />, label: t('journal.mood.cosmic'), color: 'text-aurora-light bg-aurora/10 border-aurora/20' },
    { value: 'radiant', icon: <Sun className="w-4 h-4" />, label: t('journal.mood.radiant'), color: 'text-sol-light bg-sol/10 border-sol/20' },
    { value: 'calm', icon: <CloudMoon className="w-4 h-4" />, label: t('journal.mood.calm'), color: 'text-teal bg-teal/10 border-teal/20' },
    { value: 'stormy', icon: <CloudMoon className="w-4 h-4" />, label: t('journal.mood.stormy'), color: 'text-rose-cosmos bg-rose-cosmos/10 border-rose-cosmos/20' },
    { value: 'neutral', icon: <Smile className="w-4 h-4" />, label: t('journal.mood.neutral'), color: 'text-starlight-dim bg-starlight/5 border-starlight/10' },
  ];

  const TAG_OPTIONS: { value: JournalTag; label: string }[] = [
    { value: 'reflection', label: t('journal.tag.reflection') },
    { value: 'intention', label: t('journal.tag.intention') },
    { value: 'dream', label: t('journal.tag.dream') },
    { value: 'gratitude', label: t('journal.tag.gratitude') },
    { value: 'insight', label: t('journal.tag.insight') },
    { value: 'transit', label: t('journal.tag.transit') },
  ];

  const MOOD_LABELS: Record<Mood, string> = { cosmic: t('journal.mood.cosmic'), radiant: t('journal.mood.radiant'), calm: t('journal.mood.calm'), stormy: t('journal.mood.stormy'), neutral: t('journal.mood.neutral') };
  const MOOD_COLORS: Record<Mood, string> = { cosmic: 'text-aurora-light', radiant: 'text-sol-light', calm: 'text-teal', stormy: 'text-rose-cosmos', neutral: 'text-starlight-dim' };

  const FILTERS = [
    { id: 'all', label: 'journal.filterAll' },
    { id: 'bookmarked', label: 'journal.filterBookmarked' },
    { id: 'reflection', label: 'journal.filterReflection' },
    { id: 'intention', label: 'journal.filterIntention' },
    { id: 'dream', label: 'journal.filterDream' },
    { id: 'gratitude', label: 'journal.filterGratitude' },
    { id: 'insight', label: 'journal.filterInsight' },
    { id: 'transit', label: 'journal.filterTransit' },
  ] as const;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<Mood>('neutral');
  const [editTags, setEditTags] = useState<JournalTag[]>([]);

  const filtered = useMemo(() => {
    let result = entries;
    if (filter === 'bookmarked') result = result.filter((e) => e.bookmarked);
    else if (filter !== 'all') result = result.filter((e) => e.tags.includes(filter as JournalTag));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [entries, search, filter]);

  const handleNewEntry = () => {
    setEditTitle('');
    setEditContent('');
    setEditMood('neutral');
    setEditTags([]);
    setShowEditor(true);
    setSelectedEntry(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditMood(entry.mood);
    setEditTags([...entry.tags]);
    setSelectedEntry(entry);
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast('warning', 'Incomplete', 'Please add both a title and content.');
      return;
    }
    if (selectedEntry) {
      updateEntry(selectedEntry.id, { title: editTitle, content: editContent, mood: editMood, tags: editTags });
      setSelectedEntry({ ...selectedEntry, title: editTitle, content: editContent, mood: editMood, tags: editTags });
      toast('success', 'Entry Updated');
    } else {
      const id = addEntry({ title: editTitle, content: editContent, mood: editMood, tags: editTags });
      const newEntry = useJournalStore.getState().getEntry(id);
      if (newEntry) setSelectedEntry(newEntry);
      toast('success', 'Entry Created');
    }
    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    if (selectedEntry?.id === id) setSelectedEntry(null);
    toast('success', 'Entry Deleted');
  };

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('journal.title')}</h1>
            <p className="text-sm text-starlight-muted">{entries.length} {entries.length === 1 ? t('journal.entry') : t('journal.entries')} {t('journal.recorded')}</p>
          </div>
          <button onClick={handleNewEntry} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('journal.newEntry')}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder={t('journal.searchPlaceholder')} className="flex-1" />
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all',
                  filter === f.id ? 'bg-aurora/15 text-aurora-light border border-aurora/25' : 'text-starlight-muted hover:text-starlight border border-transparent'
                )}
              >
                {t(f.label)}
                {f.id === 'bookmarked' && <Star className="w-3 h-3 inline ml-1" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className={clsx('lg:col-span-2 space-y-3', selectedEntry && 'hidden lg:block')}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-7 h-7 text-aurora-light/60" />}
                title={search ? t('journal.emptySearchTitle') : t('journal.emptyTitle')}
                description={search ? t('journal.emptySearchDesc') : t('journal.emptyDesc')}
                action={!search && <button onClick={handleNewEntry} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs"><Plus className="w-3.5 h-3.5" />{t('journal.writeFirstEntry')}</button>}
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    onClick={() => setSelectedEntry(entry)}
                    className={clsx(
                      'glass-card-premium rounded-2xl p-4 border cursor-pointer transition-all duration-200',
                      selectedEntry?.id === entry.id ? 'border-aurora/30 bg-aurora/5' : 'border-starlight/6 hover:border-aurora/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center text-xs border', MOOD_OPTIONS.find((m) => m.value === entry.mood)?.color || 'border-starlight/10')}>
                        {MOOD_OPTIONS.find((m) => m.value === entry.mood)?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-starlight truncate">{entry.title}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {entry.bookmarked && <Star className="w-3 h-3 text-sol fill-sol" />}
                          </div>
                        </div>
                        <p className="text-xs text-starlight-muted/70 mt-1 line-clamp-2">{entry.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-starlight-muted/50">{formatDate(entry.created_at)}</span>
                          <span className="text-[10px]" style={{ color: MOOD_COLORS[entry.mood] }}>{MOOD_LABELS[entry.mood]}</span>
                          {entry.tags.map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className={clsx('lg:col-span-1', !selectedEntry && !showEditor && 'hidden lg:block')}>
            {showEditor ? (
              <div className="glass-card-premium rounded-2xl p-5 border border-aurora/20 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm text-starlight tracking-wide">{selectedEntry ? t('journal.editEntry') : t('journal.newEntry')}</h3>
                  <button onClick={() => { setShowEditor(false); setSelectedEntry(null); }} className="p-1 rounded-lg hover:bg-starlight/5">
                    <X className="w-4 h-4 text-starlight-muted" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={t('journal.entryTitlePlaceholder')} className="input-premium text-sm" />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder={t('journal.contentPlaceholder')} rows={8} className="input-premium text-sm resize-none" />
                  <div>
                    <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-2">{t('journal.mood')}</p>
                    <div className="flex gap-2">
                      {MOOD_OPTIONS.map((m) => (
                        <button key={m.value} onClick={() => setEditMood(m.value)} className={clsx('p-2 rounded-xl border text-xs transition-all', editMood === m.value ? m.color + ' scale-110' : 'border-starlight/8 text-starlight-muted hover:border-starlight/20')}>
                          {m.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-2">{t('journal.tags')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TAG_OPTIONS.map((t) => (
                        <button key={t.value} onClick={() => setEditTags((prev) => prev.includes(t.value) ? prev.filter((x) => x !== t.value) : [...prev, t.value])} className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all', editTags.includes(t.value) ? 'bg-aurora/15 text-aurora-light border-aurora/25' : 'border-starlight/8 text-starlight-muted hover:border-starlight/20')}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSave} className="w-full py-2.5 rounded-xl btn-primary text-xs font-medium">
                    {selectedEntry ? t('journal.updateEntry') : t('journal.saveEntry')}
                  </button>
                </div>
              </div>
            ) : selectedEntry ? (
              <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 sticky top-20">
                <div className="flex items-start justify-between mb-4">
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center border', MOOD_OPTIONS.find((m) => m.value === selectedEntry.mood)?.color || 'border-starlight/10')}>
                    {MOOD_OPTIONS.find((m) => m.value === selectedEntry.mood)?.icon}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditEntry(selectedEntry)} className="p-1.5 rounded-lg hover:bg-starlight/5 transition-colors"><Edit3 className="w-3.5 h-3.5 text-starlight-muted" /></button>
                    <button onClick={() => toggleBookmark(selectedEntry.id)} className="p-1.5 rounded-lg hover:bg-starlight/5 transition-colors"><Star className={clsx('w-3.5 h-3.5', selectedEntry.bookmarked ? 'text-sol fill-sol' : 'text-starlight-muted')} /></button>
                    <button onClick={() => handleDelete(selectedEntry.id)} className="p-1.5 rounded-lg hover:bg-rose-cosmos/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-rose-cosmos/60" /></button>
                  </div>
                </div>
                <h2 className="font-display text-base text-starlight tracking-wide mb-1">{selectedEntry.title}</h2>
                <p className="text-[10px] text-starlight-muted/50 mb-3">{formatDate(selectedEntry.created_at)}</p>
                <p className="text-xs text-starlight-dim leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {selectedEntry.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{tag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-full py-16 text-center">
                <BookOpen className="w-10 h-10 text-aurora/20 mb-3" />
                <p className="text-sm text-starlight-muted">{t('journal.selectEntryHint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
