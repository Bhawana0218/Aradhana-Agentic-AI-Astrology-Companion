import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Plus, Mic, MicOff, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useChat } from '../hooks/useChat';
import { useSession } from '../hooks/useSession';
import { MessageBubble } from './MessageBubble';
import { StreamingIndicator } from './StreamingIndicator';
import { ErrorBanner } from './ErrorBanner';
import { BirthDetailsForm } from './BirthDetailsForm';
import { ToolActivityBadge, LiveToolActivityBadge } from './ToolActivityBadge';
import { WelcomeScreen } from './WelcomeScreen';
import { LanguageSelector } from './LanguageSelector';
import { CosmicBackground } from './CosmicBackground';
import clsx from 'clsx';

// ─── Language-aware placeholders ─────────────────────────────────────────────

const PLACEHOLDERS: Record<string, string[]> = {
  en: [
    'Ask the stars about your path…',
    'What does your chart reveal?',
    'Explore today\'s cosmic currents…',
    'Ask about your Saturn return…',
    'Discover your rising sign…',
  ],
  hi: [
    'तारों से अपना मार्ग पूछें…',
    'आपकी कुंडली क्या बताती है?',
    'आज के ग्रहों की स्थिति जानें…',
  ],
  bn: ['তারাদের জিজ্ঞেস করুন…', 'আপনার রাশিচক্র কী বলছে?'],
  te: ['నక్షత్రాల గురించి అడగండి…', 'మీ జాతకం ఏమి చెప్తుంది?'],
  mr: ['ताऱ्यांना विचारा…', 'आपली कुंडली काय सांगते?'],
  ta: ['நட்சத்திரங்களிடம் கேளுங்கள்…', 'உங்கள் ஜாதகம் என்ன சொல்கிறது?'],
  gu: ['તારાઓ ને પૂછો…', 'આપની કુંડળી શું કહે છે?'],
  kn: ['ನಕ್ಷತ್ರಗಳನ್ನು ಕೇಳಿ…', 'ನಿಮ್ಮ ಜಾತಕ ಏನು ಹೇಳುತ್ತದೆ?'],
  ml: ['നക്ഷത്രങ്ങളോട് ചോദിക്കൂ…', 'നിങ്ങളുടെ ജാതകം എന്ത് പറയുന്നു?'],
  pa: ['ਤਾਰਿਆਂ ਤੋਂ ਪੁੱਛੋ…', 'ਤੁਹਾਡੀ ਕੁੰਡਲੀ ਕੀ ਕਹਿੰਦੀ ਹੈ?'],
};

function usePlaceholder(language: string): string {
  const [idx, setIdx] = useState(0);
  const phrases = PLACEHOLDERS[language] ?? PLACEHOLDERS.en;

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % phrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return phrases[idx];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ChatWindow() {
  const {
    messages,
    isStreaming,
    error,
    toolActivity,
    setError,
    language,
  } = useChatStore();
  const { sendMessage } = useChat();
  const { createNewSession, loadHistory } = useSession();

  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [rows, setRows] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = usePlaceholder(language);

  // Load history once on mount
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolActivity, scrollToBottom]);

  // Show/hide scroll button
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    const maxRows = 5;
    const lineH = 24;
    const newRows = Math.min(Math.ceil(scrollH / lineH), maxRows);
    setRows(newRows);
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

  const handleNewSession = async () => {
    await createNewSession();
  };

  return (
    <div className="flex flex-col h-dvh relative overflow-hidden">
      {/* Cosmic canvas background */}
      <CosmicBackground />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-starlight/6 bg-space-mid/60 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-7 h-7 rounded-full bg-aurora-glow border border-aurora/30 flex items-center justify-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-aurora-light" />
              </motion.div>
              <div>
                <h1 className="font-display text-base text-starlight tracking-widest leading-none">
                  ARADHANA
                </h1>
                <p className="text-[9px] tracking-[0.2em] text-aurora/60 uppercase font-medium leading-none mt-0.5">
                  Celestial AI Guide
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <LanguageSelector />

            {/* New session */}
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1.5 text-xs text-starlight-muted hover:text-starlight transition-colors px-2.5 py-1.5 rounded-xl hover:bg-nebula-light border border-transparent hover:border-aurora/15"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Reading</span>
            </button>
          </div>
        </header>

        {/* ── Messages ────────────────────────────────────────────────────────── */}
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

              {/* Streaming indicator (empty assistant bubble) */}
              {isStreaming && messages[messages.length - 1]?.role === 'assistant' &&
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

          {/* Live tool activity banner */}
          {messages.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <LiveToolActivityBadge activity={toolActivity} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-36 right-5 z-20 w-8 h-8 rounded-full glass-card border border-aurora/25 flex items-center justify-center text-aurora hover:bg-aurora/15 transition-colors shadow-aurora-sm"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Error Banner ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
            />
          )}
        </AnimatePresence>

        {/* ── Birth Details Form ───────────────────────────────────────────────── */}
        <BirthDetailsForm />

        {/* ── Input Bar ────────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-3 pt-2 pb-4 bg-space-mid/50 backdrop-blur-md border-t border-starlight/6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              {/* Textarea */}
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
                {/* Char hint for long inputs */}
                {input.length > 200 && (
                  <span className="absolute bottom-2 right-12 text-[10px] text-starlight-muted/50">
                    {input.length}
                  </span>
                )}
              </div>

              {/* Send button */}
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
                aria-label="Send message"
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

            {/* Footer hint */}
            <p className="text-[10px] text-center text-starlight-muted/30 mt-2 select-none">
              Shift + Enter for new line · Astrology is for guidance, not certainty
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
