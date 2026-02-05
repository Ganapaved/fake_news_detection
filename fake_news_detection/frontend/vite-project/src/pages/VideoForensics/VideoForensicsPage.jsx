import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Video, 
  Film, 
  AlertCircle,
  Play, 
  Pause, 
  Volume2, 
  Aperture, 
  Clock, 
  Mic2, 
  FileWarning,
  Activity,
  Scan,
  Loader2,
  CheckCircle,
  Shield,
  HelpCircle,
  AlertTriangle,
  Brain
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// Reusable Components
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

const Badge = ({ children, color = "zinc" }) => {
  const colors = {
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
    red: "bg-rose-900/30 text-rose-400 border-rose-700/50",
    green: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    cyan: "bg-cyan-900/30 text-cyan-400 border-cyan-700/50",
    yellow: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
    blue: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-mono border ${colors[color] || colors.zinc}`}>
      {children}
    </span>
  );
};

const TerminalLoading = ({ message }) => (
  <div className="h-96 flex flex-col items-center justify-center bg-black border border-zinc-800 rounded-xl font-mono">
     <div className="w-full max-w-lg space-y-4 p-8">
        <div className="flex justify-between text-xs text-cyan-500 mb-2">
           <span>SYSTEM_STATUS</span>
           <span>PROCESSING</span>
        </div>
        <div className="h-1 bg-zinc-900 rounded overflow-hidden">
           <motion.div 
             className="h-full bg-cyan-500"
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 2, repeat: Infinity }}
           />
        </div>
        <div className="text-zinc-300 text-sm">
           <span className="text-emerald-500 mr-2">➜</span>
           {message}
        </div>
     </div>
  </div>
);

export default function VideoForensicsPage() {
  return (
    <>
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Video Forensics</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-200">Deepfake Detection</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <VideoAnalysisDashboard />
        </div>
      </div>
    </>
  );
}

// --- Video Forensic Dashboard ---

function VideoAnalysisDashboard() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing video analysis...");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setResult(null); 
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setAnalyzing(true);
    setResult(null);
    setLoadingMessage("Uploading and extracting transcript (Whisper AI)...");

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      // Simulate step updates
      setTimeout(() => setLoadingMessage("Generating verification questions..."), 3000);
      setTimeout(() => setLoadingMessage("Analyzing content authenticity..."), 8000);

      const response = await fetch(`${API_BASE}/video_verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Video analysis failed');

      const data = await response.json();
      
      // Calculate verdict locally as per user snippet logic
      const answers = Array.isArray(data.verdict) ? data.verdict : [];
      const fakeCount = answers.filter(a => a.supports_fake === true).length;
      let realCount = answers.filter(a => a.supports_fake === false).length;
      const nullCount = answers.filter(a => a.supports_fake === null).length;
      // Adjust real count slightly (logic from snippet: realCount = realCount + nullCount - 2)
      // This logic seems a bit arbitrary but I will preserve it carefully.
      // Wait, snippet says: realCount = realCount + nullCount - 2
      const adjustedRealCount = realCount + nullCount - 2;

      let classification = "UNCERTAIN";
      if (fakeCount > adjustedRealCount) classification = "FAKE";
      else if (adjustedRealCount > fakeCount) classification = "REAL";

      const totalRelevant = Math.max(1, answers.length); // Avoid division by zero
      const confidence = Math.round((Math.max(fakeCount, adjustedRealCount) / totalRelevant) * 100);

      const calculatedVerdict = {
        classification,
        confidence: Math.max(0, Math.min(100, confidence)), // Clamp 0-100
        key_reasons: [
          `Total checks performed: ${answers.length}`,
          `Indicators supporting genuine: ${realCount}`,
          `Indicators supporting manipulation: ${fakeCount}`
        ]
      };

      setResult({
        ...data,
        answers: answers,
        calculatedVerdict
      });

    } catch (error) {
      console.error('Error:', error);
      alert('Video analysis failed. Please ensure the backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!videoFile && !analyzing) {
    return (
      <ForensicCard title="Video Input Stream" icon={Film} className="h-96 flex flex-col items-center justify-center">
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileUpload}
          className="hidden" 
          id="video-upload" 
        />
        <label htmlFor="video-upload" className="cursor-pointer text-center group">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 group-hover:border-cyan-500 transition-colors">
            <Video className="w-10 h-10 text-zinc-500 group-hover:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-300">Upload Video Footage</h3>
          <p className="text-zinc-500 text-sm mt-2 max-w-sm">
            Supports MP4, MOV, AVI. Use for Deepfake Verification.
          </p>
        </label>
      </ForensicCard>
    );
  }

  if (analyzing) {
    return <TerminalLoading message={loadingMessage} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* 1. Video Player & Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden relative group">
              <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
                 {videoPreview ? (
                   <video 
                     src={videoPreview} 
                     controls 
                     className="w-full h-full object-contain"
                   />
                 ) : (
                   <Film className="w-16 h-16 text-zinc-800" />
                 )}
                 
                 {/* Decorative Overlay */}
                 <div className="absolute top-4 right-4 flex gap-2 pointer-events-none">
                    <Badge color="zinc">LIVE FEED</Badge>
                 </div>
              </div>
           </div>
           
           <div className="mt-4 flex justify-between items-center">
             <div className="text-sm text-zinc-400 font-mono">
                {videoFile ? videoFile.name : "Unknown Source"}
             </div>
             <div className="flex gap-4">
                 <button 
                   onClick={() => { setVideoFile(null); setResult(null); setVideoPreview(null); }}
                   className="text-xs text-zinc-500 hover:text-cyan-500 transition-colors flex items-center gap-1"
                 >
                   <Scan className="w-3 h-3" />
                   New Analysis
                 </button>
                 {!result && (
                    <button
                        onClick={handleAnalyze}
                        className="bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/50 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all"
                    >
                        Initiate Verification
                    </button>
                 )}
             </div>
           </div>
        </div>

        <div className="lg:col-span-1 h-full">
            {result ? (
                <VideoVerdictCard verdict={result.calculatedVerdict} />
            ) : (
                <div className="h-full bg-zinc-900/30 border border-zinc-800 rounded-xl flex items-center justify-center p-6 text-center">
                    <p className="text-zinc-500 text-sm">Upload a video and click "Initiate Verification" to see authenticity results.</p>
                </div>
            )}
        </div>
      </div>

        {/* 2. Analysis Results */}
        {result && (
            <VerificationAnalysis answers={result.answers} />
        )}

    </motion.div>
  );
}

// --- Video Specific Sub-Components ---

function VideoVerdictCard({ verdict }) {
   const isFake = verdict.classification === 'FAKE';
   const isUncertain = verdict.classification === 'UNCERTAIN';
   
   let colorClass = 'text-emerald-500';
   let borderClass = 'border-emerald-500/30 bg-emerald-950/10';
   
   if (isFake) {
       colorClass = 'text-rose-500';
       borderClass = 'border-rose-500/30 bg-rose-950/10';
   } else if (isUncertain) {
       colorClass = 'text-yellow-500';
       borderClass = 'border-yellow-500/30 bg-yellow-950/10';
   }

   return (
     <div className={`h-full flex flex-col justify-between p-6 rounded-xl border-2 relative overflow-hidden ${borderClass}`}>
        <div>
           <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">Integrity Verdict</h3>
           <div className={`text-4xl font-black ${colorClass}`}>
              {verdict.classification}
           </div>
           <div className="text-white font-mono text-xl mt-1">
              {verdict.confidence}% <span className="text-sm text-zinc-500">Confidence</span>
           </div>
        </div>

        {/* Reasoning Bullets */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
           {verdict.key_reasons.map((point, i) => (
              <div key={i} className="flex gap-2 text-xs text-zinc-400">
                 <span className={colorClass}>•</span>
                 {point}
              </div>
           ))}
        </div>
        
        {verdict.recommendation && (
            <div className="mt-4 p-3 bg-zinc-950/50 rounded text-xs text-zinc-400 italic">
                {verdict.recommendation}
            </div>
        )}
     </div>
   )
}

function VerificationAnalysis({ answers }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const getPerspective = (q = '') => {
        if (q.includes("SKEPTIC")) return "SKEPTIC";
        if (q.includes("DEFENDER")) return "DEFENDER";
        if (q.includes("NEUTRAL")) return "NEUTRAL";
        return "Info";
    };

    const colors = {
        SKEPTIC: "text-rose-400 border-rose-500/20 bg-rose-500/10",
        DEFENDER: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
        NEUTRAL: "text-blue-400 border-blue-500/20 bg-blue-500/10",
        Info: "text-zinc-400 border-zinc-500/20 bg-zinc-500/10",
    };

    return (
        <ForensicCard title="Verification Analysis Log" icon={Activity}>
            <div className="space-y-3">
                {answers.map((item, index) => {
                    const perspective = getPerspective(item.question);
                    const isExpanded = expandedIndex === index;
                    const badgeColor = colors[perspective] || colors.Info;

                    return (
                        <div key={index} className="bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden transition-all">
                            <button
                                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                className="w-full p-4 text-left flex justify-between items-start gap-4 hover:bg-zinc-800/30 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeColor}`}>
                                            {perspective}
                                        </span>
                                        {item.confidence !== undefined && (
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                CONF: {item.confidence}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-300 font-medium leading-snug">
                                        {item.question}
                                    </p>
                                </div>
                                <div>
                                    {item.supports_fake === false && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                    {item.supports_fake === true && <AlertTriangle className="w-5 h-5 text-rose-500" />}
                                    {item.supports_fake === null && <HelpCircle className="w-5 h-5 text-zinc-600" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-zinc-800/50 bg-zinc-950/30"
                                    >
                                        <div className="p-4 text-sm text-zinc-400 leading-relaxed font-mono">
                                            <span className="text-zinc-600 mr-2">ANALYSIS:</span>
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </ForensicCard>
    );
}
