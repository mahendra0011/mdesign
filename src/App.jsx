import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ShowcaseSection from './components/ShowcaseSection';
import ResponsiveSection from './components/ResponsiveSection';
import EcosystemSection from './components/EcosystemSection';
import Footer from './components/Footer';
import PromptWorkspace from './components/PromptWorkspace';
import AuthPage from './pages/AuthPage';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative w-full min-h-screen bg-[#fdfdfd]">
      {isHome && (
        <div className="absolute top-0 left-0 w-full z-[100]">
          <Navbar />
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<><Hero /><EcosystemSection /><HowItWorks /><ShowcaseSection /><ResponsiveSection /><Footer /></>} />
        <Route path="/design" element={<PromptWorkspace />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </div>
  );
}

export default App;
