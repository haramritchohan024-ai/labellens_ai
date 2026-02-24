import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Scan from './pages/Scan';
import Results from './pages/Results';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Reports from './pages/Reports';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Preferences from './pages/Preferences'; // Added this import
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 font-sans">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/results" element={<Results />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />

              {/* Public ledgers */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/reports" element={<Reports />} />

              {/* Protected User Routes */}
              <Route path="/history" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <History />
                </ProtectedRoute>
              } />

              <Route path="/history/:id" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <HistoryDetail />
                </ProtectedRoute>
              } />

              <Route path="/preferences" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <Preferences />
                </ProtectedRoute>
              } />

              {/* Protected Admin Routes */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
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
    </AuthProvider>
  );
}

export default App;
