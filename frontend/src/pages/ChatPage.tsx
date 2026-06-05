import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useHistoryStore } from '../store/historyStore';
import { useChat } from '../hooks/useChat';
import { useSession } from '../hooks/useSession';
import { useTranslation } from '../i18n';
import { MessageBubble } from '../components/MessageBubble';
import { StreamingIndicator } from '../components/StreamingIndicator';
import { ErrorBanner } from '../components/ErrorBanner';
import { BirthWizard } from '../components/BirthWizard';
import { LiveToolActivityBadge, ToolTimeline } from '../components/ToolActivityBadge';
import { WelcomeScreen } from '../components/WelcomeScreen';
import clsx from 'clsx';

export function ChatPage() {
  const { t } = useTranslation();
  const {
    messages,
    isStreaming,
    error,
    toolActivity,
    setError,
  } = useChatStore();
  const { sendMessage } = useChat();
  const { createNewSession, loadHistory } = useSession();

  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [rows, setRows] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = t('chat.placeholder');

  useEffect(() => { loadHistory(); }, []);

  const prevStreamingRef = useRef(isStreaming);
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && messages.length >= 2) {
      useHistoryStore.getState().saveSessionFromMessages(messages);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, toolActivity, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    const lineH = 24;
    const maxRows = 5;
    setRows(Math.min(Math.ceil(scrollH / lineH), maxRows));
    el.style.height = `${Math.min(scrollH, lineH * maxRows)}px`;
  }, [input]);

  const handleSend = useCallback(() => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    setRows(1);
    sendMessage(msg);
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const handleNewSession = async () => { await createNewSession(); };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-starlight/6 bg-space-mid/40 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 rounded-full bg-aurora-glow border border-aurora/30 flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-aurora-light" />
          </motion.div>
          <h2 className="font-display text-sm text-starlight tracking-wider">
            {t('chat.title')}
          </h2>
          {isStreaming && (
            <span className="text-[10px] text-aurora/60 animate-pulse ml-2">{t('chat.streaming')}</span>
          )}
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 text-xs text-starlight-muted hover:text-starlight transition-colors px-2.5 py-1.5 rounded-xl hover:bg-nebula-light border border-transparent hover:border-aurora/15"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('nav.newSession')}</span>
        </button>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-4"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onPromptClick={handlePromptClick} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-0.5 pb-2">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1}
              />
            ))}
            {isStreaming &&
              messages[messages.length - 1]?.role === 'assistant' &&
              !messages[messages.length - 1]?.content && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 px-2 py-0.5"
                >
                  <div className="w-8 h-8 rounded-full bg-aurora-glow border border-aurora/25 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-aurora-light" />
                  </div>
                  <div className="glass-card border border-aurora/12 rounded-2xl rounded-tl-sm px-4 py-3">
                    <StreamingIndicator />
                  </div>
                </motion.div>
              )}
          </div>
        )}
        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto">
            {isStreaming ? (
              <ToolTimeline currentTool={toolActivity?.tool ?? null} isStreaming={isStreaming} />
            ) : (
              <LiveToolActivityBadge activity={toolActivity} />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-36 right-5 z-20 w-8 h-8 rounded-full glass-card border border-aurora/25 flex items-center justify-center text-aurora hover:bg-aurora/15"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      </AnimatePresence>

      {/* Birth Details Wizard */}
      <BirthWizard />

      {/* Input Bar */}
      <div className="flex-shrink-0 px-3 pt-2 pb-4 bg-space-mid/30 backdrop-blur-md border-t border-starlight/6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isStreaming}
                rows={rows}
                className={clsx(
                  'w-full resize-none bg-nebula/70 border border-starlight/10 rounded-2xl px-4 py-3 pr-12 text-sm text-starlight',
                  'placeholder:text-starlight-muted/40 focus:outline-none focus:border-aurora/35',
                  'backdrop-blur-sm leading-6 input-cosmic transition-all duration-200',
                  isStreaming && 'opacity-60 cursor-not-allowed',
                  'scrollbar-thin'
                )}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {input.length > 200 && (
                <span className="absolute bottom-2 right-12 text-[10px] text-starlight-muted/50">
                  {input.length}
                </span>
              )}
            </div>
            <motion.button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              whileTap={{ scale: 0.92 }}
              className={clsx(
                'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                input.trim() && !isStreaming
                  ? 'btn-primary shadow-aurora-sm'
                  : 'bg-nebula/50 border border-starlight/8 cursor-not-allowed'
              )}
            >
              {isStreaming ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4 text-aurora/40" />
                </motion.div>
              ) : (
                <Send
                  className={clsx(
                    'w-4 h-4',
                    input.trim() ? 'text-aurora-light' : 'text-starlight-muted/30'
                  )}
                />
              )}
            </motion.button>
          </div>
          <p className="text-[10px] text-center text-starlight-muted/30 mt-2 select-none">
            {t('chat.hint')}
          </p>
        </div>
      </div>
    </div>
  );
}
