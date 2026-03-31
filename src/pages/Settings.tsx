import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTranslation, Language } from "../i18n";
import { Globe, LogOut, ShieldCheck, Moon, Sun, User as UserIcon, Phone, MapPin, CheckCircle } from "lucide-react";

export const Settings: React.FC = () => {
  const { user, logout, updateLanguage, updateProfile, theme, toggleTheme } = useAuth();
  const lang = user?.language || "en";

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    await updateProfile({ name, phone, location });
    setUpdating(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi (हिन्दी)" },
    { code: "te", name: "Telugu (తెలుగు)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{getTranslation(lang, "settings.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{getTranslation(lang, "settings.subtitle")}</p>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
              <UserIcon className="text-brand-600 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "settings.profile_title")}</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-sm font-medium border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {getTranslation(lang, "settings.profile_success")}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{getTranslation(lang, "settings.profile_name")}</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{getTranslation(lang, "settings.profile_phone")}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{getTranslation(lang, "settings.profile_location")}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={updating}
              className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
            >
              {updating ? "..." : getTranslation(lang, "settings.profile_update")}
            </button>
          </form>
        </div>

        <div className="p-8 border-b border-gray-50 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
              <Globe className="text-brand-600 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "settings.language")}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => updateLanguage(l.code)}
                className={cn(
                  "flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all text-left",
                  lang === l.code
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-bold"
                    : "border-gray-50 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400"
                )}
              >
                <span>{l.name}</span>
                {lang === l.code && <ShieldCheck className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 border-b border-gray-50 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
              {theme === "light" ? <Sun className="text-brand-600 w-5 h-5" /> : <Moon className="text-brand-600 w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "settings.theme")}</h2>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-bold",
                theme === "light"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600"
                  : "border-gray-50 dark:border-zinc-800 text-gray-400"
              )}
            >
              <Sun className="w-5 h-5" />
              {getTranslation(lang, "settings.theme_light")}
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-bold",
                theme === "dark"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600"
                  : "border-gray-50 dark:border-zinc-800 text-gray-400"
              )}
            >
              <Moon className="w-5 h-5" />
              {getTranslation(lang, "settings.theme_dark")}
            </button>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-zinc-900/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-zinc-900 border border-brand-100 dark:border-brand-900/30 text-brand-600 rounded-2xl font-bold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>{getTranslation(lang, "settings.logout_confirm")}</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-600 p-8 rounded-3xl text-white shadow-xl shadow-brand-200 dark:shadow-none flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">{getTranslation(lang, "settings.security_title")}</h3>
          <p className="text-brand-100 text-sm">{getTranslation(lang, "settings.security_desc")}</p>
        </div>
        <ShieldCheck className="w-12 h-12 text-brand-200 opacity-50" />
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
