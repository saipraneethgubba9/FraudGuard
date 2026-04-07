import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../i18n";
import { Users, MapPin, Calendar, Plus, MessageSquare, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScamAlert {
  id: number;
  user_name: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
}

export const Community: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: "", description: "", location: "" });
  const [loading, setLoading] = useState(false);
  const lang = user?.language || "en";

  const fetchAlerts = async () => {
    const res = await fetch("/api/alerts");
    const data = await res.json();
    setAlerts(data);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      setNewAlert({ title: "", description: "", location: "" });
      setShowModal(false);
      fetchAlerts();
    } catch (error) {
      console.error("Failed to post alert:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {getTranslation(lang, "community.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {getTranslation(lang, "community.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          {getTranslation(lang, "community.post_alert")}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {alerts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-gray-100 dark:border-zinc-800 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-200 dark:text-zinc-800 mx-auto" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">{getTranslation(lang, "community.no_alerts")}</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={alert.id}
              className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center text-brand-600 font-bold">
                    {alert.user_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{alert.user_name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 p-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{alert.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{alert.description}</p>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "community.form_title")}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{getTranslation(lang, "community.form_desc")}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation(lang, "community.label_title")}
                  </label>
                  <input
                    required
                    type="text"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder={getTranslation(lang, "community.placeholder_title")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation(lang, "community.label_loc")}
                  </label>
                  <input
                    required
                    type="text"
                    value={newAlert.location}
                    onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder={getTranslation(lang, "community.placeholder_loc")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getTranslation(lang, "community.label_desc")}
                  </label>
                  <textarea
                    required
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                    className="w-full h-32 px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                    placeholder={getTranslation(lang, "community.placeholder_desc")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all disabled:cursor-not-allowed"
                >
                  {loading ? getTranslation(lang, "community.posting") : getTranslation(lang, "community.submit")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
