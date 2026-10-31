import React, { useState } from 'react';
import PromptGenerator from './PromptGenerator';
import PDFExport from './PDFExport';
import ContactHub from './ContactHub';
import { useResume } from '../context/ResumeContext';
import { Zap, Settings2, FileText, Users } from 'lucide-react';

const TipItem = ({ number, children }) => (
  <li className="flex gap-3 leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
      {number}
    </span>
    <span>{children}</span>
  </li>
);

const SectionHeader = ({ step, stepClass, title, subtitle }) => (
  <div className="flex items-center gap-4 no-print" style={{ marginBottom: '2rem' }}>
    <div className={`step-indicator ${stepClass}`}>{step}</div>
    <div>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
  </div>
);

// -- Mobile Tab Bar -------------------------------------------------------
const TABS = [
  { id: 'prompt',  label: 'Prompt',  Icon: Settings2  },
  { id: 'resume',  label: 'Resume',  Icon: FileText   },
  { id: 'hub',     label: 'HR Hub',  Icon: Users      },
];

const MobileTabBar = ({ active, onSelect }) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 no-print flex"
    style={{
      background: 'var(--glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--glass-border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
  >
    {TABS.map(({ id, label, Icon }) => {
      const isActive = active === id;
      return (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)', minHeight: '56px' }}
        >
          <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
          <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500', letterSpacing: '0.04em' }}>
            {label}
          </span>
        </button>
      );
    })}
  </nav>
);

const MainLayout = () => {
  const { includeLeadExtraction, contacts } = useResume();
  const showHub = includeLeadExtraction || contacts.length > 0;
  const [mobileTab, setMobileTab] = useState('prompt');

  return (
    <>
      {/* -- Desktop Layout (lg+) ----------------------------------------- */}
      <main
        className="hidden lg:block"
        style={{
          minHeight: '100vh',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '88px',
          paddingBottom: '80px',
          paddingLeft:  'clamp(1.25rem, 4vw, 4rem)',
          paddingRight: 'clamp(1.25rem, 4vw, 4rem)',
        }}
      >
        <div className="no-print" style={{ marginBottom: '3rem', paddingTop: '2rem' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}>
            AI Resume Architect
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Tailor your resume,{' '}
            <span className="text-gradient">land the interview.</span>
          </h2>
        </div>

        <div className="main-grid">
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animationDelay: '0.05s' }}>
            <section>
              <SectionHeader step="01" stepClass="step-indicator-violet" title="Configure Pipeline" subtitle="Tailor your resume to the target role" />
              <PromptGenerator />
            </section>
            <div className="glass-card no-print" style={{ padding: '1.75rem', borderTop: '2px solid rgba(124,58,237,0.25)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
                  <Zap size={13} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="text-[10px] font-bold uppercase" style={{ letterSpacing: '0.18em', color: 'var(--accent)' }}>Pro Tips</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TipItem number="1">Use <strong>Claude Sonnet</strong> or <strong>GPT-4o</strong> for the best results.</TipItem>
                <TipItem number="2">Paste the <strong>full job description</strong> including tech stack and requirements.</TipItem>
                <TipItem number="3">Paste the AI result into the <strong>editor on the right</strong> to preview &amp; export.</TipItem>
              </ul>
            </div>
          </div>

          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animationDelay: '0.15s' }}>
            <section>
              <SectionHeader step="02" stepClass="step-indicator-emerald" title="Preview & Export" subtitle="Review and download as PDF" />
              <PDFExport />
            </section>
          </div>
        </div>

        {showHub && <ContactHub />}
      </main>

      {/* -- Mobile Layout (< lg) ----------------------------------------- */}
      <main
        className="lg:hidden"
        style={{
          minHeight: '100vh',
          paddingTop: 'calc(64px + env(safe-area-inset-top))',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
          overflowX: 'hidden',
        }}
      >
        {/* Tab panels */}
        <div style={{ display: mobileTab === 'prompt' ? 'block' : 'none', padding: '1rem', paddingBottom: '2rem' }}>
          <PromptGenerator />
        </div>
        <div style={{ display: mobileTab === 'resume' ? 'block' : 'none', padding: '0.75rem', paddingBottom: '2rem' }}>
          <PDFExport />
        </div>
        <div style={{ display: mobileTab === 'hub' ? 'block' : 'none', padding: '1rem', paddingBottom: '2rem' }}>
          <ContactHub />
        </div>
      </main>

      {/* -- Mobile Bottom Tab Bar ---------------------------------------- */}
      <div className="lg:hidden no-print">
        <MobileTabBar active={mobileTab} onSelect={setMobileTab} />
      </div>
    </>
  );
};

export default MainLayout;
