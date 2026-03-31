import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../i18n";
import { LifeBuoy, Phone, Globe, ShieldX, CreditCard, Landmark, FileText, ExternalLink, AlertTriangle, X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Emergency: React.FC = () => {
  const { user } = useAuth();
  const lang = user?.language || "en";
  const [confirmAction, setConfirmAction] = useState<{ title: string; action: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      icon: Phone,
      title: getTranslation(lang, "emergency.call_helpline"),
      desc: getTranslation(lang, "emergency.desc_helpline"),
      color: "bg-red-50 text-red-600",
      action: "https://dial100.gov.in"
    },
    {
      icon: Globe,
      title: getTranslation(lang, "emergency.report_cybercrime"),
      desc: getTranslation(lang, "emergency.desc_cybercrime"),
      color: "bg-brand-50 text-brand-600",
      action: "https://cybercrime.gov.in/Webform/Accept.aspx"
    },
    {
      icon: CreditCard,
      title: getTranslation(lang, "emergency.freeze_upi"),
      desc: getTranslation(lang, "emergency.desc_upi"),
      color: "bg-amber-50 text-amber-600",
      action: "https://npci.org.in/what-we-do/upi/dispute-redressal-mechanism"
    },
    {
      icon: Landmark,
      title: getTranslation(lang, "emergency.freeze_bank"),
      desc: getTranslation(lang, "emergency.desc_bank"),
      color: "bg-blue-50 text-blue-600",
      action: "https://bankingombudsman.rbi.org.in"
    },
    {
      icon: FileText,
      title: getTranslation(lang, "emergency.police_complaint"),
      desc: getTranslation(lang, "emergency.desc_police"),
      color: "bg-gray-50 text-gray-600",
      action: "https://www.google.com/maps/search/cyber+crime+police+station+near+me"
    }
  ];

  const handleAction = (title: string, action: string) => {
    setConfirmAction({ title, action });
  };

  const executeAction = () => {
    if (confirmAction) {
      window.open(confirmAction.action, "_blank");
      setConfirmAction(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("1930");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {getTranslation(lang, "emergency.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {getTranslation(lang, "emergency.subtitle")}
        </p>
      </header>

      {/* Prominent Helpline Section */}
      <div className="bg-red-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-red-200 dark:shadow-none overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <AlertTriangle className="w-3 h-3" />
              {getTranslation(lang, "emergency.quick_action")}
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">1930</h2>
            <p className="text-red-100 text-lg font-medium max-w-md">
              {getTranslation(lang, "emergency.desc_helpline")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
            onClick={() => handleAction(getTranslation(lang, "emergency.call_helpline"), "https://dial100.gov.in")}
              className="flex-1 sm:flex-none px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-lg shadow-xl hover:bg-red-50 transition-all flex items-center justify-center gap-3"
            >
              <Phone className="w-6 h-6" />
              {getTranslation(lang, "emergency.call_now")}
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex-1 sm:flex-none px-8 py-4 bg-red-700 text-white rounded-2xl font-bold hover:bg-red-800 transition-all flex items-center justify-center gap-3"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? getTranslation(lang, "emergency.number_copied") : getTranslation(lang, "emergency.copy_number")}
            </button>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-start gap-8 hover:shadow-md transition-all group"
          >
            <div className={`w-16 h-16 ${step.color.replace('bg-', 'dark:bg-').replace('text-', 'dark:text-')} ${step.color} rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              <step.icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{step.desc}</p>
              {step.action && (
                <button 
                  onClick={() => handleAction(step.title, step.action!)}
                  className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                >
                  {getTranslation(lang, "emergency.take_action")}
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-600 p-10 rounded-3xl text-white shadow-xl shadow-brand-200 dark:shadow-none">
        <div className="flex items-center gap-4 mb-6">
          <ShieldX className="w-10 h-10" />
          <h2 className="text-2xl font-bold">{getTranslation(lang, "emergency.tip_title")}</h2>
        </div>
        <p className="text-brand-100 text-lg leading-relaxed">
          {getTranslation(lang, "emergency.tip_desc")}
        </p>
      </div>

      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-zinc-800"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {confirmAction.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                You are about to be redirected to an external emergency service. Would you like to proceed?
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeAction}
                  className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 dark:shadow-none"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
