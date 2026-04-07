import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../i18n";
import { Globe, LogOut, ShieldCheck, Moon, Sun, User as UserIcon, Phone, MapPin, CheckCircle } from "lucide-react";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

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

  const inputCls = "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#6a6a6a] transition-all";

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{getTranslation(lang, "settings.title")}</h1>
        <p className="text-gray-500 dark:text-[#b3b3b3] mt-2">{getTranslation(lang, "settings.subtitle")}</p>
      </header>

      <div className="bg-white dark:bg-[#181818] rounded-3xl border border-gray-100 dark:border-[#282828] shadow-sm overflow-hidden">
        {/* Profile */}
        <div className="p-8 border-b border-gray-100 dark:border-[#282828]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center">
              <UserIcon className="text-brand-500 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "settings.profile_title")}</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {success && (
              <div className="p-4 bg-brand-500/10 text-brand-500 rounded-xl text-sm font-medium border border-brand-500/20 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {getTranslation(lang, "settings.profile_success")}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-[#b3b3b3] ml-1">{getTranslation(lang, "settings.profile_name")}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6a6a6a] w-4 h-4" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-[#b3b3b3] ml-1">{getTranslation(lang, "settings.profile_phone")}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6a6a6a] w-4 h-4" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-[#b3b3b3] ml-1">{getTranslation(lang, "settings.profile_location")}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6a6a6a] w-4 h-4" />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
              </div>
            </div>
            <button
              type="submit"
              disabled={updating}
              className="px-8 py-3 bg-brand-500 text-black rounded-full font-bold hover:bg-brand-400 transition-all disabled:opacity-50 text-sm"
            >
              {updating ? "..." : getTranslation(lang, "settings.profile_update")}
            </button>
          </form>
        </div>

        {/* Language */}
        <div className="p-8 border-b border-gray-100 dark:border-[#282828]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center">
              <Globe className="text-brand-500 w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "settings.language")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => updateLanguage(l.code)}
                className={cn(
                  "flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left text-sm font-semibold",
                  lang === l.code
                    ? "border-brand-500 bg-brand-500/10 text-brand-500"
                    : "border-gray-100 dark:border-[#282828] hover:border-gray-200 dark:hover:border-[#3e3e3e] text-gray-600 dark:text-[#b3b3b3]"
                )}
              >
                <span>{l.name}</span>
                {lang === l.code && <ShieldCheck className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="p-8 border-b border-gray-100 dark:border-[#282828]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center">
              {theme === "light" ? <Sun className="text-brand-500 w-5 h-5" /> : <Moon className="text-brand-500 w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "settings.theme")}</h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all font-bold text-sm",
                theme === "light"
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-gray-200 dark:border-[#3e3e3e] text-gray-500 dark:text-[#b3b3b3] hover:border-gray-300 dark:hover:border-[#535353]"
              )}
            >
              <Sun className="w-5 h-5" />
              {getTranslation(lang, "settings.theme_light")}
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all font-bold text-sm",
                theme === "dark"
                  ? "border-brand-500 bg-brand-500/10 text-brand-500"
                  : "border-gray-200 dark:border-[#3e3e3e] text-gray-500 dark:text-[#b3b3b3] hover:border-gray-300 dark:hover:border-[#535353]"
              )}
            >
              <Moon className="w-5 h-5" />
              {getTranslation(lang, "settings.theme_dark")}
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-8 bg-gray-50/50 dark:bg-[#121212]/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] text-gray-700 dark:text-[#b3b3b3] rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-[#3e3e3e] hover:text-gray-900 dark:hover:text-white transition-all text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>{getTranslation(lang, "settings.logout_confirm")}</span>
          </button>
        </div>
      </div>

      {/* Security banner */}
      <div className="bg-brand-500 p-8 rounded-3xl text-black flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">{getTranslation(lang, "settings.security_title")}</h3>
          <p className="text-black/70 text-sm">{getTranslation(lang, "settings.security_desc")}</p>
        </div>
        <ShieldCheck className="w-12 h-12 text-black/30" />
      </div>
    </div>
  );
};
