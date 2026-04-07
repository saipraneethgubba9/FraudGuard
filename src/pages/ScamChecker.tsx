import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../i18n";
import { Search, ShieldAlert, CheckCircle, Loader2, History, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnalysisResult {
  riskScore: number;
  riskLevel: string;
  explanation: string;
  recommendation: string;
}

interface ScamCheck {
  id: number;
  message: string;
  analysis: string;
  risk_score: number;
  created_at: string;
}

export const ScamChecker: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScamCheck[]>([]);
  const lang = user?.language || "en";

  useEffect(() => {
    fetch("/api/scam-checks")
      .then((res) => res.ok ? res.json() : [])
      .then(setHistory)
      .catch(() => {});
  }, []);

  const analyzeMessage = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/analyze-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Analysis failed"); }
      const analysis: AnalysisResult = await res.json();
      setResult(analysis);
      await fetch("/api/scam-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, analysis: JSON.stringify(analysis), risk_score: analysis.riskScore }),
      });
      fetch("/api/scam-checks").then((r) => r.ok ? r.json() : []).then(setHistory).catch(() => {});
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const card = "bg-white dark:bg-[#181818] rounded-3xl border border-gray-100 dark:border-[#282828] shadow-sm";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {getTranslation(lang, "checker.title")}
        </h1>
        <p className="text-gray-500 dark:text-[#b3b3b3] mt-2">
          {getTranslation(lang, "checker.subtitle")}
        </p>
      </header>

      <div className={`${card} p-8 space-y-6`}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={getTranslation(lang, "checker.placeholder")}
          className="w-full h-48 p-6 bg-gray-50 dark:bg-[#282828] border border-gray-100 dark:border-[#3e3e3e] rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none text-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#6a6a6a]"
        />
        {error && (
          <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium border border-red-500/20">
            {error}
          </div>
        )}
        <button
          onClick={analyzeMessage}
          disabled={loading || !text.trim()}
          className="w-full py-4 bg-brand-500 text-black rounded-full font-bold hover:bg-brand-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm tracking-wide shadow-lg shadow-brand-500/20"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />{getTranslation(lang, "checker.analyzing")}</>
          ) : (
            <><Search className="w-5 h-5" />{getTranslation(lang, "checker.analyze")}</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${card} p-8 space-y-8`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "checker.result_title")}</h2>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                result.riskLevel === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                result.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-brand-500/10 text-brand-500 border border-brand-500/20"
              }`}>
                {getTranslation(lang, "checker.risk_level")}: {result.riskLevel}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-500 font-bold text-sm uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <h3>{getTranslation(lang, "checker.explanation")}</h3>
                </div>
                <p className="text-gray-600 dark:text-[#b3b3b3] leading-relaxed text-sm">{result.explanation}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-500 font-bold text-sm uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" />
                  <h3>{getTranslation(lang, "checker.recommendation")}</h3>
                </div>
                <p className="text-gray-600 dark:text-[#b3b3b3] leading-relaxed text-sm">{result.recommendation}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-[#282828]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 dark:text-[#6a6a6a] uppercase tracking-widest">{getTranslation(lang, "progress.table_risk")}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{result.riskScore}/100</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-[#282828] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    result.riskScore > 70 ? "bg-red-500" :
                    result.riskScore > 30 ? "bg-amber-500" :
                    "bg-brand-500"
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className={`${card} p-8 space-y-6`}>
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-brand-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Checks</h2>
          </div>
          <div className="space-y-3">
            {history.slice(0, 5).map((check) => {
              const parsed = (() => { try { return JSON.parse(check.analysis); } catch { return null; } })();
              return (
                <div key={check.id} className="p-5 bg-gray-50 dark:bg-[#282828] rounded-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-[#b3b3b3] font-medium truncate flex-1 mr-4">{check.message}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        check.risk_score > 70 ? "bg-red-500/10 text-red-400" :
                        check.risk_score > 30 ? "bg-amber-500/10 text-amber-400" :
                        "bg-brand-500/10 text-brand-500"
                      }`}>
                        {parsed?.riskLevel || `${check.risk_score}/100`}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#6a6a6a]">
                        <Clock className="w-3 h-3" />
                        {new Date(check.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
