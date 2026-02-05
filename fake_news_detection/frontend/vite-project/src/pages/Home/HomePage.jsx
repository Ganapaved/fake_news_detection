import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Search, Video, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-indigo-500/5 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(8,145,178,0.3)]">
              <Brain className="w-9 h-9 text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            TruthLab
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 mb-3 font-light">
            Multilingual & Multimodal Fake News Detection System
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>AI-Powered Forensic Analysis Platform</span>
          </div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6 mb-10"
        >
          <p className="text-zinc-300 text-center leading-relaxed">
            Advanced forensic investigation platform combining <span className="text-cyan-400 font-medium">MuRIL text classification</span>, 
            {' '}<span className="text-indigo-400 font-medium">CNN/ViT image analysis</span>, 
            {' '}<span className="text-purple-400 font-medium">Whisper video verification</span>, and 
            {' '}<span className="text-emerald-400 font-medium">SERP fact-checking</span> with intelligent fusion logic.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/investigation')}
            className="group relative bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-xl p-8 transition-all shadow-[0_0_30px_rgba(8,145,178,0.2)] hover:shadow-[0_0_40px_rgba(8,145,178,0.4)] border border-cyan-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Search className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Text & Image Investigation</h3>
            <p className="text-cyan-100 text-sm opacity-90">
              Analyze news headlines and images with multimodal AI forensics
            </p>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/10 group-hover:to-transparent transition-all pointer-events-none"></div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/video-forensics')}
            className="group relative bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl p-8 transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] border border-indigo-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Video className="w-8 h-8" />
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Video Forensics</h3>
            <p className="text-indigo-100 text-sm opacity-90">
              Verify video content with Whisper transcription and Gemini Q&A
            </p>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/0 to-indigo-400/0 group-hover:from-indigo-400/10 group-hover:to-transparent transition-all pointer-events-none"></div>
          </motion.button>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>4 AI Models</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span>3 Modalities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span>Real-time Analysis</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
