import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Globe, 
  Sparkles, 
  Layers 
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <Brain className="logo-icon" />
              <span className="logo-text">Werugo TruthLab</span>
            </div>
            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link to="/dashboard" className="btn-primary-small">
                Launch Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <div className="hero-badge">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Forensic Investigation</span>
            </div>
            
            <h1 className="hero-title">
              Multimodal Fake News
              <br />
              <span className="gradient-text">Detection Platform</span>
            </h1>
            
            <p className="hero-description">
              Advanced AI forensic analysis combining MuRIL text classification, 
              CNN/ViT image analysis, Whisper video verification, and SERP fact-checking 
              with intelligent fusion logic.
            </p>
            
            <div className="hero-actions">
              <Link to="/dashboard" className="btn-primary-large">
                <span>Start Investigation</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn-secondary-large">
                Learn More
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">4</div>
                <div className="stat-label">AI Models</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">95%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">3</div>
                <div className="stat-label">Modalities</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">Forensic Analysis Capabilities</h2>
            <p className="section-description">
              Multi-layered verification using state-of-the-art AI models
            </p>
          </motion.div>

          <div className="features-grid">
            <FeatureCard
              icon={<FileText />}
              title="Text Analysis"
              description="MuRIL-based multilingual text classification with SHAP explainability for Kannada and English content"
              color="emerald"
            />
            <FeatureCard
              icon={<ImageIcon />}
              title="Image Forensics"
              description="CNN/ViT visual analysis with Grad-CAM attention heatmaps to detect manipulated images"
              color="violet"
            />
            <FeatureCard
              icon={<Video />}
              title="Video Verification"
              description="Whisper transcription + Gemini Q&A for comprehensive video content analysis"
              color="blue"
            />
            <FeatureCard
              icon={<Globe />}
              title="SERP Fact-Check"
              description="Real-time web search verification using credible fact-checking sources and signal detection"
              color="amber"
            />
            <FeatureCard
              icon={<Sparkles />}
              title="AI Reports"
              description="Gemini-powered comprehensive forensic reports with evidence synthesis"
              color="pink"
            />
            <FeatureCard
              icon={<Layers />}
              title="Fusion Override"
              description="Intelligent verdict fusion where forensic fact-checking overrides local model predictions"
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              4-step forensic investigation process
            </p>
          </motion.div>

          <div className="steps-grid">
            <StepCard
              number="1"
              title="Upload"
              description="Submit news headline and image for analysis"
            />
            <StepCard
              number="2"
              title="Analyze"
              description="AI models process text, image, and web sources"
            />
            <StepCard
              number="3"
              title="Verify"
              description="Forensic fact-checking validates findings"
            />
            <StepCard
              number="4"
              title="Report"
              description="Comprehensive forensic report with verdict"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2 className="cta-title">Ready to Investigate?</h2>
            <p className="cta-description">
              Start analyzing news content with our AI forensic platform
            </p>
            <Link to="/dashboard" className="btn-primary-large">
              <span>Launch Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-logo">
                <Brain className="w-6 h-6" />
                <span>Werugo TruthLab</span>
              </div>
              <p className="footer-tagline">
                AI-Powered Forensic News Analysis
              </p>
            </div>
            <div className="footer-right">
              <p className="footer-copyright">
                © 2026 Werugo TruthLab. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`feature-card feature-card-${color}`}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="step-card"
    >
      <div className="step-number">{number}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-description">{description}</p>
    </motion.div>
  );
}
