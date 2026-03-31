import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Category } from "../types";
import { getTranslation } from "../i18n";
import { ShieldAlert, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Scenarios: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const lang = user?.language || "en";

  useEffect(() => {
    fetch("/api/categories")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then(setCategories)
      .catch(err => console.error("Scenarios fetch error:", err));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{getTranslation(lang, "scenarios.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{getTranslation(lang, "scenarios.select_category")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category.id}
              to={`/quiz/${category.id}`}
              className="group flex items-center justify-between bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 transition-colors duration-300">
                  <ShieldAlert className="text-brand-600 w-7 h-7 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{category.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{category.description}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-300 dark:text-zinc-700 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="text-gray-300 dark:text-zinc-700 w-8 h-8" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 font-medium">{getTranslation(lang, "scenarios.loading")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
