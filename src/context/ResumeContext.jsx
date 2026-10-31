import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultResumes from '../config/defaults.json';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('resume-theme') || 'light');
  const [mode, setMode] = useState(localStorage.getItem('resume-mode') || 'visual');
  const [resumes, setResumes] = useState(() => {
    const saved = localStorage.getItem('resume-data');
    const savedVersion = parseInt(localStorage.getItem('resume-data-version') || '0', 10);
    const currentVersion = defaultResumes.version || 1;

    // If defaults.json was updated (version bumped), replace stale cache
    if (savedVersion < currentVersion) {
      localStorage.setItem('resume-data-version', String(currentVersion));
      localStorage.removeItem('resume-data');
      return { visual: defaultResumes.visual, ats: defaultResumes.ats };
    }

    if (saved) {
      const data = JSON.parse(saved);
      // Migrate legacy 'formatted' key to 'visual'
      if (data.formatted && !data.visual) {
        data.visual = data.formatted;
        delete data.formatted;
      }
      return data;
    }
    return { visual: defaultResumes.visual, ats: defaultResumes.ats };
  });
  
  const [jobDescription, setJobDescription] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(() =>
    localStorage.getItem('resume-include-photo') === 'true'
  );
  const [photoSize, setPhotoSize] = useState(() =>
    localStorage.getItem('resume-photo-size') || 'md'
  );
  const [photoShape, setPhotoShape] = useState(() =>
    localStorage.getItem('resume-photo-shape') || 'rounded'
  );
  const [photoBorder, setPhotoBorder] = useState(() =>
    localStorage.getItem('resume-photo-border') || 'subtle'
  );
  const [customPhoto, setCustomPhoto] = useState(() => {
    return localStorage.getItem('resume-custom-photo') || null;
  });
  
  // NEW: Lead Hub State
  const [includeLeadExtraction, setIncludeLeadExtraction] = useState(() => {
    return localStorage.getItem('resume-include-lead') === 'true';
  });
  
  const [aiCoverLetterResult, setAiCoverLetterResult] = useState('');
  const [leadAiResult, setLeadAiResult] = useState('');
  
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('resume-contacts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('resume-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('resume-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('resume-data', JSON.stringify(resumes));
  }, [resumes]);

  useEffect(() => {
    localStorage.setItem('resume-include-lead', String(includeLeadExtraction));
  }, [includeLeadExtraction]);

  useEffect(() => {
    localStorage.setItem('resume-include-photo', String(includePhoto));
  }, [includePhoto]);

  useEffect(() => {
    localStorage.setItem('resume-photo-size', photoSize);
  }, [photoSize]);

  useEffect(() => {
    localStorage.setItem('resume-photo-shape', photoShape);
  }, [photoShape]);

  useEffect(() => {
    localStorage.setItem('resume-photo-border', photoBorder);
  }, [photoBorder]);

  useEffect(() => {
    if (customPhoto) {
      try {
        localStorage.setItem('resume-custom-photo', customPhoto);
      } catch (e) {
        console.warn('Custom photo too large for localStorage', e);
      }
    } else {
      localStorage.removeItem('resume-custom-photo');
    }
  }, [customPhoto]);

  useEffect(() => {
    localStorage.setItem('resume-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const updateResume = (type, content) => {
    setResumes(prev => ({ ...prev, [type]: content }));
  };

  const addContact = (contact) => {
    setContacts(prev => {
      // Basic deduplication by email
      if (prev.some(c => c.email.toLowerCase() === contact.email.toLowerCase())) return prev;
      return [contact, ...prev];
    });
  };

  const removeContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const resetPhoto = () => {
    setCustomPhoto(null);
  };

  return (
    <ResumeContext.Provider value={{
      theme, setTheme,
      mode, setMode,
      resumes, updateResume,
      jobDescription, setJobDescription,
      aiResult, setAiResult,
      includeCoverLetter, setIncludeCoverLetter,
      includeLeadExtraction, setIncludeLeadExtraction,
      aiCoverLetterResult, setAiCoverLetterResult,
      leadAiResult, setLeadAiResult,
      contacts, setContacts, addContact, removeContact,
      includePhoto, setIncludePhoto,
      photoSize, setPhotoSize,
      photoShape, setPhotoShape,
      photoBorder, setPhotoBorder,
      customPhoto, setCustomPhoto, resetPhoto,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => useContext(ResumeContext);
