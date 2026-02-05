import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Eye,
  Globe,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Brain,
  Scan,
  ExternalLink,
  Loader2,
  LayoutDashboard,
  Video,
  Menu,
  ShieldAlert,
  Search,
  Activity,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css';

// Import Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import InvestigationPage from './pages/Investigation/InvestigationPage';
import VideoForensicsPage from './pages/VideoForensics/VideoForensicsPage';
import LiveMonitorPage from './pages/LiveMonitor/LiveMonitorPage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/investigation', icon: Search, label: 'Investigation' },
    { path: '/video-forensics', icon: Video, label: 'Video Forensics' },
    { path: '/live-monitor', icon: Activity, label: 'Live Monitor' }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-cyan-500/30 flex overflow-hidden">
      
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/investigation" element={<InvestigationPage />} />
          <Route path="/video-forensics" element={<VideoForensicsPage />} />
          <Route path="/live-monitor" element={<LiveMonitorPage />} />
        </Routes>
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
