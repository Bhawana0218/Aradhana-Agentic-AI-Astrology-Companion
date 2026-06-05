import { motion } from 'framer-motion';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import clsx from 'clsx';
import type { Message } from '../types';
import { ToolActivityBadge } from './ToolActivityBadge';
import { StreamingIndicator } from './StreamingIndicator';

interface Props {
  message: Message;
  isLast?: boolean;
}

// ─── Markdown-like renderer (lightweight, no deps) ───────────────────────────

function renderContent(text: string): string {
  // Bold **text**
  let out = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text* or _text_
  out = out.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  out = out.replace(/_([^_]+?)_/g, '<em>$1</em>');
  // Inline code `code`
  out = out.replace(/`([^`]+?)`/g, '<code class="bg-nebula-light px-1 py-0.5 rounded text-aurora-light text-xs font-mono">$1</code>');
  // Bullet lists starting with - or •
  out = out.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
  out = out.replace(/((<li>.*<\/li>\n?)+)/g, '<ul class="message-prose-list">$1</ul>');
  // Line breaks
  out = out.replace(/\n\n/g, '</p><p class="mt-3">');
  out = out.replace(/\n/g, '<br />');
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageBubble({ message, isLast }: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const isEmpty = !message.content && message.isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'group flex gap-3 px-2 py-0.5',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sol/20 to-sol/5 border border-sol/25 flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-sol-light" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora/20 to-mystic/10 border border-aurora/25 flex items-center justify-center relative shadow-sm">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-4 h-4 text-aurora-light" />
            </motion.div>
            {message.isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal border-2 border-space animate-pulse shadow-sm shadow-teal/40" />
            )}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={clsx('flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start', 'max-w-[82%] md:max-w-[75%]')}>
        {/* Tool activity badges (only for assistant) */}
        {!isUser && message.tool_activity && message.tool_activity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1.5 mb-0.5"
          >
            {message.tool_activity.map((ta, i) => (
              <ToolActivityBadge key={i} activity={ta} />
            ))}
          </motion.div>
        )}

        {/* Message content */}
        <div
          className={clsx(
            'relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'bg-message-user border border-sol/15 text-starlight rounded-tr-sm'
              : 'bg-message-ai border border-aurora/12 text-starlight/90 rounded-tl-sm'
          )}
        >
          {/* Copy button (assistant only, non-empty) */}
          {!isUser && message.content && !message.isStreaming && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-aurora/15 hover:scale-110"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-teal" />
              ) : (
                <Copy className="w-3 h-3 text-starlight-muted hover:text-aurora-light" />
              )}
            </button>
          )}

          {/* Rendering */}
          {isEmpty ? (
            <StreamingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              className="message-prose"
              dangerouslySetInnerHTML={{
                __html: `<p class="">${renderContent(message.content)}</p>`,
              }}
            />
          )}

          {/* Streaming cursor */}
          {!isUser && message.isStreaming && message.content && (
            <motion.span
              className="inline-block w-0.5 h-4 bg-aurora-light ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'steps(1)' }}
            />
          )}
        </div>

        {/* Timestamp */}
        {message.created_at && !message.isStreaming && (
          <span className="text-[10px] text-starlight-muted px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
