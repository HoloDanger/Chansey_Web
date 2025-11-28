import React, { createContext, useContext, useMemo, useState } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (t: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const value = useMemo(() => ({ theme, isDark: theme === 'dark', setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Provide a safe fallback so useTheme works even without provider
    return { theme: 'light', isDark: false, setTheme: () => {} };
  }
  return ctx;
}
