import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const getInitialMode = () => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggle = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return [mode, toggle];
}
