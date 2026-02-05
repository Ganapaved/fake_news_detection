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
  ShieldAlert,
  Search,
  Activity,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../../App.css';

const API_BASE = 'http://localhost:8000';

const ForensicCard = ({ children, title, icon: Icon, className = "", border = "border-zinc-800", headerAction }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-zinc-900/40 backdrop-blur-sm rounded-xl border ${border} overflow-hidden flex flex-col ${className}`}
  >
    <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/60">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-cyan-500" />}
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase font-mono">{title}</h3>
      </div>
      {headerAction}
    </div>
    <div className="p-5 flex-1 relative">
      {children}
    </div>
  </motion.div>
);

const Badge = ({ children, color = "cyan" }) => {
    const colors = {
      cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      zinc: "bg-zinc-800 text-zinc-400 border-zinc-700",
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase border rounded ${colors[color]}`}>
        {children}
      </span>
    );
};

export default function InvestigationPage() {
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
          <span>Text & Image Investigation</span>
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

      {/* Content */}
      <div className="p-8">
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

// ... All helper components from previous file ...

// --- Helper Component Definitions to ensure file is self-contained ---

function InputPanel({ title, setTitle, imagePreview, handleImageChange, handleSubmit, loading }) {
    return (
      <ForensicCard title="Data Ingestion" icon={Scan} className="">
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

function ResultsDashboard({ result, imagePreview, aiSummary, generatingAI, onGenerateAI }) {
    const [activeTab, setActiveTab] = useState('multimodal');
  
    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800">
           <button 
             onClick={() => setActiveTab('multimodal')}
             className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'multimodal' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
           >
              <LayoutDashboard className="w-4 h-4" />
              Multi-Modal Forensics
           </button>

        </div>
  
        {activeTab === 'multimodal' && (
          <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
          >
              {/* Top Level Verdict - The HUD */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                      <VerdictCard result={result} />
                  </div>
                  <div className="md:col-span-4">
                      <ComponentVerdictsCard result={result} />
                  </div>
              </div>
  
              {/* Deep Dive Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TextForensicsCard result={result} />
                  <VisualAttentionCard result={result} imagePreview={imagePreview} />
              </div>
  
              {/* Fusion & Reasoning */}
               {result.fusion_reasoning && (
                  <FusionReasoningCard result={result} />
               )}
  
              {/* Report Gen */}
              <AISummaryCard 
                  aiSummary={aiSummary}
                  generatingAI={generatingAI}
                  onGenerate={onGenerateAI}
              />
          </motion.div>
        )}
      </div>
    );
}

function VerdictCard({ result }) {
    const isFake = result.prediction === 'FAKE';
    const confidence = (result.confidence * 100).toFixed(1);
    const colorClass = isFake ? 'text-rose-500' : 'text-emerald-500';
    const bgClass = isFake ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30';
    const glowClass = isFake ? 'shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.2)]';
  
    return (
      <div className={`relative h-full rounded-xl border p-8 overflow-hidden flex flex-col justify-between ${bgClass} ${glowClass}`}>
         <div className="absolute top-0 right-0 p-4 opacity-20">
            {isFake ? <ShieldAlert className="w-32 h-32" /> : <CheckCircle className="w-32 h-32" />}
         </div>
  
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`w-5 h-5 ${colorClass}`} />
              <span className="text-zinc-400 text-sm font-mono uppercase tracking-widest">Final System Verdict</span>
            </div>
            
            <h2 className={`text-6xl font-black tracking-tighter mb-1 ${colorClass}`}>
               {result.prediction}
            </h2>
            <div className="flex items-end gap-2 text-zinc-400">
               <span className="text-2xl font-mono text-white">{confidence}%</span>
               <span className="mb-1 text-sm">Confidence Level</span>
            </div>
         </div>
  
         <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 block uppercase">Claim Type</span>
              <span className="text-sm font-medium text-cyan-400 uppercase">{result.claim_type}</span>
            </div>
            
            {result.override_applied && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-500 text-xs font-mono">
                   <AlertTriangle className="w-3 h-3" />
                   MANUAL OVERRIDE ACTIVE
                </div>
            )}
         </div>
      </div>
    );
}

function ComponentVerdictsCard({ result }) {
    const { component_verdicts } = result;
    if (!component_verdicts) return null;
  
    return (
      <ForensicCard title="Model Consensus" icon={Brain} className="h-full">
        <div className="space-y-4">
          <ModelRow label="NLP Transformer" verdict={component_verdicts.muril} />
          <ModelRow label="Computer Vision" verdict={component_verdicts.image} />
          {component_verdicts.forensic && (
             <ModelRow label="Web Forensics" verdict={component_verdicts.forensic} />
          )}
        </div>
      </ForensicCard>
    );
}

function ModelRow({ label, verdict }) {
    const isFake = verdict.label === 'FAKE';
    const width = `${(verdict.confidence * 100).toFixed(0)}%`;
    
    return (
      <div className="bg-black/20 rounded p-3 border border-white/5">
         <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
            <span className={`text-xs font-bold ${isFake ? 'text-rose-400' : 'text-emerald-400'}`}>{verdict.label}</span>
         </div>
         <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width }}
               className={`h-full ${isFake ? 'bg-rose-500' : 'bg-emerald-500'}`}
             />
         </div>
         <div className="text-right mt-1">
             <span className="text-[10px] font-mono text-zinc-500">{width} CONFIDENCE</span>
         </div>
      </div>
    );
}

function TextForensicsCard({ result }) {
    const highlightedText = result.shap_insights?.frontend_display?.highlighted_text || [];
  
    return (
      <ForensicCard title="Linguistic SHAP Analysis" icon={FileText} className="h-full">
        <div className="bg-black border border-zinc-800 rounded p-4 font-serif text-lg leading-loose text-zinc-300 h-64 overflow-y-auto scrollbar-thin">
          {highlightedText.length > 0 ? (
            <div className="flex flex-wrap gap-x-1.5 gap-y-1">
              {highlightedText.map((segment, index) => {
                const isFake = segment.type === 'fake';
                const opacity = Math.max(0.1, Math.min(segment.color_intensity, 1));
                const style = isFake 
                  ? { backgroundColor: `rgba(244, 63, 94, ${opacity})` }
                  : { backgroundColor: `rgba(16, 185, 129, ${opacity})` };
  
                return (
                  <span
                    key={index}
                    className={`px-1 rounded cursor-help transition-all hover:brightness-125 kannada-text relative group`}
                    style={style}
                  >
                    {segment.text}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black border border-zinc-700 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-sans">
                       Impact: {segment.impact.toFixed(3)}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-600 italic">{result.title}</p>
          )}
        </div>
        
        <div className="mt-4 flex gap-4 text-xs font-mono text-zinc-500">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500/50 rounded"></div>
              <span>Fabrication Signal</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500/50 rounded"></div>
              <span>Authenticity Signal</span>
           </div>
        </div>
      </ForensicCard>
    );
}

function VisualAttentionCard({ result, imagePreview }) {
    const getGradCamurl = () =>{
      if(!result.image_analysis?.file) return imagePreview
      const basename = result.image_analysis.file.split('/').pop()
      const gradcamfilename = `${basename}`
      return `${API_BASE}/${gradcamfilename}`;
    }
    const heatmapUrl = getGradCamurl();
  
    return (
      <ForensicCard title="Visual Artifact Detection (GradCAM)" icon={Eye} className="h-full">
         <div className="relative rounded bg-black border border-zinc-800 overflow-hidden group">
            <img
              src={heatmapUrl}
              alt="Analysis"
              className="w-full h-64 object-contain"
              onError={(e) => { e.target.src = imagePreview; }}
            />
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 border-2 border-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <div className="absolute top-0 left-0 p-2 bg-black/50 text-cyan-500 text-[10px] font-mono">CAM_LAYER_04</div>
            </div>
         </div>
  
         <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-center">
               <div className="text-[10px] text-zinc-500 uppercase">Attention Score</div>
               <div className="text-xl font-mono text-cyan-400">{(result.image_analysis?.attention_score || 0).toFixed(2)}</div>
            </div>
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-center col-span-2 flex flex-col justify-center">
               <div className="text-[10px] text-zinc-500 uppercase mb-1">Interpretation</div>
               <div className="text-xs text-zinc-300 truncate leading-tight">
                  {result.image_analysis?.interpretation || 'Processing visual data...'}
               </div>
            </div>
         </div>
      </ForensicCard>
    );
}

function WebVerificationCard({ sources }) {
    return (
      <div className="bg-zinc-900/30 rounded-lg border border-zinc-800 p-4">
         <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Cross-Check Sources
            </h4>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{sources?.length || 0} Matches</span>
         </div>
         
         <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
           {sources && sources.length > 0 ? sources.map((source, index) => (
              <a 
                key={index}
                href={source.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black/40 hover:bg-zinc-800 p-3 rounded border border-zinc-800/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                   <p className="text-sm text-zinc-300 font-medium truncate w-[90%] group-hover:text-cyan-400 transition-colors">{source.title}</p>
                   <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-cyan-500" />
                </div>
                <p className="text-xs text-zinc-500 mt-1 truncate">{source.snippet}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   Verified Domain
                </div>
              </a>
           )) : (
              <div className="text-center py-6 text-zinc-600 text-sm">No external corroboration found.</div>
           )}
         </div>
      </div>
    );
}

function FusionReasoningCard({ result }) {
    if (!result.fusion_reasoning || result.fusion_reasoning.length === 0) return null;
    return (
        <ForensicCard title="Logic Fusion Engine" icon={Activity} border="border-indigo-500/20">
            <div className="space-y-3">
                {result.fusion_reasoning.map((reason, index) => (
                    <div key={index} className="flex gap-3 items-start">
                        <span className="font-mono text-indigo-500 text-xs mt-1">[{index + 1}]</span>
                        <p className="text-zinc-300 text-sm leading-relaxed">{reason}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                <span className="text-xs font-mono text-zinc-500">
                    DECISION_SOURCE :: <span className="text-indigo-400">{result.fusion_source}</span>
                </span>
            </div>
        </ForensicCard>
    )
}

function AISummaryCard({ aiSummary, generatingAI, onGenerate }) {
    return (
        <ForensicCard title="Investigative Report (LLM)" icon={Sparkles} className={`transition-all ${aiSummary ? 'ring-1 ring-cyan-500/30' : ''}`}>
             {!aiSummary ? (
                 <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-zinc-500 text-sm mb-4 text-center max-w-md">
                        Generate a comprehensive natural language report synthesizing all forensic vectors.
                    </p>
                    <button
                        onClick={onGenerate}
                        disabled={generatingAI}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        GENERATE REPORT
                    </button>
                 </div>
             ) : (
                <div className="bg-black/20 p-6 rounded-lg border border-white/5 font-sans">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-2 font-mono uppercase tracking-tight" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4 flex items-center gap-2 border-l-4 border-cyan-500 pl-3 uppercase tracking-wide" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-400 mt-6 mb-3 uppercase tracking-wider font-mono" {...props} />,
                            p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-zinc-300 text-sm" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-6 text-zinc-400 ml-2 bg-zinc-900/30 p-4 rounded border border-zinc-800/50" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1 text-sm leading-relaxed marker:text-cyan-500" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-rose-500 pl-4 italic text-zinc-500 my-4 bg-rose-500/5 py-2 pr-2 rounded-r" {...props} />,
                        }}
                    >
                        {aiSummary}
                    </ReactMarkdown>
                </div>
             )}
        </ForensicCard>
    )
}

function TerminalLoading({ message }) {
  return (
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
             <span className="animate-pulse">_</span>
          </div>
          
          <div className="mt-8 grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="h-12 bg-zinc-900/50 border border-zinc-800 rounded"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                  />
              ))}
          </div>
       </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-96 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
       <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-zinc-600" />
       </div>
       <h3 className="text-xl font-semibold text-zinc-300 mb-2">Awaiting Evidence</h3>
       <p className="text-zinc-500 max-w-sm">
          Upload media and provide context to begin the forensic analysis pipeline.
       </p>
    </div>
  );
}