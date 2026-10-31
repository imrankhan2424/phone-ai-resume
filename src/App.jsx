import React from 'react';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import { ResumeProvider } from './context/ResumeContext';

function App() {
  return (
    <ResumeProvider>
      {/* Animated gradient background orbs */}
      <div className="app-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="min-h-screen bg-transparent">
        <Header />
        <MainLayout />
      </div>
    </ResumeProvider>
  );
}

export default App;
