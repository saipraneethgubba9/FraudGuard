import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Scenario } from "../types";
import { getTranslation } from "../i18n";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Quiz: React.FC = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const lang = user?.language || "en";

  useEffect(() => {
    fetch(`/api/scenarios/${categoryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch scenarios");
        return res.json();
      })
      .then(setScenarios)
      .catch(err => console.error("Quiz fetch error:", err));
  }, [categoryId]);

  const handleAnswer = async (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const scenario = scenarios[currentIndex];
    const correct = answer === scenario.correct_answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Save result to backend
    await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario_id: scenario.id,
        selected_answer: answer,
      }),
    });
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
    } else {
      setFinished(true);
    }
  };

  if (scenarios.length === 0) return (
    <div className="p-20 text-center">
      <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="text-gray-300 dark:text-zinc-700 w-8 h-8" />
      </div>
      <p className="text-gray-400 dark:text-gray-500 font-medium">{getTranslation(lang, "quiz.loading")}</p>
    </div>
  );

  if (finished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{getTranslation(lang, "quiz.complete_title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-10">{getTranslation(lang, "quiz.complete_desc")}</p>
        <button
          onClick={() => navigate("/")}
          className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all"
        >
          {getTranslation(lang, "quiz.back_to_dashboard")}
        </button>
      </motion.div>
    );
  }

  const currentScenario = scenarios[currentIndex];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center font-bold text-brand-600">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {getTranslation(lang, "quiz.question_count", { current: (currentIndex + 1).toString(), total: scenarios.length.toString() })}
            </h2>
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-brand-600 h-full transition-all duration-500" 
                style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-zinc-900 p-10 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 leading-snug">
            {currentScenario.question}
          </h3>

          <div className="space-y-4">
            {currentScenario.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentScenario.correct_answer;
              
              let buttonClass = "w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group";
              
              if (!showFeedback) {
                buttonClass = cn(buttonClass, "border-gray-100 dark:border-zinc-800 hover:border-brand-200 dark:hover:border-brand-900/50 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 text-gray-700 dark:text-gray-300");
              } else {
                if (isCorrectAnswer) {
                  buttonClass = cn(buttonClass, "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-400 font-semibold");
                } else if (isSelected && !isCorrect) {
                  buttonClass = cn(buttonClass, "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-400 font-semibold");
                } else {
                  buttonClass = cn(buttonClass, "border-gray-50 dark:border-zinc-800 opacity-50 grayscale-[0.5]");
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <span className="text-lg">{option}</span>
                  {showFeedback && isCorrectAnswer && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-brand-600 dark:text-brand-500" />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-10 pt-10 border-t border-gray-50 dark:border-zinc-800"
              >
                <div className={cn(
                  "p-6 rounded-2xl flex items-start gap-4 mb-8",
                  isCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-400" : "bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-400"
                )}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      {isCorrect ? getTranslation(lang, "quiz.correct") : getTranslation(lang, "quiz.incorrect")}
                    </h4>
                    <p className="opacity-90">
                      {isCorrect 
                        ? getTranslation(lang, "quiz.feedback_correct") 
                        : getTranslation(lang, "quiz.feedback_incorrect", { answer: currentScenario.correct_answer })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                >
                  {currentIndex < scenarios.length - 1 
                    ? getTranslation(lang, "quiz.next") 
                    : getTranslation(lang, "quiz.finish")}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
