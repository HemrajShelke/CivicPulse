import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import MapPage from './pages/MapPage';
import Leaderboard from './pages/Leaderboard';
import Squads from './pages/Squads';
import IssueDetail from './pages/IssueDetail';
import AdminPortal from './pages/AdminPortal';
import ProtectedRoute from './components/ProtectedRoute';
import Navi from './components/Navi';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import { useState, useEffect } from 'react';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <Router>
      <CustomCursor />
      
      <AnimatePresence mode="wait">
        {showLoader ? (
          <LoadingScreen onComplete={() => setShowLoader(false)} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#050d0a] text-text-primary selection:bg-[#00FF88]/20 selection:text-[#00FF88]"
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/report" element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              } />
              
              <Route path="/squads" element={
                <ProtectedRoute>
                  <Squads />
                </ProtectedRoute>
              } />
              
              <Route path="/issue/:id" element={<IssueDetail />} />
              <Route path="/admin" element={<AdminPortal />} />
            </Routes>
            
            {/* Global AI companion Navi */}
            <Navi />
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
}
