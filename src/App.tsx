import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>

        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
};

export default App;
