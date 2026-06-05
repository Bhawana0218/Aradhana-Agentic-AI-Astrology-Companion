import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useTranslation } from '../i18n';
import type { Language, LanguageOption } from '../types';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useChatStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-nebula-light border border-transparent hover:border-aurora/15 transition-all text-xs text-starlight-dim hover:text-starlight"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5 text-aurora/60" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.nativeName}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-52 glass-card rounded-2xl overflow-hidden shadow-card z-50 border border-aurora/15"
          >
            <div className="px-3 pt-3 pb-1.5">
              <p className="text-[10px] uppercase tracking-widest text-starlight-muted font-medium">
                Choose Language
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-aurora/8 transition-colors text-left group"
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-starlight group-hover:text-starlight font-medium">
                      {lang.nativeName}
                    </div>
                    <div className="text-[10px] text-starlight-muted">{lang.name}</div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-3.5 h-3.5 text-aurora flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
