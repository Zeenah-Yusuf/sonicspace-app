import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Studio from './pages/Studio';
import { Globe2, UploadCloud } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="flex justify-center gap-8 py-6 border-b border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
      <Link 
        to="/" 
        className={`flex items-center gap-2 font-semibold transition-colors ${location.pathname === '/' ? 'text-purple-400' : 'text-zinc-400 hover:text-white'}`}
      >
        <Globe2 size={20} /> Jukebox
      </Link>
      <Link 
        to="/studio" 
        className={`flex items-center gap-2 font-semibold transition-colors ${location.pathname === '/studio' ? 'text-purple-400' : 'text-zinc-400 hover:text-white'}`}
      >
        <UploadCloud size={20} /> Audio Studio
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio" element={<Studio />} />
      </Routes>
    </Router>
  );
}