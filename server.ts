import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "fraudguard-secret-key";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, phone, location } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data, error } = await supabase
        .from("users")
        .insert({ name, email, password: hashedPassword, phone: phone || null, location: location || null })
        .select()
        .single();
      if (error) throw error;
      const token = jwt.sign({ id: data.id, email, name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      res.json({ id: data.id, name, email, phone, location, language: "en" });
    } catch (e: any) {
      res.status(400).json({ error: e.message?.includes("unique") ? "Email already exists" : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, location: user.location, language: user.language });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  // Google OAuth callback — upsert user and issue JWT
  app.post("/api/auth/google-callback", async (req, res) => {
    const { email, name, avatar } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    try {
      // Upsert: insert if not exists, return existing if already there
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      let user = existing;
      if (!user) {
        const { data: created, error } = await supabase
          .from("users")
          .insert({ name: name || email.split("@")[0], email, password: "", phone: null, location: null })
          .select()
          .single();
        if (error) throw error;
        user = created;
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, location: user.location, language: user.language || "en" });
    } catch (e: any) {
      res.status(500).json({ error: "Google sign-in failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const { data } = await supabase
      .from("users")
      .select("id, name, email, phone, location, language")
      .eq("id", req.user.id)
      .single();
    res.json(data);
  });

  app.post("/api/users/profile", authenticateToken, async (req: any, res) => {
    const { name, phone, location } = req.body;
    await supabase.from("users").update({ name, phone, location }).eq("id", req.user.id);
    res.json({ success: true });
  });

  app.post("/api/users/language", authenticateToken, async (req: any, res) => {
    const { language } = req.body;
    await supabase.from("users").update({ language }).eq("id", req.user.id);
    res.json({ success: true });
  });

  // --- Data Routes ---

  app.get("/api/categories", authenticateToken, async (req, res) => {
    const { data } = await supabase.from("categories").select("*");
    res.json(data || []);
  });

  app.get("/api/scenarios/:categoryId", authenticateToken, async (req, res) => {
    const { data } = await supabase
      .from("scenarios")
      .select("*")
      .eq("category_id", req.params.categoryId);
    const parsed = (data || []).map((s: any) => ({
      ...s,
      options: typeof s.options === "string" ? JSON.parse(s.options) : s.options,
    }));
    res.json(parsed);
  });

  app.post("/api/results", authenticateToken, async (req: any, res) => {
    const { scenario_id, selected_answer } = req.body;
    const { data: scenario } = await supabase
      .from("scenarios")
      .select("correct_answer, category_id")
      .eq("id", scenario_id)
      .single();
    const is_correct = selected_answer === scenario.correct_answer ? 1 : 0;

    await supabase.from("user_results").insert({
      user_id: req.user.id,
      scenario_id,
      selected_answer,
      is_correct,
    });

    const { data: stats } = await supabase
      .from("user_results")
      .select("is_correct, scenarios!inner(category_id)")
      .eq("user_id", req.user.id)
      .eq("scenarios.category_id", scenario.category_id);

    const total = stats?.length || 0;
    const correct = stats?.filter((s: any) => s.is_correct === 1).length || 0;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    res.json({
      is_correct: !!is_correct,
      correct_answer: scenario.correct_answer,
      stats: {
        category_id: scenario.category_id,
        total_completed: total,
        accuracy_percentage: accuracy.toFixed(1),
        risk_score: (100 - accuracy).toFixed(1),
      },
    });
  });

  app.get("/api/progress", authenticateToken, async (req: any, res) => {
    const { data: categories } = await supabase.from("categories").select("*");
    const { data: results } = await supabase
      .from("user_results")
      .select("is_correct, scenarios!inner(category_id)")
      .eq("user_id", req.user.id);

    const progress = (categories || []).map((cat: any) => {
      const catResults = (results || []).filter((r: any) => r.scenarios?.category_id === cat.id);
      const total = catResults.length;
      const correct = catResults.filter((r: any) => r.is_correct === 1).length;
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      return {
        category_id: cat.id,
        category_name: cat.name,
        total_completed: total,
        accuracy_percentage: accuracy.toFixed(1),
        risk_score: (100 - accuracy).toFixed(1),
      };
    });

    res.json(progress);
  });

  // --- Community Alerts ---

  app.get("/api/alerts", authenticateToken, async (req, res) => {
    const { data } = await supabase
      .from("scam_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    res.json(data || []);
  });

  app.post("/api/alerts", authenticateToken, async (req: any, res) => {
    const { title, description, location } = req.body;
    await supabase.from("scam_alerts").insert({
      user_id: req.user.id,
      user_name: req.user.name,
      title,
      description,
      location,
    });
    res.json({ success: true });
  });

  // --- Scam Checks History ---

  app.get("/api/scam-checks", authenticateToken, async (req: any, res) => {
    const { data } = await supabase
      .from("scam_checks")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    res.json(data || []);
  });

  app.post("/api/scam-checks", authenticateToken, async (req: any, res) => {
    const { message, analysis, risk_score } = req.body;
    await supabase.from("scam_checks").insert({
      user_id: req.user.id,
      message,
      analysis,
      risk_score,
    });
    res.json({ success: true });
  });

  // --- AI Scam Analysis ---

  app.post("/api/analyze-scam", authenticateToken, async (req: any, res) => {
    const { message, lang } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "AI service not configured. Please set GEMINI_API_KEY." });

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Analyze this message for potential scams: "${message}"`,
        config: {
          systemInstruction: `You are a cybersecurity expert. Analyze the provided text for scam indicators. Respond in the language: ${lang || "en"}. Return a JSON object with: riskScore (0-100 integer), riskLevel ("Low", "Medium", or "High"), explanation (why it is or isn't a scam), and recommendation (what the user should do).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING },
              explanation: { type: Type.STRING },
              recommendation: { type: Type.STRING },
            },
            required: ["riskScore", "riskLevel", "explanation", "recommendation"],
          },
        },
      });
      const analysis = JSON.parse(response.text || "{}");
      res.json(analysis);
    } catch (err: any) {
      console.error("Gemini error:", err);
      res.status(500).json({ error: "AI analysis failed. Please try again." });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
