import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Scan from './pages/Scan';
import Results from './pages/Results';
import History from './pages/History';
import About from './pages/About';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        {/* Desktop Footer */}
        <footer className="hidden md:block bg-white border-t border-gray-100 py-12 mt-20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} LabelLens AI. Made with 🥬 for healthier choices.
            </p>
          </div>
        </footer>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
