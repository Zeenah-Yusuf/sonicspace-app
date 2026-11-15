// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import Home from './pages/Home';
// import Studio from './pages/Studio';
// import { Globe2, UploadCloud } from 'lucide-react';

// function Navigation() {
//   const location = useLocation();
  
//   return (
//     <nav className="flex justify-center gap-8 py-6 border-b border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
//       <Link 
//         to="/" 
//         className={`flex items-center gap-2 font-semibold transition-colors ${location.pathname === '/' ? 'text-purple-400' : 'text-zinc-400 hover:text-white'}`}
//       >
//         <Globe2 size={20} /> Jukebox
//       </Link>
//       <Link 
//         to="/studio" 
//         className={`flex items-center gap-2 font-semibold transition-colors ${location.pathname === '/studio' ? 'text-purple-400' : 'text-zinc-400 hover:text-white'}`}
//       >
//         <UploadCloud size={20} /> Audio Studio
//       </Link>
//     </nav>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <Navigation />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/studio" element={<Studio />} />
//       </Routes>
//     </Router>
//   );
// }

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

// On route change: reset scroll and update the document title (screen readers use it).
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      pathname === "/studio" ? "Audio Studio | SonicSpace" : "SonicSpace: Hear the planet change";
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <RouteEffects />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to main content
      </a>
      <Navigation />
      <main id="main" tabIndex={-1} className="outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}