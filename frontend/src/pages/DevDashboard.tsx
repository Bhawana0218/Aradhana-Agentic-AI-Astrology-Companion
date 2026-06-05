import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, BookOpen, History, Cpu, Clock, Database, BarChart3, Activity } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { useChatStore } from '../store/chatStore';
import { useHistoryStore } from '../store/historyStore';
import { useJournalStore } from '../store/journalStore';
import clsx from 'clsx';
import { useTranslation } from '../i18n';

export function DevDashboard() {
  const { messages } = useChatStore();
  const { sessions } = useHistoryStore();
  const { entries } = useJournalStore();
  const { t } = useTranslation();

  const toolCalls = useMemo(() => {
    const map = new Map<string, { count: number; totalTokens: number }>();
    messages.forEach((msg) => {
      (msg.tool_activity ?? []).forEach((act) => {
        if (act.type === 'tool_end') {
          const existing = map.get(act.tool) ?? { count: 0, totalTokens: 0 };
          existing.count++;
          const outStr = typeof act.output === 'string' ? act.output : JSON.stringify(act.output ?? '');
          existing.totalTokens += Math.ceil(outStr.length / 4);
          map.set(act.tool, existing);
        }
      });
    });
    return map;
  }, [messages]);

  const totalTokens = useMemo(() => {
    let tokens = 0;
    messages.forEach((msg) => {
      tokens += Math.ceil(msg.content.length / 4);
      (msg.tool_activity ?? []).forEach((act) => {
        const outStr = typeof act.output === 'string' ? act.output : JSON.stringify(act.output ?? '');
        tokens += Math.ceil(outStr.length / 4);
      });
    });
    return tokens;
  }, [messages]);

  const totalToolCalls = useMemo(() => {
    let count = 0;
    messages.forEach((msg) => {
      count += (msg.tool_activity ?? []).filter((a) => a.type === 'tool_end').length;
    });
    return count;
  }, [messages]);

  const recentCalls = useMemo(() => {
    const calls: Array<{ tool: string; timestamp: number }> = [];
    messages.forEach((msg) => {
      (msg.tool_activity ?? []).forEach((act) => {
        if (act.type === 'tool_end' && act.timestamp) {
          calls.push({ tool: act.tool, timestamp: act.timestamp });
        }
      });
    });
    return calls.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [messages]);

  const avgLatency = useMemo(() => {
    const pairs: Array<{ start: number; end: number }> = [];
    messages.forEach((msg) => {
      const acts = msg.tool_activity ?? [];
      for (let i = 0; i < acts.length; i++) {
        if (acts[i].type === 'tool_start' && acts[i].timestamp) {
          const end = acts.slice(i + 1).find((a) => a.type === 'tool_end' && a.tool === acts[i].tool);
          if (end?.timestamp) {
            pairs.push({ start: acts[i].timestamp!, end: end.timestamp });
          }
        }
      }
    });
    if (pairs.length === 0) return 0;
    return pairs.reduce((sum, p) => sum + (p.end - p.start), 0) / pairs.length;
  }, [messages]);

  const stats = [
    { label: t('devDashboard.statMessages'), value: messages.length, icon: MessageCircle, color: 'text-aurora-light border-aurora/25 bg-aurora/8' },
    { label: t('devDashboard.statSessions'), value: sessions.length, icon: History, color: 'text-sol-light border-sol/25 bg-sol/8' },
    { label: t('devDashboard.statEntries'), value: entries.length, icon: BookOpen, color: 'text-teal border-teal/25 bg-teal/8' },
    { label: t('devDashboard.statToolCalls'), value: totalToolCalls, icon: Cpu, color: 'text-mystic border-mystic/25 bg-mystic/8' },
    { label: t('devDashboard.statTokens'), value: totalTokens.toLocaleString(), icon: BarChart3, color: 'text-rose-cosmos border-rose-cosmos/25 bg-rose-cosmos/8' },
    { label: t('devDashboard.statLatency'), value: avgLatency > 0 ? `${(avgLatency / 1000).toFixed(1)}s` : '—', icon: Clock, color: 'text-starlight-dim border-starlight-dim/20 bg-starlight/5' },
  ];

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('devDashboard.title')}</h1>
          <p className="text-sm text-starlight-muted">{t('devDashboard.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx('glass-card-premium rounded-2xl p-4 border text-center', stat.color)}
            >
              <stat.icon className="w-5 h-5 mx-auto mb-1.5" />
              <p className="font-display text-xl text-starlight">{stat.value}</p>
              <p className="text-[10px] text-starlight-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-aurora-light" />
              <h2 className="font-display text-sm text-starlight tracking-wide">{t('devDashboard.toolUsage')}</h2>
            </div>
            {toolCalls.size === 0 ? (
              <p className="text-xs text-starlight-muted text-center py-6">No tool calls recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {Array.from(toolCalls.entries()).map(([tool, data]) => (
                  <div key={tool} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-nebula-light/50 border border-starlight/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-starlight">{tool}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-starlight-dim">{data.count} call{data.count !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-starlight-muted">~{data.totalTokens} tokens</span>
                      </div>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-nebula overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.count / Math.max(...Array.from(toolCalls.values()).map((d) => d.count))) * 100}%` }}
                        className="h-full rounded-full bg-aurora"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-sol-light" />
              <h2 className="font-display text-sm text-starlight tracking-wide">{t('devDashboard.recentCalls')}</h2>
            </div>
            {recentCalls.length === 0 ? (
              <p className="text-xs text-starlight-muted text-center py-6">No recent tool calls.</p>
            ) : (
              <div className="space-y-1">
                {recentCalls.map((call, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-nebula-light/50 transition-colors">
                    <span className="text-xs text-starlight-dim">{call.tool}</span>
                    <span className="text-[10px] text-starlight-muted">{new Date(call.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-starlight/6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-3.5 h-3.5 text-starlight-muted" />
                <h3 className="text-xs text-starlight-muted font-medium">{t('devDashboard.systemInfo')}</h3>
              </div>
              <div className="text-[10px] text-starlight-dim space-y-1">
                <p>{t('devDashboard.sysKeys')}: {localStorage.length}</p>
                <p>{t('devDashboard.sysMessages')}: {messages.filter((m) => (m.tool_activity?.length ?? 0) > 0).length}</p>
                <p>{t('devDashboard.sysMode')}: {import.meta.env.MODE}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
