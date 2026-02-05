import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Video,
  Menu,
  Search,
  Home
} from 'lucide-react';
import './App.css';

// Import page components
import HomePage from './pages/Home/HomePage';
import InvestigationPage from './pages/Investigation/InvestigationPage';
import VideoForensicsPage from './pages/VideoForensics/VideoForensicsPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/investigation', icon: Search, label: 'Investigation' },
    { path: '/video-forensics', icon: Video, label: 'Video Forensics' }
  ];

  // Hide sidebar on home page for cleaner look
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-cyan-500/30 flex overflow-hidden">
      
      {/* Sidebar Navigation - Hidden on Home Page */}
      {!isHomePage && (
        <motion.aside 
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 80 }}
          className="bg-zinc-950 border-r border-zinc-800 flex flex-col z-20"
        >
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <Brain className="w-6 h-6 text-cyan-500 shrink-0" />
            {sidebarOpen && (
              <span className="ml-3 font-bold text-lg bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent truncate">
                TruthLab
              </span>
            )}
          </div>

          <nav className="flex-1 py-6 px-3 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.path}
                expanded={sidebarOpen}
                onClick={() => navigate(item.path)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800">
             <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 transition-colors"
             >
               <Menu className="w-5 h-5" />
             </button>
          </div>
        </motion.aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/investigation" element={<InvestigationPage />} />
            <Route path="/video-forensics" element={<VideoForensicsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon: Icon, label, active, expanded, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
      active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
    }`}
  >
    <Icon className="w-5 h-5 shrink-0" />
    {expanded && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
  </button>
);

export default App;