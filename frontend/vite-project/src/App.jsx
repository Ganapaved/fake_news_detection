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
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_BASE = 'http://localhost:8000';
// const API_BASE = 'http://192.168.1.121:8000';

function App() {
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
      alert('Analysis failed. Please ensure the backend is running on http://localhost:8000');
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
      const response = await fetch(`${API_BASE}/ai_summrise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                Werugo TruthLab
              </h1>
              <p className="text-sm text-slate-400">Digital Forensic News Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <InputPanel
              title={title}
              setTitle={setTitle}
              imagePreview={imagePreview}
              handleImageChange={handleImageChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {loading && (
                <TerminalLoading message={loadingMessage} key="loading" />
              )}

              {!loading && !result && (
                <EmptyState key="empty" />
              )}

              {!loading && result && (
                <ResultsGrid
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
      </main>
    </div>
  );
}

function InputPanel({ title, setTitle, imagePreview, handleImageChange, handleSubmit, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-6 sticky top-24"
    >
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold">Data Input</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            News Title (Kannada/English)
          </label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent kannada-text resize-none"
            rows="4"
            placeholder="Enter news headline or claim..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Upload Image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              required
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors bg-slate-950"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Click to upload image</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !imagePreview}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Scan className="w-5 h-5" />
              Begin Analysis
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

function TerminalLoading({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-8 font-mono"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse delay-150"></div>
        </div>
        <div className="text-emerald-400 text-sm">
          <span className="mr-2">$</span>
          <span className="terminal-cursor">{message}</span>
        </div>
        <div className="mt-8 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 bg-slate-800 rounded overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
    >
      <Scan className="w-16 h-16 text-slate-700 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-400 mb-2">
        Ready for Analysis
      </h3>
      <p className="text-slate-500">
        Submit news content to begin forensic investigation
      </p>
    </motion.div>
  );
}

function ResultsGrid({ result, imagePreview, aiSummary, generatingAI, onGenerateAI }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerdictCard result={result} />
        <TextForensicsCard result={result} />
      </div>

      <VisualAttentionCard result={result} imagePreview={imagePreview} />

      <WebVerificationCard sources={result.web_sources} />

      <AISummaryCard
        aiSummary={aiSummary}
        generatingAI={generatingAI}
        onGenerate={onGenerateAI}
      />
    </motion.div>
  );
}

function VerdictCard({ result }) {
  const isFake = result.prediction === 'FAKE';
  const confidence = (result.confidence * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-slate-900 rounded-xl border-2 p-6 relative overflow-hidden ${
        isFake ? 'border-red-500' : 'border-emerald-500'
      }`}
    >
      <div className={`absolute inset-0 opacity-10 glow-effect ${
        isFake ? 'bg-red-500' : 'bg-emerald-500'
      }`}></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          {isFake ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="text-lg font-semibold">Verdict</h3>
        </div>

        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className={`text-6xl font-bold mb-4 ${
              isFake ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {result.prediction}
          </motion.div>
          <div className="text-3xl font-semibold text-slate-300">
            {confidence}%
          </div>
          <div className="text-sm text-slate-400 mt-2">Confidence</div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Claim Type:</span>
            <span className="text-sm font-semibold text-violet-400 uppercase">
              {result.claim_type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TextForensicsCard({ result }) {
  const highlightedText = result.shap_insights?.frontend_display?.highlighted_text || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold">Text Forensics</h3>
      </div>

      <div className="bg-slate-950 rounded-lg p-4 kannada-text text-lg leading-relaxed">
        {highlightedText.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {highlightedText.map((segment, index) => {
              const isFake = segment.type === 'fake';
              const bgColor = isFake ? 'bg-red-500' : 'bg-emerald-500';
              const opacity = Math.max(0.2, Math.min(segment.color_intensity, 1));

              return (
                <span
                  key={index}
                  className={`${bgColor} px-1 rounded transition-all hover:scale-105`}
                  style={{ opacity }}
                  title={`Impact: ${segment.impact.toFixed(4)}`}
                >
                  {segment.text}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400">{result.title}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-950 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Fake Indicators</div>
          <div className="flex flex-wrap gap-1">
            {result.shap_insights?.positive_contributors?.slice(0, 3).map((word, i) => (
              <span key={i} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                {word}
              </span>
            )) || <span className="text-xs text-slate-500">None</span>}
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Real Indicators</div>
          <div className="flex flex-wrap gap-1">
            {result.shap_insights?.negative_contributors?.slice(0, 3).map((word, i) => (
              <span key={i} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                {word}
              </span>
            )) || <span className="text-xs text-slate-500">None</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VisualAttentionCard({ result, imagePreview }) {
  // const heatmapUrl = result.image_analysis?.file
  //   ? `${API_BASE}/uploads/${result.image_analysis.file.split('/').pop()}`
  //   : imagePreview;
  const getGradCamurl = () =>{
    if(!result.image_analysis?.file) return imagePreview
    const basename = result.image_analysis.file.split('/').pop()
    const gradcamfilename = `${basename}`
    return `${API_BASE}/${gradcamfilename}`;
  }

  const heatmapUrl = getGradCamurl();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold">Visual Attention Analysis</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative rounded-lg overflow-hidden bg-slate-950">
          <img
            src={heatmapUrl}
            alt="Grad-CAM Heatmap"
            className="w-full h-auto"
            onError={(e) => {
              console.log("Grad-CAM not found, falling back to preview");
              e.target.src = imagePreview;
            }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scan-animation opacity-50"></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">Interpretation</div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {result.image_analysis?.interpretation || 'Analyzing visual patterns...'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Attention Score</div>
              <div className="text-lg font-semibold text-violet-400">
                {(result.image_analysis?.attention_score || 0).toFixed(3)}
              </div>
            </div>
            <div className="bg-slate-950 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Max Attention</div>
              <div className="text-lg font-semibold text-violet-400">
                {(result.image_analysis?.max_attention || 0).toFixed(3)}
              </div>
            </div>
            <div className="bg-slate-950 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Method</div>
              <div className="text-lg font-semibold text-violet-400 uppercase">
                {result.image_analysis?.method || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WebVerificationCard({ sources }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold">Web Verification</h3>
      </div>

      <div className="space-y-3">
        {sources && sources.length > 0 && sources[0].title ? (
          sources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-950 rounded-lg p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <ExternalLink className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200 mb-1">{source.title}</h4>
                  <p className="text-sm text-slate-400 mb-2">{source.snippet}</p>
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {source.link}
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-slate-950 rounded-lg p-8 text-center">
            <Globe className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No verification sources found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AISummaryCard({ aiSummary, generatingAI, onGenerate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-xl border border-violet-500/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold">AI Forensic Report</h3>
        </div>

        {!aiSummary && (
          <button
            onClick={onGenerate}
            disabled={generatingAI}
            className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2 disabled:cursor-not-allowed text-sm"
          >
            {generatingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Report
              </>
            )}
          </button>
        )}
      </div>

      {aiSummary ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-950 rounded-lg p-6 prose prose-invert max-w-none"
        >
          <article className="prose prose-invert prose-emerald max-w-none 
            prose-headings:text-violet-400 prose-headings:font-black prose-headings:tracking-tighter
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-li:text-slate-300
            prose-strong:text-emerald-400 prose-strong:font-bold
            prose-code:text-pink-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiSummary}
            </ReactMarkdown>
          </article>
        </motion.div>
      ) : generatingAI ? (
        <div className="bg-slate-950 rounded-lg p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-slate-800 rounded overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-950 rounded-lg p-8 text-center">
          <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">
            Click the button above to generate a comprehensive AI analysis
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default App;
