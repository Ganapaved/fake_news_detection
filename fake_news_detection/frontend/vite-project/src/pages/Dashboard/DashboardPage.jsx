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
  Search,
  Activity,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE = 'http://localhost:8000';

// Reusable Card Component for Consistency
const ForensicCard = ({ children, title, icon: Icon, className = "", border = "border-zinc-800" }) => (
  <div className={`bg-zinc-900/50 backdrop-blur-md rounded-xl border ${border} overflow-hidden flex flex-col ${className}`}>
    <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/80">
      {Icon && <Icon className="w-4 h-4 text-cyan-500" />}
      <h3 className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">{title}</h3>
    </div>
    <div className="p-5 flex-1 relative">
      {children}
    </div>
  </div>
);

export default function DashboardPage() {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const loadingMessages = [
    'Initializing forensic analysis...',
    'Scanning image artifacts...',
    'Calculating SHAP text impact...',
    'Analyzing visual attention patterns...',
    'Cross-referencing with web sources...',
    'Compiling evidence report...'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image) return;

    setLoading(true);
    setResult(null);
    setAiSummary(null);

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setLoadingMessage(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 1000);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', image);

      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Analysis failed. Please ensure the backend is running.');
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateAISummary = async () => {
    if (!result) return;
    setGeneratingAI(true);
    try {
      const response = await fetch(`${API_BASE}/ai_summarise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence: result }),
      });
      if (!response.ok) throw new Error('AI summary generation failed');
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      alert('AI summary generation failed');
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Case Files</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-200">New Investigation</span>
          {result && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-cyan-400">Analysis Complete</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Input Section */}
            <div className="xl:col-span-4 space-y-6">
              <InputPanel 
                title={title} 
                setTitle={setTitle} 
                imagePreview={imagePreview} 
                handleImageChange={handleImageChange} 
                handleSubmit={handleSubmit}
                loading={loading}
              />
              
              {result && (
                <WebVerificationCard sources={result.web_sources} />
              )}
            </div>

            {/* Results Section */}
            <div className="xl:col-span-8">
              <AnimatePresence mode="wait">
                {loading && <TerminalLoading message={loadingMessage} key="loading" />}
                
                {!loading && !result && <EmptyState key="empty" />}
                
                {!loading && result && (
                  <ResultsDashboard 
                    result={result} 
                    imagePreview={imagePreview}
                    aiSummary={aiSummary}
                    generatingAI={generatingAI}
                    onGenerateAI={handleGenerateAISummary}
                    key="results"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ... (Include all the component functions from the original App.jsx: InputPanel, ResultsDashboard, VerdictCard, etc.)
// For brevity, I'll include just the key ones here. The full file would have all components.

function InputPanel({ title, setTitle, imagePreview, handleImageChange, handleSubmit, loading }) {
  return (
    <ForensicCard title="Data Ingestion" icon={Scan} className="sticky top-0">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-mono text-cyan-500 mb-2 block uppercase">Target Headline</label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/40 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono text-sm"
            rows="3"
            placeholder="Paste news headline here..."
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-xs font-mono text-cyan-500 mb-2 block uppercase">Evidence Image</label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              required
              disabled={loading}
            />
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center w-full h-48 border border-dashed rounded-lg cursor-pointer transition-all overflow-hidden relative ${
                imagePreview ? 'border-zinc-700' : 'border-zinc-700 hover:border-cyan-500/50 bg-black/20 hover:bg-black/40'
              }`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur">Click to change source</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400" />
                  </div>
                  <p className="text-sm text-zinc-400">Drop evidence file or <span className="text-cyan-500">browse</span></p>
                </div>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !imagePreview}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
          {loading ? 'RUNNING FORENSICS...' : 'INITIATE ANALYSIS'}
        </button>
      </form>
    </ForensicCard>
  );
}

// Add remaining components here (ResultsDashboard, VerdictCard, etc.)
// ... [Include all other component functions from original App.jsx]
