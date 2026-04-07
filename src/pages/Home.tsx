import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Category, Progress } from "../types";
import { getTranslation } from "../i18n";
import {
  ShieldAlert, Target, Activity, ChevronRight,
  Phone, CreditCard, Heart, Briefcase, Mail, Smartphone,
  Building2, Gift, UserX, Globe, Banknote, ShoppingCart, Lock
} from "lucide-react";
import { Link } from "react-router-dom";

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("phishing") || n.includes("email")) return Mail;
  if (n.includes("phone") || n.includes("call") || n.includes("vishing")) return Phone;
  if (n.includes("credit") || n.includes("card") || n.includes("payment")) return CreditCard;
  if (n.includes("romance") || n.includes("dating") || n.includes("love")) return Heart;
  if (n.includes("job") || n.includes("employ") || n.includes("work")) return Briefcase;
  if (n.includes("sms") || n.includes("text") || n.includes("smishing")) return Smartphone;
  if (n.includes("bank") || n.includes("finance") || n.includes("invest")) return Building2;
  if (n.includes("lottery") || n.includes("prize") || n.includes("gift") || n.includes("reward")) return Gift;
  if (n.includes("identity") || n.includes("imperson")) return UserX;
  if (n.includes("online") || n.includes("internet") || n.includes("social")) return Globe;
  if (n.includes("upi") || n.includes("money") || n.includes("transfer")) return Banknote;
  if (n.includes("shop") || n.includes("ecommerce") || n.includes("product")) return ShoppingCart;
  if (n.includes("password") || n.includes("hack") || n.includes("cyber")) return Lock;
  return ShieldAlert;
}

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const lang = user?.language || "en";

  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(setCategories);
    fetch("/api/progress").then(res => res.json()).then(setProgress);
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          {getTranslation(lang, "dashboard.welcome", { name: user?.name || "" })}
        </h1>
        <p className="text-gray-500 dark:text-[#b3b3b3] mt-2 text-lg">
          {getTranslation(lang, "dashboard.subtitle")}
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTranslation(lang, "dashboard.categories")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
            <Link
              key={category.id}
              to={`/quiz/${category.id}`}
              className="group bg-white dark:bg-[#181818] p-8 rounded-3xl border border-gray-100 dark:border-[#282828] shadow-sm hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors duration-300">
                <Icon className="text-brand-500 w-7 h-7 group-hover:text-black transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{category.name}</h3>
              <p className="text-gray-500 dark:text-[#b3b3b3] text-sm leading-relaxed mb-6">{category.description}</p>
              <div className="flex items-center text-brand-500 font-bold text-sm">
                {getTranslation(lang, "dashboard.start_quiz")}
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{getTranslation(lang, "dashboard.progress")}</h2>
        <div className="grid grid-cols-1 gap-4">
          {progress.map((item) => (
            <div key={item.category_id} className="bg-white dark:bg-[#181818] p-6 rounded-3xl border border-gray-100 dark:border-[#282828] shadow-sm flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.category_name}</h3>
                <div className="w-full bg-gray-100 dark:bg-[#282828] h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full transition-all duration-1000" style={{ width: `${item.accuracy_percentage}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 md:w-1/2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-[#6a6a6a] mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{getTranslation(lang, "dashboard.total_completed")}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{item.total_completed}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-[#6a6a6a] mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{getTranslation(lang, "dashboard.accuracy")}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{item.accuracy_percentage}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-[#6a6a6a] mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{getTranslation(lang, "dashboard.risk_score")}</span>
                  </div>
                  <p className={cn("text-xl font-bold", Number(item.risk_score) > 50 ? "text-red-400" : "text-brand-500")}>{item.risk_score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
