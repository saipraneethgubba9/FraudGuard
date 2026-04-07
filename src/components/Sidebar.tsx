import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ShieldAlert, Settings, LogOut, Shield, Activity, Search, LifeBuoy, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTranslation } from "../i18n";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const lang = user?.language || "en";

  const navItems = [
    { icon: Home, label: getTranslation(lang, "sidebar.home"), path: "/" },
    { icon: ShieldAlert, label: getTranslation(lang, "sidebar.scenarios"), path: "/scenarios" },
    { icon: Search, label: getTranslation(lang, "sidebar.checker"), path: "/checker" },
    { icon: Users, label: getTranslation(lang, "sidebar.community"), path: "/community" },
    { icon: Activity, label: getTranslation(lang, "sidebar.progress"), path: "/progress" },
    { icon: LifeBuoy, label: getTranslation(lang, "sidebar.emergency"), path: "/emergency" },
    { icon: Settings, label: getTranslation(lang, "sidebar.settings"), path: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#000000] border-r border-gray-100 dark:border-[#282828] flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 dark:shadow-brand-500/20">
          <Shield className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">FraudGuard</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm",
                isActive
                  ? "bg-[#282828] text-white"
                  : "text-gray-500 dark:text-[#b3b3b3] hover:bg-gray-50 dark:hover:bg-[#282828] hover:text-gray-900 dark:hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-brand-500")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-[#282828]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-500 dark:text-[#b3b3b3] hover:bg-gray-50 dark:hover:bg-[#282828] hover:text-gray-900 dark:hover:text-white transition-all duration-200 font-medium text-sm"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>{getTranslation(lang, "sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};
