import React from 'react';
import useDarkMode from '../hooks/useDarkMode';

export default function DarkModeToggle() {
  const [mode, toggle] = useDarkMode();

  return (
    <button onClick={toggle} style={{
      marginLeft: '1em',
      backgroundColor: 'transparent',
      border: '1px solid var(--text)',
      padding: '0.5em 1em',
      borderRadius: '6px',
      cursor: 'pointer',
      color: 'var(--text)'
    }}>
      {mode === 'dark' ? '🌞 Hell' : '🌙 Dunkel'}
    </button>
  );
}
