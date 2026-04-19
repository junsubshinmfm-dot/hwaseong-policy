'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalValue(value); }, [value]);

  const computeSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
    computeSuggestions();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(v), 300);
  };

  const handleSelect = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 transition-all duration-200 border
        ${focused ? 'ring-2 ring-navy/20 border-navy/30 shadow-lg shadow-navy/5' : 'border-navy/8 shadow-md'}`}>
        <svg className="w-5 h-5 text-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={() => { setFocused(true); computeSuggestions(); }}
          onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 200)}
          placeholder="시민제안 검색 (예: 교통, 복지, 교육)"
          className="flex-1 bg-transparent text-navy text-base font-medium placeholder:text-navy/30
                     outline-none"
        />

        {localValue && (
          <button onClick={handleClear} className="p-1 rounded-full text-navy/30 hover:text-navy transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && focused && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl overflow-hidden z-30 shadow-xl border border-navy/8"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelect(s)}
                className="w-full px-5 py-3 text-left text-base text-navy/70 hover:text-navy
                           hover:bg-navy-50 transition-colors flex items-center gap-3 font-medium"
              >
                <svg className="w-4 h-4 text-orange/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span dangerouslySetInnerHTML={{
                  __html: s.replace(
                    new RegExp(`(${localValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                    '<span class="text-orange font-bold">$1</span>'
                  )
                }} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
