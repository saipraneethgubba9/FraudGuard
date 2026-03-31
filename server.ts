import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "fraudguard.db");
const db = new Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || "fraudguard-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    language TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scam_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT NOT NULL,
    analysis TEXT NOT NULL,
    risk_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON string
    correct_answer TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS user_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scenario_id INTEGER,
    selected_answer TEXT NOT NULL,
    is_correct INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
  );

  CREATE TABLE IF NOT EXISTS scam_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
console.log(`Current category count: ${categoryCount.count}`);

if (categoryCount.count === 0) {
  console.log("Seeding initial categories and scenarios...");
  const insertCategory = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
  const insertScenario = db.prepare("INSERT INTO scenarios (category_id, question, options, correct_answer) VALUES (?, ?, ?, ?)");
  
  try {
    db.transaction(() => {
      const otpId = insertCategory.run("OTP Scams", "Scams involving one-time passwords and fake bank calls.").lastInsertRowid;
      const jobId = insertCategory.run("Job Scams", "Fake job offers and recruitment fraud.").lastInsertRowid;
      const upiId = insertCategory.run("UPI Scams", "Fraudulent payment requests and QR code scams.").lastInsertRowid;
      const phishingId = insertCategory.run("Phishing Scams", "Deceptive emails and websites designed to steal credentials.").lastInsertRowid;
      const investmentId = insertCategory.run("Investment Scams", "Get-rich-quick schemes and fraudulent cryptocurrency platforms.").lastInsertRowid;
      const romanceId = insertCategory.run("Romance Scams", "Fraudsters creating fake profiles on dating sites to exploit victims.").lastInsertRowid;
      const techSupportId = insertCategory.run("Tech Support Scams", "Fake alerts about computer viruses to gain remote access.").lastInsertRowid;
      const lotteryId = insertCategory.run("Lottery Scams", "False claims of winning a prize to extract 'processing fees'.").lastInsertRowid;

      // OTP Scenarios
      insertScenario.run(otpId, "You receive a call from someone claiming to be from your bank. They say your account is blocked and ask for the OTP sent to your phone to unblock it. What do you do?", JSON.stringify(["Share the OTP to unblock the account", "Hang up and call the official bank number", "Ask them for their employee ID first"]), "Hang up and call the official bank number");
      insertScenario.run(otpId, "An SMS says you won a lottery and asks you to click a link and enter the OTP you just received. What is the safest action?", JSON.stringify(["Click the link and enter OTP", "Ignore and delete the message", "Share the link with friends"]), "Ignore and delete the message");
      insertScenario.run(otpId, "A 'delivery agent' calls saying they are outside your house but need a 'confirmation OTP' to hand over the package you didn't order. What do you do?", JSON.stringify(["Give the OTP to see what's inside", "Refuse the package and do not share any OTP", "Ask them to leave it at the door"]), "Refuse the package and do not share any OTP");
      insertScenario.run(otpId, "You are trying to log in to your social media, and you get a text with an OTP you didn't request. Moments later, someone calls claiming to be 'Tech Support' and asks for that code. What do you do?", JSON.stringify(["Provide the code to secure your account", "Hang up and change your password immediately", "Tell them the code but ask for a confirmation email"]), "Hang up and change your password immediately");
      insertScenario.run(otpId, "A friend messages you on Facebook asking for an OTP that was 'accidentally' sent to your number instead of theirs. What is the most likely situation?", JSON.stringify(["It's a genuine mistake", "Your friend's account is hacked and they are trying to access yours", "The network is having a glitch"]), "Your friend's account is hacked and they are trying to access yours");

      // Job Scenarios
      insertScenario.run(jobId, "A recruiter contacts you on WhatsApp offering a high-paying remote job but asks for a 'security deposit' for equipment. Is this legitimate?", JSON.stringify(["Yes, many companies do this", "No, legitimate employers never ask for money", "Maybe, if they provide a receipt"]), "No, legitimate employers never ask for money");
      insertScenario.run(jobId, "You get an email for a job you didn't apply for, asking for your bank details for 'payroll setup' before an interview. What should you do?", JSON.stringify(["Provide details to speed up the process", "Report as spam and do not provide details", "Ask for the company's address first"]), "Report as spam and do not provide details");
      insertScenario.run(jobId, "An employer asks you to perform a 'test task' that involves buying gift cards and sending them the codes. Is this a scam?", JSON.stringify(["Yes, this is a common money laundering tactic", "No, it's a test of my efficiency", "Only if the amount is over $100"]), "Yes, this is a common money laundering tactic");
      insertScenario.run(jobId, "You are offered a job as a 'Payment Processor' where you receive money in your account and transfer it to others, keeping a 10% commission. What is this?", JSON.stringify(["A legitimate freelance role", "Illegal money laundering (Money Mule)", "A high-commission banking job"]), "Illegal money laundering (Money Mule)");
      insertScenario.run(jobId, "A job posting on a major site looks perfect, but the 'interviewer' insists on conducting the entire interview via an encrypted messaging app like Telegram. Is this a red flag?", JSON.stringify(["No, many tech companies use Telegram", "Yes, professional companies use official platforms or video calls", "Only if they don't have a profile picture"]), "Yes, professional companies use official platforms or video calls");

      // UPI Scenarios
      insertScenario.run(upiId, "Someone sends you a QR code saying you will 'receive' money if you scan it and enter your UPI PIN. Is this true?", JSON.stringify(["Yes, PIN is needed to receive money", "No, PIN is only needed to send money", "Only if the amount is large"]), "No, PIN is only needed to send money");
      insertScenario.run(upiId, "You receive a 'Collect Request' on your UPI app from an unknown person for a 'refund'. What do you do?", JSON.stringify(["Approve it to get the refund", "Decline the request immediately", "Wait for a few hours"]), "Decline the request immediately");
      insertScenario.run(upiId, "A stranger on social media asks you to pay a small 'verification fee' via UPI to unlock a prize. What is your response?", JSON.stringify(["Pay the fee, it's small", "Block the user and report the profile", "Ask for their ID card first"]), "Block the user and report the profile");
      insertScenario.run(upiId, "You get a call from someone claiming you overpaid your electricity bill and they want to refund you via a UPI 'request'. They ask you to 'Authorize' the transaction. What happens if you authorize?", JSON.stringify(["You get the refund", "Money is deducted from your account", "Nothing happens until you enter the amount"]), "Money is deducted from your account");
      insertScenario.run(upiId, "You find a 'Customer Care' number for a popular e-commerce site on a random blog. The person asks you to download a screen-sharing app to help with a UPI issue. Should you?", JSON.stringify(["Yes, they need to see the error", "No, screen-sharing allows them to see your PIN and OTPs", "Only if I trust the blog"]), "No, screen-sharing allows them to see your PIN and OTPs");

      // Phishing Scenarios
      insertScenario.run(phishingId, "You receive an email from 'Netflix' saying your payment failed and providing a link to 'update your billing info'. The sender email is 'support@netflix-billing.com'. What do you do?", JSON.stringify(["Click the link and update info", "Go directly to netflix.com in your browser", "Reply to the email asking for help"]), "Go directly to netflix.com in your browser");
      insertScenario.run(phishingId, "A text message from your 'bank' warns of suspicious activity and asks you to log in via a link provided. The URL is 'secure-bank-login.net'. Is this safe?", JSON.stringify(["Yes, it looks official", "No, banks don't send login links via SMS", "Only if I use my private browser"]), "No, banks don't send login links via SMS");
      insertScenario.run(phishingId, "You receive a document on Google Drive from an unknown sender titled 'Invoice_1234.pdf'. To view it, you are asked to 'Log in with your email provider'. What is likely happening?", JSON.stringify(["Standard security check", "Credential harvesting phishing attack", "Google Drive error"]), "Credential harvesting phishing attack");
      insertScenario.run(phishingId, "A Facebook friend tags you in a post titled 'I can't believe he is gone, see who died in an accident'. The link takes you to a fake login page. What should you do?", JSON.stringify(["Log in to see the news", "Close the page and warn your friend their account is hacked", "Report the post to the police"]), "Close the page and warn your friend their account is hacked");
      insertScenario.run(phishingId, "You see a sponsored ad for a '50% off' sale on a luxury brand. The website URL is 'www.adidas-outlet-store-deals.com'. Is this legitimate?", JSON.stringify(["Yes, it's a sponsored ad", "No, the domain name is suspicious and likely a scam site", "Only if they accept credit cards"]), "No, the domain name is suspicious and likely a scam site");

      // Investment Scenarios
      insertScenario.run(investmentId, "An Instagram ad promises 500% returns in 24 hours through 'expert crypto trading'. They ask you to join a Telegram group. What do you do?", JSON.stringify(["Join and invest a small amount", "Ignore it, if it sounds too good to be true, it is", "Ask for their trading license"]), "Ignore it, if it sounds too good to be true, it is");
      insertScenario.run(investmentId, "A friend's account (possibly hacked) sends you a link to a 'new investment platform' that pays you for recruiting others. What is this?", JSON.stringify(["A great opportunity", "A Ponzi/Pyramid scheme", "A legitimate multi-level marketing business"]), "A Ponzi/Pyramid scheme");
      insertScenario.run(investmentId, "You are invited to a 'Cloud Mining' platform where you buy 'hash power' to earn daily Bitcoin. They show fake withdrawal proofs. What is the most likely outcome?", JSON.stringify(["I will become rich", "The site will disappear once enough people invest", "I will earn slow but steady profit"]), "The site will disappear once enough people invest");
      insertScenario.run(investmentId, "A 'Financial Advisor' on LinkedIn suggests a 'pre-IPO' investment in a famous tech company but asks you to send funds to a personal bank account. Is this normal?", JSON.stringify(["Yes, for early access", "No, legitimate investments are handled through regulated brokerages", "Only if they have 500+ connections"]), "No, legitimate investments are handled through regulated brokerages");
      insertScenario.run(investmentId, "You receive a 'wrong number' text that leads to a conversation about a highly profitable 'Gold Trading' app. The person is very friendly and shares their 'success'. What is this tactic called?", JSON.stringify(["Social Engineering / Pig Butchering", "Friendly Marketing", "Accidental Networking"]), "Social Engineering / Pig Butchering");

      // Romance Scenarios
      insertScenario.run(romanceId, "You've been chatting with someone online for weeks. They claim to be working overseas and suddenly need money for an 'emergency surgery'. What do you do?", JSON.stringify(["Send the money immediately", "Never send money to someone you haven't met in person", "Offer to pay the hospital directly"]), "Never send money to someone you haven't met in person");
      insertScenario.run(romanceId, "An online partner asks you to receive money into your bank account and then transfer it to another account as a 'favor'. What is the risk?", JSON.stringify(["No risk, just helping a friend", "You could be acting as a 'money mule' for illegal funds", "It might affect your credit score"]), "You could be acting as a 'money mule' for illegal funds");
      insertScenario.run(romanceId, "A person you met on a dating app insists on moving the conversation to an encrypted app immediately and starts asking about your financial status. Is this a warning sign?", JSON.stringify(["No, they just want privacy", "Yes, scammers often try to move off-platform and vet victims' wealth", "Only if they are from another country"]), "Yes, scammers often try to move off-platform and vet victims' wealth");
      insertScenario.run(romanceId, "Your online 'boyfriend/girlfriend' says they sent you an expensive gift (jewelry/laptop) but it's stuck at customs and you need to pay a 'clearance fee'. What should you do?", JSON.stringify(["Pay the fee to get the gift", "Realize the gift doesn't exist and it's a scam", "Ask for a tracking number"]), "Realize the gift doesn't exist and it's a scam");
      insertScenario.run(romanceId, "Someone you met online asks you to send 'intimate' photos or videos. Later, they threaten to share them with your family unless you pay. What is this?", JSON.stringify(["A misunderstanding", "Sextortion", "A test of trust"]), "Sextortion");

      // Tech Support Scenarios
      insertScenario.run(techSupportId, "A pop-up on your computer says 'VIRUS DETECTED' and gives a toll-free number to call Microsoft Support. What should you do?", JSON.stringify(["Call the number immediately", "Close the browser and run your own antivirus", "Follow the instructions on the screen"]), "Close the browser and run your own antivirus");
      insertScenario.run(techSupportId, "A 'technician' calls saying they noticed errors on your computer and need to install 'AnyDesk' to fix it. Should you allow this?", JSON.stringify(["Yes, they are trying to help", "No, never give remote access to unsolicited callers", "Only if they don't ask for a password"]), "No, never give remote access to unsolicited callers");
      insertScenario.run(techSupportId, "You receive a call from 'Amazon Support' saying there is a fraudulent order on your account. They ask you to buy a 'gift card' to 'cancel' the order. Is this legitimate?", JSON.stringify(["Yes, gift cards are used for refunds", "No, legitimate companies never ask for payment in gift cards", "Only if it's a high-value order"]), "No, legitimate companies never ask for payment in gift cards");
      insertScenario.run(techSupportId, "While browsing, your screen locks and a message says 'FBI: Your computer is locked due to illegal activity. Pay $500 fine to unlock'. What is this?", JSON.stringify(["A real legal notice", "Ransomware / Scareware scam", "A system update"]), "Ransomware / Scareware scam");
      insertScenario.run(techSupportId, "A caller claiming to be from 'Apple' says your iCloud is breached. They ask for your Apple ID password to 'verify' your identity. What do you do?", JSON.stringify(["Give the password to secure the account", "Hang up; Apple will never ask for your password over the phone", "Give a fake password first"]), "Hang up; Apple will never ask for your password over the phone");

      // Lottery Scenarios
      insertScenario.run(lotteryId, "You get a letter saying you won a 'Global Sweepstakes' but must pay a 'customs clearance fee' to receive your millions. What do you do?", JSON.stringify(["Pay the fee to get the millions", "Tear up the letter, it's a scam", "Call the number to verify"]), "Tear up the letter, it's a scam");
      insertScenario.run(lotteryId, "An email claims you won an iPhone in a contest you don't remember entering. It asks for your address and a 'shipping fee'. What is the catch?", JSON.stringify(["There is no catch, I'm lucky", "They just want your credit card info for the 'fee'", "I might have entered it and forgotten"]), "They just want your credit card info for the 'fee'");
      insertScenario.run(lotteryId, "You receive a WhatsApp message from 'KBC' (Kaun Banega Crorepati) with an image of a lottery check for 25 Lakhs. It asks you to call a 'Manager' on a specific number. What is the best action?", JSON.stringify(["Call the manager to claim the prize", "Block and report the number as a scam", "Share it with family to see if it's real"]), "Block and report the number as a scam");
      insertScenario.run(lotteryId, "A 'Government' email says you have unclaimed tax refunds but you must provide your bank login details on a 'portal' to receive it. Is this how refunds work?", JSON.stringify(["Yes, it's a direct deposit", "No, governments use official channels and never ask for passwords", "Only during tax season"]), "No, governments use official channels and never ask for passwords");
      insertScenario.run(lotteryId, "You win a 'Free Vacation' in a lucky draw but are told you must attend a 4-hour high-pressure sales presentation and pay a 'membership fee' first. Is this a 'free' vacation?", JSON.stringify(["Yes, after the presentation", "No, it's a high-pressure sales tactic for expensive timeshares", "Only if the hotel is 5-star"]), "No, it's a high-pressure sales tactic for expensive timeshares");
    })();
    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

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

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, phone, location } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare("INSERT INTO users (name, email, password, phone, location) VALUES (?, ?, ?, ?, ?)").run(name, email, hashedPassword, phone || null, location || null);
      const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ id: result.lastInsertRowid, name, email, phone, location });
    } catch (e: any) {
      res.status(400).json({ error: e.message.includes("UNIQUE") ? "Email already exists" : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: user.id, name: user.name, email: user.email, language: user.language });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, name, email, phone, location, language FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.post("/api/users/profile", authenticateToken, (req: any, res) => {
    const { name, phone, location } = req.body;
    db.prepare("UPDATE users SET name = ?, phone = ?, location = ? WHERE id = ?").run(name, phone, location, req.user.id);
    res.json({ success: true });
  });

  app.post("/api/users/language", authenticateToken, (req: any, res) => {
    const { language } = req.body;
    db.prepare("UPDATE users SET language = ? WHERE id = ?").run(language, req.user.id);
    res.json({ success: true });
  });

  // Data
  app.get("/api/categories", authenticateToken, (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.get("/api/scenarios/:categoryId", authenticateToken, (req, res) => {
    const scenarios = db.prepare("SELECT * FROM scenarios WHERE category_id = ?").all(req.params.categoryId);
    res.json(scenarios.map((s: any) => ({ ...s, options: JSON.parse(s.options) })));
  });

  app.post("/api/results", authenticateToken, (req: any, res) => {
    const { scenario_id, selected_answer } = req.body;
    const scenario = db.prepare("SELECT correct_answer, category_id FROM scenarios WHERE id = ?").get(scenario_id) as any;
    const is_correct = selected_answer === scenario.correct_answer ? 1 : 0;

    db.prepare("INSERT INTO user_results (user_id, scenario_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)")
      .run(req.user.id, scenario_id, selected_answer, is_correct);

    // Get updated progress for this category
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(is_correct) as correct
      FROM user_results ur
      JOIN scenarios s ON ur.scenario_id = s.id
      WHERE ur.user_id = ? AND s.category_id = ?
    `).get(req.user.id, scenario.category_id) as any;

    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    const riskScore = Math.max(0, 100 - accuracy); // Simple risk score logic

    res.json({ 
      is_correct: !!is_correct, 
      correct_answer: scenario.correct_answer,
      stats: {
        category_id: scenario.category_id,
        total_completed: stats.total,
        accuracy_percentage: accuracy.toFixed(1),
        risk_score: riskScore.toFixed(1)
      }
    });
  });

  app.get("/api/progress", authenticateToken, (req: any, res) => {
    const progress = db.prepare(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        COUNT(ur.id) as total_completed,
        CASE WHEN COUNT(ur.id) > 0 THEN (SUM(ur.is_correct) * 100.0 / COUNT(ur.id)) ELSE 0 END as accuracy_percentage
      FROM categories c
      LEFT JOIN scenarios s ON c.id = s.category_id
      LEFT JOIN user_results ur ON s.id = ur.scenario_id AND ur.user_id = ?
      GROUP BY c.id
    `).all(req.user.id) as any[];

    const formattedProgress = progress.map(p => ({
      ...p,
      risk_score: (100 - p.accuracy_percentage).toFixed(1),
      accuracy_percentage: p.accuracy_percentage.toFixed(1)
    }));

    res.json(formattedProgress);
  });

  // Community Alerts
  app.get("/api/alerts", authenticateToken, (req, res) => {
    const alerts = db.prepare("SELECT * FROM scam_alerts ORDER BY created_at DESC").all();
    res.json(alerts);
  });

  app.post("/api/alerts", authenticateToken, (req: any, res) => {
    const { title, description, location } = req.body;
    db.prepare("INSERT INTO scam_alerts (user_id, user_name, title, description, location) VALUES (?, ?, ?, ?, ?)")
      .run(req.user.id, req.user.name, title, description, location);
    res.json({ success: true });
  });

  // Scam Checks History
  app.get("/api/scam-checks", authenticateToken, (req: any, res) => {
    const checks = db.prepare("SELECT * FROM scam_checks WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(checks);
  });

  app.post("/api/scam-checks", authenticateToken, (req: any, res) => {
    const { message, analysis, risk_score } = req.body;
    db.prepare("INSERT INTO scam_checks (user_id, message, analysis, risk_score) VALUES (?, ?, ?, ?)")
      .run(req.user.id, message, analysis, risk_score);
    res.json({ success: true });
  });

  // AI Scam Analysis (server-side to protect API key)
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
      console.error("Gemini analysis error:", err);
      res.status(500).json({ error: "AI analysis failed. Please try again later." });
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
