import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "motion/react";
import { Menu, Shield } from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex transition-colors duration-300">
      
      {/* Mobile Top Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#000000] border-b border-gray-100 dark:border-[#282828] z-30 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
             <Shield className="text-white w-5 h-5" />
           </div>
           <span className="font-bold text-gray-900 dark:text-white text-lg">FraudGuard</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900 dark:text-[#b3b3b3] dark:hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 transition-all md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen relative w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
