import React, { useState } from 'react';
import profilePhoto from '../assets/profile.jpg';
import ReactMarkdown from 'react-markdown';
import { createPortal, flushSync } from 'react-dom';
import { Printer, Edit3, Settings, ShieldCheck, FileText, Copy, Check, Maximize2, X, UserPlus, Mail, MapPin, Building, UserCheck, Trash2 } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { Capacitor } from '@capacitor/core';

const PDFExport = () => {
  const { 
    mode, aiResult, setAiResult, 
    includeCoverLetter, aiCoverLetterResult, setAiCoverLetterResult,
    includeLeadExtraction, leadAiResult, setLeadAiResult,
    addContact,
    includePhoto,
    photoSize,
    photoShape,
    photoBorder,
    customPhoto,
  } = useResume();

  const [printTarget, setPrintTarget] = React.useState('both');
  const [activePrintStyle, setActivePrintStyle] = useState(null); // 'visual' | 'ats' | null
  const [showVisualPreview, setShowVisualPreview] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedLead, setCopiedLead] = useState(false);
  const [modalTarget, setModalTarget] = useState(null); // 'resume' | 'cover' | null
  const [customFileName, setCustomFileName] = useState('');

  const PHOTO_SIZES = { sm: '36pt', md: '42pt', lg: '50pt', xl: '58pt' };
  const PHOTO_SHAPES = { rounded: '6px', squircle: '14px', circle: '9999px', square: '0px' };
  const PHOTO_BORDERS = {
    subtle: '1.5px solid #ede9fe',
    none: 'none',
    accent: mode === 'ats' ? '2px solid #059669' : '2px solid #7c3aed',
  };

  const activePhotoSize = PHOTO_SIZES[photoSize] || '42pt';
  const activePhotoRadius = PHOTO_SHAPES[photoShape] || '6px';
  const activePhotoBorder = PHOTO_BORDERS[photoBorder] || '1.5px solid #ede9fe';
  const activePhotoSrc = customPhoto || profilePhoto;
  const activePhotoShadow = photoBorder === 'none' ? 'none' : '0 2px 10px rgba(109,40,217,0.12), 0 1px 3px rgba(0,0,0,0.08)';

  const handlePrint = async (target, styleOverride = null) => {
    flushSync(() => {
      setPrintTarget(target);
      setActivePrintStyle(styleOverride);
    });

    // Save the original title
    const originalTitle = document.title;
    
    // Set the document title to custom so PDF metadata/filename matches
    document.title = customFileName.trim() || 'Resume';

    const restoreTitle = () => {
      document.title = originalTitle;
      setActivePrintStyle(null);
      window.removeEventListener('afterprint', restoreTitle);
      window.removeEventListener('focus', restoreTitle);
    };
    
    window.addEventListener('afterprint', restoreTitle);
    window.addEventListener('focus', restoreTitle);

    if (Capacitor.isNativePlatform()) {
      const { CapacitorPrinter } = await import('@capgo/capacitor-printer');
      await CapacitorPrinter.print();
    } else {
      window.print();
    }
  };

  const handleCopyText = (text, setter) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleProcessLead = () => {
    if (!leadAiResult) return;
    
    // Simple parser for the standard Lead Extraction format
    const getValue = (key) => {
      const match = leadAiResult.match(new RegExp(`${key}:\\s*(.*)`));
      if (!match) return '';
      const val = match[1].trim();
      return (val === 'NONE' || val === 'UNKNOWN' || val === '[NONE]' || val === '[UNKNOWN]') ? '' : val.replace(/^\[|\]$/g, '');
    };

    const newContact = {
      id: Date.now().toString(),
      company: getValue('Company') || 'Unknown Company',
      location: getValue('Location') || 'Remote/Unknown',
      email: getValue('Email') || '',
      person: getValue('Person') || 'HR Manager',
      dateAdded: new Date().toISOString()
    };

    addContact(newContact);
    // Optional: Clear lead editor after success? User might want to keep it to edit more.
  };

  const effectivePrintMode = activePrintStyle || (mode === 'ats' && showVisualPreview ? 'visual' : mode);
  const effectiveTitle = customFileName.trim();

  return (
    <div data-print-target={printTarget} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Editors Section (hidden in print) ──────── */}
      <div className="flex flex-col gap-6 no-print">
        
        {/* Resume/General Editor */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--emerald-soft)' }}>
                <Edit3 size={14} style={{ color: 'var(--emerald)' }} />
              </div>
              <span className="section-label">{includeCoverLetter ? 'Resume Editor' : 'AI Result Editor'}</span>
            </div>
            <div className="flex items-center gap-2">
              {aiResult && (
                <>
                  <button
                    onClick={() => setAiResult('')}
                    className="btn h-7 px-3 text-[10.5px] transition-all duration-300"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    title="Clear"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                  <button
                    onClick={() => handleCopyText(aiResult, setCopiedResume)}
                    className={`btn h-7 px-3 text-[10.5px] transition-all duration-300 ${copiedResume ? 'btn-emerald' : ''}`}
                    style={!copiedResume ? { background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}}
                  >
                    {copiedResume ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedResume ? 'Copied!' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            value={aiResult}
            onChange={(e) => setAiResult(e.target.value)}
            placeholder="Paste your tailored Markdown resume here..."
            className="input-base input-emerald"
            style={{ minHeight: '140px' }}
          />
        </div>

        {/* Cover Letter Editor */}
        {includeCoverLetter && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
                  <Edit3 size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="section-label">Cover Letter Editor</span>
              </div>
              <div className="flex items-center gap-2">
                {aiCoverLetterResult && (
                  <>
                    <button
                      onClick={() => setAiCoverLetterResult('')}
                      className="btn h-7 px-3 text-[10.5px] transition-all duration-300"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                      title="Clear"
                    >
                      <Trash2 size={12} />
                      <span>Clear</span>
                    </button>
                    <button
                      onClick={() => handleCopyText(aiCoverLetterResult, setCopiedCoverLetter)}
                      className={`btn h-7 px-3 text-[10.5px] transition-all duration-300 ${copiedCoverLetter ? 'btn-accent' : ''}`}
                      style={!copiedCoverLetter ? { background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}}
                    >
                      {copiedCoverLetter ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCoverLetter ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={aiCoverLetterResult}
              onChange={(e) => setAiCoverLetterResult(e.target.value)}
              placeholder="Paste your tailored Cover Letter here..."
              className="input-base"
              style={{ minHeight: '140px' }}
            />
          </div>
        )}

        {/* Lead Extraction Editor */}
        {includeLeadExtraction && (
          <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '3px solid var(--indigo-500)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(79,70,229,0.1)' }}>
                  <UserCheck size={14} style={{ color: 'var(--indigo-600)' }} />
                </div>
                <span className="section-label">Lead Outreach Editor</span>
              </div>
              <div className="flex items-center gap-2">
                {leadAiResult && (
                  <>
                    <button
                      onClick={() => setLeadAiResult('')}
                      className="btn h-7 px-3 text-[10.5px] transition-all duration-300"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                      title="Clear"
                    >
                      <Trash2 size={12} />
                      <span>Clear</span>
                    </button>
                    <button 
                      onClick={handleProcessLead}
                      className="btn h-7 px-4 text-[10.5px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all animate-pulse"
                    >
                      <UserPlus size={12} />
                      Process & Save Lead
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={leadAiResult}
              onChange={(e) => setLeadAiResult(e.target.value)}
              placeholder="Paste the Lead Extraction results from your AI here..."
              className="input-base placeholder:text-indigo-200"
              style={{ minHeight: '130px', borderColor: 'rgba(79,70,229,0.2)' }}
            />
          </div>
        )}

        {/* Print Controls */}
        {(aiResult || aiCoverLetterResult) && (
          <div className="glass-card flex flex-col gap-4" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--emerald-soft)' }}>
                <Printer size={14} className="text-emerald-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Export Options</span>
            </div>

            <div className="flex flex-col gap-1.5 w-full max-w-sm mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest flex justify-between" style={{ color: !effectiveTitle ? 'var(--rose-500)' : 'var(--slate-500)' }}>
                <span>Save as PDF Name <span className="text-rose-500">*</span></span>
                {!effectiveTitle && <span className="text-rose-500 lowercase normal-case tracking-normal">Required for export</span>}
              </label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="e.g. Imran Khan - Senior QA Engineer"
                className={`input-base text-sm py-1.5 px-3 transition-colors ${!effectiveTitle ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200' : ''}`}
                style={{ height: '36px' }}
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handlePrint('resume')} className="btn btn-emerald h-9 px-4 text-xs" disabled={!aiResult || !effectiveTitle}><Printer size={14} />Save / Print Resume</button>
                {includeCoverLetter && (
                  <>
                    <button onClick={() => handlePrint('cover-letter')} className="btn btn-primary h-9 px-4 text-xs" disabled={!aiCoverLetterResult || !effectiveTitle}><Printer size={14} />Save / Print Cover Letter</button>
                    <button onClick={() => handlePrint('both')} className="btn text-white h-9 px-4 text-xs" style={{ background: 'linear-gradient(135deg, var(--emerald) 0%, var(--accent) 100%)' }} disabled={!aiResult || !aiCoverLetterResult || !effectiveTitle}><Printer size={14} />Export Combined PDF</button>
                  </>
                )}
              </div>
              {mode === 'ats' && (
                <div className="flex items-center gap-2.5 ml-auto no-print">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors ${!showVisualPreview ? 'text-emerald-600' : 'text-muted'}`}>ATS View</span>
                  <label className="switch">
                    <input type="checkbox" checked={showVisualPreview} onChange={(e) => setShowVisualPreview(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors ${showVisualPreview ? 'text-accent' : 'text-muted'}`}>Visual View</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10.5px] font-medium px-3 py-2 rounded-lg border w-fit" style={{ color: 'var(--emerald)', background: 'var(--emerald-soft)', borderColor: 'rgba(5,150,105,0.15)' }}>
              <Settings size={12} /> In the print dialog, choose <strong>&ldquo;Save as PDF&rdquo;</strong> and <strong>Margins: Default</strong>
            </div>
          </div>
        )}
      </div>

      {/* ── Live Document Previews ──────────────────── */}
      <div className="flex flex-col gap-8">
        {includeCoverLetter && (
          <div className="relative preview-cover-letter-container">
            <div className="absolute left-1/2 -top-3.5 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full shadow-sm no-print" style={{ borderColor: 'var(--border)' }}>
              <FileText size={10} color="#7c3aed" />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#7c3aed' }}>Cover Letter Live Preview</span>
            </div>
            <button onClick={() => setModalTarget('cover')} className="absolute top-6 right-6 z-20 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md border shadow-md flex items-center justify-center opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100 no-print text-[var(--accent)]" style={{ borderColor: 'var(--border)' }}><Maximize2 size={15} /></button>
            <div className="glass-card overflow-hidden print-preview-wrapper" style={{ padding: 'clamp(0.75rem, 2vw, 2rem)', background: 'rgba(0,0,0,0.06)' }}>
              <div id="cover-letter-print-area" className={`print-resume shadow-2xl w-full mx-auto overflow-hidden transition-all duration-500 bg-white text-black ${effectivePrintMode === 'ats' ? 'font-serif' : 'font-sans'}`} style={{ maxWidth: '8.5in', minHeight: '11in' }}>
                <div style={{ padding: 'clamp(0.5in, 4vw, 0.85in)', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>
                  <ReactMarkdown className="cover-letter-render">{aiCoverLetterResult || '### Cover Letter Preview\nYour generated content will render here.'}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="relative preview-resume-container">
          <div className="absolute left-1/2 -top-3.5 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full shadow-sm no-print" style={{ borderColor: 'var(--border)' }}>
            <FileText size={10} color="#059669" />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#059669' }}>Resume Live Preview</span>
          </div>
          <button onClick={() => setModalTarget('resume')} className="absolute top-6 right-6 z-20 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md border shadow-md flex items-center justify-center opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100 no-print text-[var(--emerald)]" style={{ borderColor: 'var(--border)' }}><Maximize2 size={15} /></button>
          <div className="glass-card overflow-hidden print-preview-wrapper" style={{ padding: 'clamp(0.75rem, 2vw, 2rem)', background: 'rgba(0,0,0,0.06)' }}>
            <div id="resume-print-area" className={`print-resume resume-sheet shadow-2xl w-full mx-auto overflow-hidden transition-all duration-500 bg-white text-black ${effectivePrintMode === 'ats' ? 'font-serif' : 'font-sans'}`} style={{ maxWidth: '8.5in', minHeight: '11in', position: 'relative' }}>
              {/* ── Profile Photo Overlay ── */}
              {includePhoto && (
                <img
                  src={activePhotoSrc}
                  alt="Profile"
                  className="profile-photo-overlay"
                />
              )}
              <div className="resume-content-pad">
                <ReactMarkdown className="markdown-render">{aiResult || '### Layout Preview\nYour generated content will render here.'}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Portal ────────────────────────────── */}
      {modalTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-opacity no-print" onClick={() => setModalTarget(null)}>
          <div className="w-full max-w-5xl h-full max-h-[95vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border" style={{ borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 px-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: modalTarget === 'cover' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(5, 150, 105, 0.15)', color: modalTarget === 'cover' ? '#7c3aed' : '#059669' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px]" style={{ color: '#000' }}>{modalTarget === 'cover' ? 'Cover Letter Preview' : 'Resume Preview'}</h3>
                </div>
              </div>
              <button onClick={() => setModalTarget(null)} className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-gray-100 transition-colors text-black"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center" style={{ background: 'rgba(0,0,0,0.04)' }}>
              <div className={`shrink-0 resume-sheet shadow-2xl w-full mx-auto bg-white text-black ${effectivePrintMode === 'ats' ? 'font-serif' : 'font-sans'}`} style={{ maxWidth: '8.5in', minHeight: '11in', position: 'relative' }}>
                 {modalTarget === 'cover' ? (
                   <div style={{ padding: 'clamp(0.5in, 4vw, 0.85in)' }}>
                     <ReactMarkdown className="cover-letter-render">{aiCoverLetterResult}</ReactMarkdown>
                   </div>
                 ) : (
                   <>
                     {/* ── Profile Photo in modal ── */}
                     {includePhoto && (
                       <img
                         src={activePhotoSrc}
                         alt="Profile"
                         className="profile-photo-overlay"
                       />
                     )}
                     <div className="resume-content-pad">
                       <ReactMarkdown className="markdown-render">{aiResult}</ReactMarkdown>
                     </div>
                   </>
                 )}
              </div>
            </div>
            <div className="p-4 px-6 flex justify-end gap-3 border-t bg-gray-50 text-black">
              <button onClick={() => setModalTarget(null)} className="btn bg-gray-200 hover:bg-gray-300 border border-gray-300 font-semibold h-9 px-6 text-xs text-black">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .switch { position: relative; display: inline-block; width: 32px; height: 18px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: var(--border); transition: .4s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--emerald); }
        input:checked + .slider:before { transform: translateX(14px); }
        .print-resume { font-variant-ligatures: common-ligatures; text-rendering: optimizeLegibility; border-radius: 0.5rem; }
        
        .resume-sheet {
          --resume-pad: clamp(0.4in, 3.2vw, 0.65in);
          --photo-size: ${activePhotoSize};
          --photo-radius: ${activePhotoRadius};
          --photo-border: ${activePhotoBorder};
          --photo-shadow: ${activePhotoShadow};
        }
        .resume-sheet .resume-content-pad {
          padding: var(--resume-pad);
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }
        .resume-sheet .profile-photo-overlay {
          position: absolute;
          top: calc(var(--resume-pad) + 40.5pt - var(--photo-size));
          right: var(--resume-pad);
          width: var(--photo-size);
          height: var(--photo-size);
          border-radius: var(--photo-radius);
          border: var(--photo-border);
          box-shadow: var(--photo-shadow);
          object-fit: cover;
          object-position: center top;
          z-index: 10;
          display: block;
          transform-origin: bottom right;
          transition: width 0.2s ease, height 0.2s ease, top 0.2s ease, border-radius 0.2s ease;
        }

        .markdown-render { color: #1e1b4b; }
        .markdown-render h1 { font-size: 24pt; margin-top: 0; margin-bottom: 2pt; line-height: 1.1; font-weight: 800; color: #1e1b4b; }
        .markdown-render h2 { font-size: 11pt; border-bottom: 1.5px solid #ede9fe; padding-bottom: 2pt; margin-top: 14pt; margin-bottom: 4pt; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #4c1d95; }
        .markdown-render h3 { font-size: 10.5pt; margin-top: 8pt; margin-bottom: 1pt; font-weight: 700; color: #1e1b4b; }
        .markdown-render h1 + h3 { margin-top: 2pt; margin-bottom: 2pt; line-height: 1.3; }
        .markdown-render p { font-size: 9.5pt; margin-bottom: 4pt; color: #374151; line-height: 1.5; }
        .markdown-render ul { margin-bottom: 6pt; padding-left: 14pt; list-style-type: disc; }
        .markdown-render li { font-size: 9.5pt; margin-bottom: 2pt; color: #374151; line-height: 1.45; }
        .markdown-render hr { border: none; border-top: 1px solid #ede9fe; margin: 8pt 0; }
        .markdown-render a { color: #7c3aed; text-decoration: none; }
        .cover-letter-render h1 { font-size: 20pt; font-weight: 800; color: #0f172a; margin: 0 0 4pt 0; }
        .cover-letter-render p { font-size: 10.5pt; margin-bottom: 10pt; color: #374151; line-height: 1.75; }
        .cover-letter-render hr { border: none; border-top: 1.5px solid #e2e8f0; margin: 12pt 0; }
        
        @media print {
          @page { size: A4; margin: 0; }
          header, .app-bg, .no-print { display: none !important; }
          .main-grid > div:first-child { display: none !important; }
          .main-grid { display: block !important; }
          .main-grid > div:last-child { display: block !important; }
          .print-preview-wrapper { background: transparent !important; border: none !important; padding: 0 !important; box-shadow: none !important; }
          
          #resume-print-area, #cover-letter-print-area {
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            transform: none !important;
            margin: 0 !important;
            background: white !important;
          }
          
          .resume-sheet {
            --resume-pad: 0.5in !important;
            --photo-size: ${activePhotoSize} !important;
            --photo-radius: ${activePhotoRadius} !important;
            --photo-border: ${activePhotoBorder} !important;
            --photo-shadow: ${activePhotoShadow} !important;
          }
          .resume-sheet .resume-content-pad {
            padding: 0.5in !important;
          }
          .resume-sheet .profile-photo-overlay {
            position: absolute !important;
            top: calc(0.5in + 40.5pt - var(--photo-size)) !important;
            right: 0.5in !important;
            width: var(--photo-size) !important;
            height: var(--photo-size) !important;
            border-radius: var(--photo-radius) !important;
            border: var(--photo-border) !important;
            box-shadow: var(--photo-shadow) !important;
            object-fit: cover !important;
            transform-origin: bottom right !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .preview-cover-letter-container { page-break-after: always; }
          div[data-print-target="resume"] .preview-cover-letter-container { display: none !important; }
          div[data-print-target="cover-letter"] .preview-resume-container { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
        }
      `}} />
    </div>
  );
};

export default PDFExport;
