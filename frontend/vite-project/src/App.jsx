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
  Video,
  Shield,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE = 'http://localhost:8000';
// const API_BASE = 'http://192.168.1.121:8000';

function App() {
  const [activeTab, setActiveTab] = useState('news');

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                  MultiModel Fakenews Detection
                </h1>
                <p className="text-sm text-slate-400">Digital Forensic Analysis Platform</p>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('news')}
                className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'news'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Fake News Detection
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'video'
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-4 h-4" />
                Video Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'news' && <FakeNewsDetection key="news" />}
          {activeTab === 'video' && <VideoAnalysis key="video" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function FakeNewsDetection() {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div className="lg:col-span-4">
        <NewsInputPanel
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
          {loading && <TerminalLoading message={loadingMessage} key="loading" />}
          {!loading && !result && <EmptyState key="empty" type="news" />}
          {!loading && result && (
            <NewsResultsGrid
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
    </motion.div>
  );
}

const MOCK = {
  
  "answers": [
    {
      "question": "1.SKEPTIC: Are there any unusual visual artifacts, pixelation, or deepfake indicators in the text overlays or news channel branding that suggest digital alteration?",
      "answer": "No, the visual elements, including text overlays and news channel branding, appear clean, sharp, and professionally integrated. There are no noticeable pixelation, blurring, or deepfake indicators. The transitions between different graphic overlays are smooth and consistent with a typical news broadcast style.",
      "confidence": 95,
      "supports_fake": false
    },
    {
      "question": "2.SKEPTIC: Does the 'NEWS FIRST' channel have a known history of publishing unverified claims or sensationalized content without proper corroboration?",
      "answer": "As an AI, I do not have access to real-time databases or external knowledge about the specific editorial history or reputation of 'NEWS FIRST' (newsfirstlive.com). Therefore, I cannot ascertain its history of publishing unverified claims or sensationalized content from the provided video alone.",
      "confidence": 0,
      "supports_fake": null
    },
    {
      "question": "3.SKEPTIC: Is the audio narration consistent and free of abrupt cuts, unnatural speed changes, or robotic tones that might indicate AI generation or editing manipulation?",
      "answer": "The audio narration is consistent throughout the video. The male voice maintains a natural tone, pace, and rhythm. There are no abrupt cuts, unnatural speed changes, or robotic tones that would suggest AI generation or editing manipulation.",
      "confidence": 90,
      "supports_fake": false
    },
    {
      "question": "4.SKEPTIC: Are there any subtle inconsistencies between the background visuals and the overlayed text content that could point to a composite or fabricated video?",
      "answer": "The background visuals (animated blue abstract patterns) and the overlayed text content (red news banners, logos, social media info) are consistently integrated. The text boxes and branding sit naturally on top of the background, and the animation does not interfere or clash with the text. There are no subtle inconsistencies to suggest a composite or fabricated video; it appears to be a standard news graphic template.",
      "confidence": 90,
      "supports_fake": false
    },
    {
      "question": "5.SKEPTIC: Does the choice of words like 'influential minister' or 'centenarian' in the headline aim to elicit an emotional response rather than purely convey factual information, potentially swaying opinion?",
      "answer": "The terms 'influential minister' (ಪ್ರಭಾವಿ ಸಚಿವ) and 'centenarian' (ಶತಾಯುಷಿ) are descriptive. While 'influential' can carry a subjective connotation, it is often used in political contexts to describe figures with significant impact. 'Centenarian' is a factual descriptor of age. These terms add context and prominence to the individual's identity and life span, which is common in news reporting of public figures, and do not overtly suggest an aim to manipulate emotions or sway opinion beyond providing relevant background information.",
      "confidence": 70,
      "supports_fake": false
    },
    {
      "question": "6.DEFENDER: Is 'NEWS FIRST' a well-established and generally reputable news organization known for accurate reporting in the region it serves?",
      "answer": "As an AI, I do not have access to real-time databases or external knowledge about the specific reputation or establishment status of 'NEWS FIRST' (newsfirstlive.com). Therefore, I cannot confirm if it is a well-established and generally reputable news organization known for accurate reporting.",
      "confidence": 0,
      "supports_fake": null
    },
    {
      "question": "7.DEFENDER: Do the graphics, logos, and lower third elements in the video appear professionally produced and consistent with typical broadcasts from a legitimate news channel?",
      "answer": "Yes, the graphics, logos (including sub-channels like Health, Filmy, Cricket, Property, Prime), and lower-third elements (website, social media handles) are professionally produced. They exhibit a clean design, consistent branding, and smooth animations typical of legitimate news channel broadcasts. The overall presentation is polished and well-structured.",
      "confidence": 95,
      "supports_fake": false
    },
    {
      "question": "8.DEFENDER: Can the stated age of the individual (102 years) and their past position as a former minister be easily cross-referenced and confirmed by other credible sources?",
      "answer": "The video explicitly states the individual's age as 102 years and identifies him as a former minister. While these claims are presented as facts within the video, confirming them using other credible sources requires external verification beyond the provided video content.",
      "confidence": 50,
      "supports_fake": null
    },
    {
      "question": "9.DEFENDER: Is the reported sequence of events, from hospital treatment to passing away at home, presented in a clear and logical manner, common to factual reporting?",
      "answer": "Yes, the reported sequence of events is presented clearly and logically: the individual was receiving treatment at Guduge Hospital in Bidar, was brought home four days prior, and then passed away at his residence in Bhali town at around 11 PM due to age-related illness. This progression of events is common in factual death reporting.",
      "confidence": 90,
      "supports_fake": false
    },
    {
      "question": "10.DEFENDER: Does the video consistently display its official website (newsfirstlive.com) and social media handles, suggesting transparency and an established online presence?",
      "answer": "Yes, the video consistently displays the official website and social media handles across platforms such as Facebook, YouTube, and Instagram, suggesting transparency and an established online presence.",
      "confidence": 95,
      "supports_fake": false
    },
    {
      "question": "11.NEUTRAL: What is the full name of the deceased individual reported in the breaking news segment?",
      "answer": "The full name of the deceased individual reported is Bheemanna Khandre (ಭೀಮಣ್ಣ ಖಂಡ್ರೆ).",
      "confidence": 100,
      "supports_fake": false
    },
    {
      "question": "12.NEUTRAL: What is the precise age stated for Bheemanna Khandre at the time of his death?",
      "answer": "The precise age stated for Bheemanna Khandre at the time of his death is 102 years.",
      "confidence": 100,
      "supports_fake": false
    },
    {
      "question": "13.NEUTRAL: Which specific town is mentioned as the location where Bheemanna Khandre ultimately passed away?",
      "answer": "The town mentioned as the location of death is Bhali (ಭಾಲಿ ಪಟ್ಟಣದ).",
      "confidence": 100,
      "supports_fake": false
    },
    {
      "question": "14.NEUTRAL: What type of health facility was Bheemanna Khandre reportedly receiving treatment at before being brought home?",
      "answer": "He was reportedly receiving treatment at Guduge Hospital in Bidar.",
      "confidence": 100,
      "supports_fake": false
    },
    {
      "question": "15.NEUTRAL: What specific time of day is given for the individual's passing?",
      "answer": "The individual passed away at approximately 11 PM.",
      "confidence": 100,
      "supports_fake": false
    }
  ],
  "verdict": {
    "classification": "UNCERTAIN",
    "confidence": 75,
    "key_reasons": [
      "The video exhibits professional production quality with no visual artifacts, deepfake indicators, or audio manipulation.",
      "Graphics, logos, and lower-third elements are consistent and professionally produced.",
      "The narrative describing the death is clear and logically structured.",
      "The channel displays its website and social media handles consistently.",
      "External verification of the individual's details and the channel's editorial reputation was not possible."
    ],
    "recommendation": "Cross-reference the reported death of Bheemanna Khandre with other credible news outlets or official records and assess the journalistic track record of NEWS FIRST."
  }


}

function VideoAnalysis() {
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('video', video);

      const response = await fetch(`${API_BASE}/video_verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Video analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Video analysis failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div className="lg:col-span-4">
        <VideoInputPanel
          video={video}
          videoPreview={videoPreview}
          handleVideoChange={handleVideoChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />
        {/* 🔧 MOCK TEST BUTTON */}
        {/* <button
          onClick={() => setResult(MOCK)}
          className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg"
        >
          Load Test Result (No Backend)
        </button> */}
      </div>

      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {loading && <VideoLoadingState key="loading" />}
          {!loading && !result && <EmptyState key="empty" type="video" />}
          {!loading && result && <VideoResultsGrid result={result} key="results" />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function NewsInputPanel({ title, setTitle, imagePreview, handleImageChange, handleSubmit, loading }) {
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
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
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

function VideoInputPanel({ video, videoPreview, handleVideoChange, handleSubmit, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-6 sticky top-24"
    >
      <div className="flex items-center gap-2 mb-6">
        <Video className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold">Video Upload</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Upload Video File
          </label>
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              id="video-upload"
              required
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-violet-500 transition-colors bg-slate-950"
            >
              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Video className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-1">Click to upload video</p>
                  <p className="text-xs text-slate-500">MP4, MOV, AVI supported</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !video}
          className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Verify Video
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
          <span>{message}</span>
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

function VideoLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-8"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          <h3 className="text-lg font-semibold">Analyzing Video...</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Extracting audio transcript</p>
              <p className="text-xs text-slate-400">Using Whisper AI model...</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium">Generating verification questions</p>
              <p className="text-xs text-slate-400">Multi-perspective analysis...</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Brain className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Analyzing content</p>
              <p className="text-xs text-slate-500">Pending...</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 bg-slate-800 rounded overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
    >
      {type === 'news' ? (
        <>
          <Scan className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            Ready for Analysis
          </h3>
          <p className="text-slate-500">
            Submit news content to begin forensic investigation
          </p>
        </>
      ) : (
        <>
          <Video className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            Ready for Video Verification
          </h3>
          <p className="text-slate-500">
            Upload a video to analyze for authenticity and deepfake detection
          </p>
        </>
      )}
    </motion.div>
  );
}

function NewsResultsGrid({ result, imagePreview, aiSummary, generatingAI, onGenerateAI }) {
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

function VideoResultsGrid({ result }) {
  const answers = Array.isArray(result.verdict) ? result.verdict :[];

  if (!answers.length) {
    return (
      <div className="bg-slate-900 border border-red-500 p-6 rounded-xl">
        <p className="text-red-400">Invalid video analysis response</p>
        <pre className="text-xs text-slate-400 mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  const fakeCount = answers.filter(a => a.supports_fake === true).length;
  let realCount = answers.filter(a => a.supports_fake === false).length;
  const nullCount = answers.filter(a => a.supports_fake === null).length;
  realCount = realCount + nullCount -2
  const classification =
    fakeCount > realCount ? "FAKE" :
    realCount > fakeCount ? "REAL" :
    "UNCERTAIN";

  const confidence = Math.round(
    (Math.max(fakeCount, realCount) / answers.length) * 100
  );

  const verdict = {
    classification,
    confidence,
    key_reasons: [
      `Total checks: ${answers.length}`,
      `Supports genuine: ${realCount}`,
      `Supports fake: ${fakeCount}`
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {verdict && <VideoVerdictCard verdict={verdict} />}
      <VideoQuestionsCard answers={answers} />
    </motion.div>
  );
}

function VideoVerdictCard({ verdict }) {
  const isFake = verdict.confidence < 50 ? 'FAKE' : 'REAL';
  const isUncertain = verdict.classification === 'UNCERTAIN';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-slate-900 rounded-xl border-2 p-6 relative overflow-hidden ${
        isFake ? 'border-red-500' : isUncertain ? 'border-yellow-500' : 'border-emerald-500'
      }`}
    >
      <div className={`absolute inset-0 opacity-10 ${
        isFake ? 'bg-red-500' : isUncertain ? 'bg-yellow-500' : 'bg-emerald-500'
      }`}></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          {isFake ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : isUncertain ? (
            <HelpCircle className="w-5 h-5 text-yellow-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="text-lg font-semibold">Video Verdict</h3>
        </div>

        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className={`text-6xl font-bold mb-4 ${
              isFake ? 'text-red-400' : isUncertain ? 'text-yellow-400' : 'text-emerald-400'
            }`}
          >
            {verdict.classification}
          </motion.div>
          <div className="text-3xl font-semibold text-slate-300">
            {verdict.confidence}%
          </div>
          <div className="text-sm text-slate-400 mt-2">Confidence</div>
        </div>

        {verdict.key_reasons && verdict.key_reasons.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Key Reasons:</h4>
            <ul className="space-y-2">
              {verdict.key_reasons.map((reason, i) => (
                <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-violet-400 mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verdict.recommendation && (
          <div className="mt-4 bg-slate-950 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-violet-400">Recommendation: </span>
              {verdict.recommendation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function VideoQuestionsCard({ answers }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getPerspective = (q='') => {
    if (q.includes("SKEPTIC")) return "SKEPTIC";
    if (q.includes("DEFENDER")) return "DEFENDER";
    if (q.includes("NEUTRAL")) return "NEUTRAL";
    return "UNKNOWN";
  };

  const colorMap = {
    SKEPTIC: "text-red-400 bg-red-500/10",
    DEFENDER: "text-emerald-400 bg-emerald-500/10",
    NEUTRAL: "text-blue-400 bg-blue-500/10",
    UNKNOWN: "text-slate-400 bg-slate-500/10"
  };

  const getPerspectiveIcon = (question) => {
    if (question.startsWith('SKEPTIC')) return <AlertTriangle className="w-4 h-4" />;
    if (question.startsWith('DEFENDER')) return <Shield className="w-4 h-4" />;
    if (question.startsWith('NEUTRAL')) return <HelpCircle className="w-4 h-4" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-xl border border-slate-800 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold">Verification Analysis</h3>
      </div>

      <div className="space-y-3">
        {answers.map((item, index) => {
          const perspective = getPerspective(item.question)
          const isExpanded = expandedIndex === index;

          return (
            <div key={index} className="bg-slate-950 rounded-lg">
              <button
                onClick={() =>
                  setExpandedIndex(isExpanded ? null : index)
                }
                className="w-full p-4 text-left hover:bg-slate-800/40"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span
                      className={`text-xs px-2 py-1 rounded font-semibold ${colorMap[perspective]}`}
                    >
                      {perspective}
                    </span>
                    <p className="mt-2 text-sm text-slate-200">
                      {item.question}
                    </p>
                    {item.confidence !== undefined && (
                      <p className="text-xs text-slate-400 mt-1">
                        Confidence: {item.confidence}%
                      </p>
                    )}
                  </div>
                  <CheckCircle
                    className={`w-5 h-5 ${
                      item.supports_fake === false
                        ? "text-emerald-400"
                        : item.supports_fake === true
                        ? "text-red-400"
                        : "text-slate-500"
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-800 px-4 py-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      <div className={`absolute inset-0 opacity-10 ${
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

      <div className="bg-slate-950 rounded-lg p-4 text-lg leading-relaxed">
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
  const getGradCamUrl = () => {
    if (!result.image_analysis?.file) return imagePreview;
    const basename = result.image_analysis.file.split('/').pop();
    return `${API_BASE}/${basename}`;
  };

  const heatmapUrl = getGradCamUrl();

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
              e.target.src = imagePreview;
            }}
          />
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