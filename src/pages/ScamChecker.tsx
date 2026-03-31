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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const analysis: AnalysisResult = await res.json();
      setResult(analysis);

      // Save to history
      await fetch("/api/scam-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          analysis: JSON.stringify(analysis),
          risk_score: analysis.riskScore,
        }),
      });

      // Refresh history
      fetch("/api/scam-checks")
        .then((r) => r.ok ? r.json() : [])
        .then(setHistory)
        .catch(() => {});
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {getTranslation(lang, "checker.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {getTranslation(lang, "checker.subtitle")}
        </p>
      </header>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={getTranslation(lang, "checker.placeholder")}
          className="w-full h-48 p-6 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none text-lg text-gray-900 dark:text-white"
        />
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}
        <button
          onClick={analyzeMessage}
          disabled={loading || !text.trim()}
          className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 dark:shadow-none hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {getTranslation(lang, "checker.analyzing")}
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {getTranslation(lang, "checker.analyze")}
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "checker.result_title")}</h2>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                result.riskLevel === "High" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                result.riskLevel === "Medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
              }`}>
                {getTranslation(lang, "checker.risk_level")}: {result.riskLevel}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                  <h3>{getTranslation(lang, "checker.explanation")}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{result.explanation}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle className="w-5 h-5" />
                  <h3>{getTranslation(lang, "checker.recommendation")}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{getTranslation(lang, "progress.table_risk")}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{result.riskScore}/100</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    result.riskScore > 70 ? "bg-red-600" :
                    result.riskScore > 30 ? "bg-amber-500" :
                    "bg-emerald-500"
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Checks</h2>
          </div>
          <div className="space-y-4">
            {history.slice(0, 5).map((check) => {
              const parsed = (() => { try { return JSON.parse(check.analysis); } catch { return null; } })();
              return (
                <div key={check.id} className="p-5 bg-gray-50 dark:bg-zinc-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate flex-1 mr-4">{check.message}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        check.risk_score > 70 ? "bg-red-50 dark:bg-red-900/20 text-red-600" :
                        check.risk_score > 30 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                      }`}>
                        {parsed?.riskLevel || `${check.risk_score}/100`}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
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
