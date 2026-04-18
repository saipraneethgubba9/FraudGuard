import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Shield } from "lucide-react";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate("/login");
        return;
      }

      const { user } = data.session;
      // Sync the Google user with our backend
      const res = await fetch("/api/auth/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
          avatar: user.user_metadata?.avatar_url,
        }),
      });

      if (res.ok) {
        const userData = await res.json();
        login(userData);
        navigate("/settings");
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center animate-pulse">
          <Shield className="text-white w-10 h-10" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Signing you in...</p>
      </div>
    </div>
  );
};
