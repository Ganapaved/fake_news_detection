import { ChevronRight, Activity, TrendingUp, AlertCircle } from 'lucide-react';

export default function LiveMonitorPage() {
  return (
    <>
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Live Monitor</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-200">Real-time Analytics</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-[600px] text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-200 mb-3">Live Monitor Dashboard</h2>
            <p className="text-zinc-500 max-w-md mb-6">
              Real-time monitoring of news sources, trending claims, and system analytics.
              Track misinformation patterns and model performance metrics.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Module in development</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
