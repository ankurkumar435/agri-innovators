import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa' as Language, name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'mr' as Language, name: 'मराठी', flag: '🇮🇳' },
];

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                language === lang.code ? 'bg-muted text-primary' : 'text-foreground'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {language === lang.code && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};