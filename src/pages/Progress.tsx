import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Progress as ProgressType } from "../types";
import { getTranslation } from "../i18n";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { ShieldCheck, Target, TrendingUp, AlertTriangle } from "lucide-react";

export const Progress: React.FC = () => {
  const { user, theme } = useAuth();
  const [progress, setProgress] = useState<ProgressType[]>([]);
  const lang = user?.language || "en";

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then(setProgress);
  }, []);

  const totalCompleted = progress.reduce((acc, curr) => acc + curr.total_completed, 0);
  const avgAccuracy = progress.length > 0 
    ? progress.reduce((acc, curr) => acc + Number(curr.accuracy_percentage), 0) / progress.length 
    : 0;

  const chartData = progress.map(p => ({
    name: p.category_name,
    accuracy: Number(p.accuracy_percentage),
    risk: Number(p.risk_score)
  }));

  const COLORS = ['#9e14df', '#c196ed', '#ac73e7', '#8e12c9', '#7e10b2', '#6e0e9c'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {getTranslation(lang, "progress.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {getTranslation(lang, "progress.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center">
            <Target className="text-brand-600 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {getTranslation(lang, "progress.overall_accuracy")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{avgAccuracy.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-emerald-600 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {getTranslation(lang, "progress.total_scenarios")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCompleted}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="text-amber-600 w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {getTranslation(lang, "progress.awareness_level")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {avgAccuracy > 80 
                ? getTranslation(lang, "progress.expert") 
                : avgAccuracy > 50 
                  ? getTranslation(lang, "progress.intermediate") 
                  : getTranslation(lang, "progress.beginner")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{getTranslation(lang, "progress.accuracy_by_category")}</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#333' : '#f0f0f0'} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: theme === 'dark' ? '#999' : '#666' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(158, 20, 223, 0.05)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: theme === 'dark' ? '#18181b' : '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', color: theme === 'dark' ? '#fff' : '#000' }}
                />
                <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{getTranslation(lang, "progress.risk_distribution")}</h2>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="accuracy"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: theme === 'dark' ? '#18181b' : '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', color: theme === 'dark' ? '#fff' : '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <AlertTriangle className="w-6 h-6 text-brand-600 mb-1" />
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Risk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{getTranslation(lang, "progress.achievements")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { id: 1, name: getTranslation(lang, "progress.achievement_first"), icon: "🌱", unlocked: totalCompleted > 0 },
            { id: 2, name: getTranslation(lang, "progress.achievement_slayer"), icon: "⚔️", unlocked: avgAccuracy > 70 },
            { id: 3, name: getTranslation(lang, "progress.achievement_pro"), icon: "🎓", unlocked: avgAccuracy > 90 },
            { id: 4, name: getTranslation(lang, "progress.achievement_consistent"), icon: "🔥", unlocked: totalCompleted > 20 },
          ].map(achievement => (
            <div 
              key={achievement.id}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                achievement.unlocked 
                  ? "border-brand-100 dark:border-brand-900/30 bg-brand-50/30 dark:bg-brand-900/10" 
                  : "border-gray-50 dark:border-zinc-800 opacity-40 grayscale"
              }`}
            >
              <span className="text-4xl mb-3">{achievement.icon}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{achievement.name}</span>
            </div>
          ))}
        </div>
      </div>

      {avgAccuracy >= 90 && (
        <div className="bg-brand-600 p-10 rounded-3xl text-white shadow-xl shadow-brand-200 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{getTranslation(lang, "progress.certificate_title")}</h2>
              <p className="text-brand-100">{getTranslation(lang, "progress.certificate_desc")}</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-white text-brand-600 rounded-2xl font-bold hover:bg-brand-50 transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            {getTranslation(lang, "progress.download_cert")}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getTranslation(lang, "progress.table_category")}</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getTranslation(lang, "progress.table_completed")}</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getTranslation(lang, "progress.table_accuracy")}</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getTranslation(lang, "progress.table_risk")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {progress.map((p) => (
                <tr key={p.category_id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-900 dark:text-white">{p.category_name}</td>
                  <td className="px-8 py-5 text-gray-600 dark:text-gray-400">{p.total_completed}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-600 h-full" 
                          style={{ width: `${p.accuracy_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{p.accuracy_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      Number(p.risk_score) > 70 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : 
                      Number(p.risk_score) > 30 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" : 
                      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {p.risk_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
