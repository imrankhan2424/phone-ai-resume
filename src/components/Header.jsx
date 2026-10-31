import React from 'react';
import { Sun, Moon, Sparkles, Layout, List } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import clsx from 'clsx';

export const ThemeToggle = () => {
  const { theme, setTheme } = useResume();
  const isDark = theme === 'dark';
  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 no-print hover:scale-105 active:scale-95"
      style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
      }}
    >
      {isDark
        ? <Sun size={17} className="text-amber-400" />
        : <Moon size={17} style={{ color: '#7c3aed' }} />
      }
    </button>
  );
};

export const ModeSwitcher = () => {
  const { mode, setMode, theme } = useResume();
  const isDark = theme === 'dark';
  return (
    <div
      className="flex p-1 rounded-[0.85rem] no-print relative"
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--glass-border)',
        boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      {/* Sliding background pill */}
      <div 
        className="absolute rounded-xl transition-all duration-300 ease-out pointer-events-none"
        style={{
          top: '2px',
          bottom: '2px',
          width: 'calc(50% - 4px)',
          background: 'var(--bg-secondary)',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)',
          left: mode === 'visual' ? '4px' : '50%',
          border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--glass-border)'
        }}
      />
      {[
        { key: 'visual', icon: <Layout size={14} />, label: 'Visual' },
        { key: 'ats',    icon: <List   size={14} />, label: 'ATS'    },
      ].map(({ key, icon, label }) => (
        <button
          key={key}
          id={`mode-${key}`}
          onClick={() => setMode(key)}
          className="relative z-10 flex flex-1 items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors duration-300"
          style={{
            color: mode === key ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: mode === key ? '700' : '600',
            fontFamily: "'Inter', sans-serif",
            minWidth: '95px'
          }}
        >
          <span style={{ transform: mode === key ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }}>
            {icon}
          </span>
          <span style={{ transform: mode === key ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 no-print">
      {/* Frosted glass backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-2xl"
        style={{
          background: 'var(--glass)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      />

      <div style={{ maxWidth: '1440px', margin: '0 auto', paddingLeft: 'clamp(1.25rem, 4vw, 4rem)', paddingRight: 'clamp(1.25rem, 4vw, 4rem)' }} className="h-16 relative flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-default select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
               style={{ boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
            <Sparkles className="text-white" size={17} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight">
              Resume <span className="text-gradient">Architect</span>
            </h1>
            <p className="text-[9px] uppercase font-bold" style={{ letterSpacing: '0.22em', color: 'var(--text-muted)' }}>
              AI-Powered Optimizer
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ModeSwitcher />
          </div>
          <div className="w-px h-6 no-print hidden md:block" style={{ background: 'var(--border)' }} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
