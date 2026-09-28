import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI securely on the server
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: Neither GEMINI_API_KEY nor VITE_GEMINI_API_KEY is defined in the environment. AI capabilities will run in elegant fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

app.use(express.json({ limit: "10mb" }));

// File paths
const DATA_DIR = path.join(process.cwd(), "data");
const ISSUES_FILE = path.join(DATA_DIR, "issues.json");

// Ensure data directory and file exist with initial seed data
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Rich Indian Cities Civic Seed Data
const seedIssues = [
  {
    id: "seed-1",
    title: "Crater-sized Pothole on Western Express Highway",
    description: "Extremely dangerous crater-sized pothole near Bandra Flyover on WEH. Multiple bikers have narrowly slipped during the sudden monsoon showers yesterday.",
    category: "Road Infrastructure",
    severity: "Critical",
    department: "BMC (Roads Department)",
    status: "In Progress",
    address: "Western Express Highway, near Bandra Flyover, Mumbai, Maharashtra 400050",
    lat: 19.0544,
    lng: 72.8402,
    reporterName: "Rohan Deshmukh",
    reporterEmail: "rohan.d@gmail.com",
    votes: 42,
    comments: [
      { author: "Amit Mehta", text: "BMC needs to fix this ASAP, it is right at the curve of the bridge!", date: new Date(Date.now() - 86400000).toISOString() },
      { author: "Navi (AI Mascot)", text: "Analyzed report: Highly critical location on a major expressway. Escalate SLA prioritised.", date: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    slaTime: "T+18h Left",
    karmaPoints: 150,
    ward: "Ward H-West",
    image: "https://images.unsplash.com/photo-1599740831146-80a827db0d42?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-2",
    title: "Blocked Stormwater Drain Causing Knee-Deep Waterlogging",
    description: "The main drain in HSR Layout Sector 3 is completely choked with plastic garbage and construction rubble. Water has accumulated on the street and is entering houses.",
    category: "Sewage & Water",
    severity: "Critical",
    department: "BBMP (Stormwater Management)",
    status: "Reported",
    address: "HSR Layout, Sector 3, near BDA Complex, Bengaluru, Karnataka 560102",
    lat: 12.9116,
    lng: 77.6389,
    reporterName: "Priya Sridhar",
    reporterEmail: "priya.s@outlook.com",
    votes: 87,
    comments: [
      { author: "Santhosh K.", text: "Every year we suffer this in Sector 3. Glad CivicPulse is publicising this.", date: new Date(Date.now() - 36000000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 72000000).toISOString(),
    slaTime: "T+6h Left",
    karmaPoints: 200,
    ward: "Ward 174 (HSR Layout)",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-3",
    title: "Three Streetlights Non-Functional for Over 2 Weeks",
    description: "Entire dark stretch behind Kamala Nehru Ridge. It feels extremely unsafe for women and children returning from tuition classes in the evening.",
    category: "Electricity",
    severity: "Medium",
    department: "Delhi Power Grid",
    status: "Resolved",
    address: "Civil Lines, Kamala Nehru Ridge Road, Delhi 110054",
    lat: 28.6750,
    lng: 77.2185,
    reporterName: "Arun Sharma",
    reporterEmail: "arun.sharma@yahoo.com",
    votes: 19,
    comments: [
      { author: "Meera Sen", text: "Update: The maintenance crew arrived today morning and replaced the bulbs! Awesome work!", date: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    slaTime: "Resolved",
    karmaPoints: 80,
    ward: "Civil Lines Ward 12",
    image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-4",
    title: "Garbage Dump Yard Overflowing onto Main Road",
    description: "Massive pile of solid waste dumped right next to the school gate. Stray dogs and cows are scattering it across the road, creating an absolute bio-hazard.",
    category: "Garbage & Waste",
    severity: "Critical",
    department: "PMC (Solid Waste Management)",
    status: "Reported",
    address: "Kothrud, near Millennium School, Pune, Maharashtra 411038",
    lat: 18.5074,
    lng: 73.8077,
    reporterName: "Dr. Vinay Patil",
    reporterEmail: "vinay.p@gmail.com",
    votes: 65,
    comments: [],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    slaTime: "T+29h Left",
    karmaPoints: 120,
    ward: "Ward 12 (Kothrud)",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800"
  }
];

if (fs.existsSync(ISSUES_FILE)) {
  try {
    const existing = JSON.parse(fs.readFileSync(ISSUES_FILE, "utf-8"));
    const needsMigration = existing.some((iss: any) => iss.id.startsWith("seed-") && !iss.image);
    if (needsMigration) {
      const issuesToWrite = existing.map((iss: any) => {
        if (iss.id.startsWith("seed-")) {
          const match = seedIssues.find((s: any) => s.id === iss.id);
          if (match) {
            return { ...iss, image: match.image };
          }
        }
        return iss;
      });
      fs.writeFileSync(ISSUES_FILE, JSON.stringify(issuesToWrite, null, 2));
    }
  } catch (e) {
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(seedIssues, null, 2));
  }
} else {
  fs.writeFileSync(ISSUES_FILE, JSON.stringify(seedIssues, null, 2));
}

// Load issues from database helper
function loadIssues() {
  try {
    const data = fs.readFileSync(ISSUES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading issues file:", error);
    return seedIssues;
  }
}

// Save issues helper
function saveIssues(issues: any[]) {
  try {
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(issues, null, 2));
  } catch (error) {
    console.error("Error writing to issues file:", error);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Get all civic issues
app.get("/api/issues", (req, res) => {
  const issues = loadIssues();
  res.json({ success: true, count: issues.length, data: issues });
});

// Create a new civic issue
app.post("/api/issues", (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      severity, 
      department, 
      address, 
      lat, 
      lng, 
      reporterName, 
      reporterEmail,
      ward,
      image,
      voice
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: "Title, description, and category are required." });
    }

    const issues = loadIssues();
    const newIssue = {
      id: "issue-" + Date.now(),
      title,
      description,
      category,
      severity: severity || "Medium",
      department: department || "General Municipal Services",
      address: address || "Specified Location, India",
      lat: lat || 19.0760, // default Mumbai
      lng: lng || 72.8777,
      reporterName: reporterName || "Anonymous Civic Hero",
      reporterEmail: reporterEmail || "anonymous@civicpulse.in",
      votes: 1,
      comments: [
        { author: "Navi (AI Mascot)", text: `Thank you for filing this issue under ${category}. Gemini SLA auto-enforcer has kicked off the ticking timer!`, date: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      slaTime: "T+24h Left",
      karmaPoints: severity === "Critical" ? 150 : severity === "Medium" ? 100 : 50,
      ward: ward || "General Ward",
      image: image || null,
      voice: voice || null
    };

    issues.unshift(newIssue);
    saveIssues(issues);

    res.json({ success: true, data: newIssue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upvote an issue
app.post("/api/issues/:id/vote", (req, res) => {
  const { id } = req.params;
  const issues = loadIssues();
  const index = issues.findIndex((i: any) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }

  issues[index].votes += 1;
  // Increase karma of the issue
  issues[index].karmaPoints += 10;
  saveIssues(issues);

  res.json({ success: true, votes: issues[index].votes, karmaPoints: issues[index].karmaPoints });
});

// Comment on an issue
app.post("/api/issues/:id/comment", (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  
  if (!author || !text) {
    return res.status(400).json({ success: false, message: "Author and text are required" });
  }

  const issues = loadIssues();
  const index = issues.findIndex((i: any) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }

  const newComment = {
    author,
    text,
    date: new Date().toISOString()
  };

  issues[index].comments.push(newComment);
  saveIssues(issues);

  res.json({ success: true, data: newComment });
});

// Update issue status
app.post("/api/issues/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const issues = loadIssues();
  const index = issues.findIndex((i: any) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }

  issues[index].status = status;
  if (status === "Resolved") {
    issues[index].slaTime = "Resolved";
    // Boost karma on resolution
    issues[index].karmaPoints += 100;
  }
  
  if (remarks) {
    issues[index].comments.push({
      author: "Municipal Administrator",
      text: `Status updated to [${status}]. Remarks: ${remarks}`,
      date: new Date().toISOString()
    });
  }

  saveIssues(issues);
  res.json({ success: true, data: issues[index] });
});

// Helper functions for elegant fallback when Gemini API has high demand or is unavailable
function getHeuristicAnalysis(description: string) {
  const desc = (description || "").toLowerCase();
  
  let category = "Road Infrastructure";
  let department = "Local Municipal PWD (Roads)";
  let severity = "Medium";
  let commentFromNavi = "Hey! Navi here. I've filed this complaint with the roads division. Let's make our streets smooth and safe! 🛣️";

  if (desc.includes("drain") || desc.includes("sewage") || desc.includes("waterlogging") || desc.includes("flood") || desc.includes("leak") || desc.includes("pipe") || desc.includes("overflow") || desc.includes("choked")) {
    category = "Sewage & Water";
    department = "Local Municipal Water & Sewage Board";
    severity = "Critical";
    commentFromNavi = "Oh dear, water issue detected! Navi is dispatching this to the Sewage & Water board. Let's clear the blockage before the next downpour! 💧";
  } else if (desc.includes("light") || desc.includes("electricity") || desc.includes("power") || desc.includes("wire") || desc.includes("pole") || desc.includes("dark")) {
    category = "Electricity";
    department = "State Electricity Distribution Corp";
    severity = "Medium";
    commentFromNavi = "Lighting up our streets keeps everyone safe! Navi has logged this with the Electricity department. Let's bring back the light! 💡";
  } else if (desc.includes("garbage") || desc.includes("trash") || desc.includes("waste") || desc.includes("dump") || desc.includes("litter") || desc.includes("rubbish") || desc.includes("smell") || desc.includes("stray") || desc.includes("debris") || desc.includes("plastic")) {
    category = "Garbage & Waste";
    department = "Municipal Solid Waste Management Dept";
    severity = "Critical";
    commentFromNavi = "Swachh Bharat is our pride! Navi has logged this waste dump with the sanitation department. Let's reclaim our clean space! 🌿";
  } else if (desc.includes("traffic") || desc.includes("signal") || desc.includes("park") || desc.includes("car") || desc.includes("roadblock") || desc.includes("encroach")) {
    category = "Traffic & Transit";
    department = "City Traffic Police & Transit Authority";
    severity = "Medium";
    commentFromNavi = "No more traffic bottlenecks! Navi has dispatched this to the transit department to help keep our lanes moving smoothly. 🚦";
  } else if (desc.includes("mosquito") || desc.includes("sewer") || desc.includes("malaria") || desc.includes("fever") || desc.includes("dengue") || desc.includes("cleanliness")) {
    category = "Health & Sanitation";
    department = "Municipal Public Health & Sanitation Wing";
    severity = "Critical";
    commentFromNavi = "Health first! Navi is escalating this to the Public Health wing to prevent breeding and sanitize the zone. Stay safe! 🏥";
  }

  // Detect severity
  if (desc.includes("hazard") || desc.includes("accident") || desc.includes("danger") || desc.includes("critical") || desc.includes("urgent") || desc.includes("emergency") || desc.includes("injury") || desc.includes("slipping") || desc.includes("blocked")) {
    severity = "Critical";
  }

  return {
    title: description ? (description.substring(0, 45).trim() + (description.length > 45 ? "..." : "")) : "Civic Complaint Logged",
    category,
    severity,
    department,
    description: description || "Civic complaint reported via CivicPulse app.",
    estimatedSLA: severity === "Critical" ? "T+12h Left" : "T+24h Left",
    commentFromNavi
  };
}

function getMascotHeuristicResponse(prompt: string, userName: string, ward: string) {
  const msg = (prompt || "").toLowerCase();
  if (msg.includes("karma") || msg.includes("point") || msg.includes("score")) {
    return `Namaste ${userName}! Civic karma represents your dedication! Every report, upvote, and resolved issue boosts your score. Keep climbing the Swachh leaderboard! 🏆`;
  }
  if (msg.includes("report") || msg.includes("file") || msg.includes("issue") || msg.includes("complaint")) {
    return `To file a report, click the "Report New Issue" button, attach a live snapshot, enter details, and I will auto-enforce the municipal SLA countdown! 📋`;
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste") || msg.includes("hey") || msg.includes("who are you")) {
    return `Namaste ${userName}! I am Navi, your friendly Swachh AI civic guardian. I'm here to keep our neighborhood safe and clean! How can I help you today? 🌸`;
  }
  if (msg.includes("resolved") || msg.includes("fixed") || msg.includes("closed")) {
    return `Satyamev Jayate! When an issue gets successfully resolved, citizens get public praise and a massive boost of karma points! 🎉`;
  }
  return `I'm always ready to help you file reports and track issues in your ward! Together we can make a huge difference in ${ward || "our city"}. 🌱`;
}

// Gemini AI Proxy endpoint for Issue Analysis
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { description, image, voice } = req.body;
    const ai = getGeminiClient();

    let analysisPrompt = `Analyze this civic complaint reported by an Indian citizen.
      Categorize the report into one of these standard Indian civic departments:
      - Road Infrastructure (e.g. Potholes, broken footpaths)
      - Sewage & Water (e.g. waterlogging, broken pipes, open drains)
      - Electricity (e.g. non-functional street lights, dangling wires)
      - Garbage & Waste (e.g. open garbage dumping, dead animal)
      - Traffic & Transit (e.g. broken signals, illegal parking)
      - Health & Sanitation (e.g. mosquito breeding, open sewers)

      Return a strict JSON format matching this schema:
      {
        "title": "A highly punchy, professional title summarizing the issue",
        "category": "Road Infrastructure" | "Sewage & Water" | "Electricity" | "Garbage & Waste" | "Traffic & Transit" | "Health & Sanitation",
        "severity": "Critical" | "Medium" | "Low",
        "department": "The name of the typical local municipal body responsible, e.g. BBMP (Roads), BMC, Delhi Jal Board",
        "description": "An refined, clean version of the citizen's complaint to make it actionable for municipal officials.",
        "estimatedSLA": "SLA countdown, e.g. T+24h Left",
        "commentFromNavi": "A warm, encouraging sentence from Navi the AI Civic Mascot motivating the citizen."
      }
    `;

    let response;

    if (image && image.includes("base64,")) {
      // Image multimodality analysis
      const parts = image.split("base64,");
      const mimeType = parts[0].split(":")[1].split(";")[0];
      const base64Data = parts[1];

      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `${analysisPrompt}\nCitizen Description provided: "${description || 'No textual description provided. Use visual cues.'}"`
          }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
    } else {
      // Text or Voice analysis
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${analysisPrompt}\nCitizen Description/Transcript: "${description}"`,
        config: {
          responseMimeType: "application/json",
        }
      });
    }

    const aiText = response.text || "{}";
    const resultObj = JSON.parse(aiText);
    res.json({ success: true, analysis: resultObj });
  } catch (error: any) {
    console.log("Gemini API status check: active/high-demand - utilizing local swachh engine fallback mode.");
    // Dynamic fallbacks when API is rate-limited, key is missing, or experiencing 503 high-demand
    const heuristicAnalysis = getHeuristicAnalysis(req.body.description);
    res.json({
      success: true,
      analysis: heuristicAnalysis
    });
  }
});

// Gemini AI Proxy endpoint for polishing and refining voice transcription
app.post("/api/gemini/polish", async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text || text.trim() === "") {
      return res.json({ success: true, polishedText: "" });
    }
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert civic communication assistant. Clean up this spoken citizen complaint.
        Spoken text: "${text}"
        Spoken Language / Context: ${language || 'English/Indian Local Language'}

        Instructions:
        1. Correct spelling mistakes, voice recognition errors (e.g., "hsr loyout" to "HSR Layout", "pote hole" to "pothole", "garbeg" to "garbage").
        2. Remove stutters, filler words, or awkward speech repetition.
        3. Keep names of landmarks, locations, and specific streets intact.
        4. Expand shorthand terms into proper words.
        5. Translate to grammatically correct, professional, actionable English if the input is written in another script or includes local words (like "kachra", "paani", "naala").
        6. Retain all factual details.
        7. Return ONLY the polished final description. Do not include any introductory, explaining, or concluding sentences. Just return the text itself.`,
    });

    res.json({ success: true, polishedText: (response.text || text).trim() });
  } catch (error: any) {
    console.error("Gemini Polish Error:", error);
    res.json({ success: true, polishedText: req.body.text || "" });
  }
});

// Gemini AI Proxy endpoint for Navi Mascot Conversation
app.post("/api/gemini/mascot", async (req, res) => {
  try {
    const { prompt, userName, ward } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are Navi, a super-friendly, intelligent, high-vibe Indian civic AI mascot inside the "CivicPulse" application.
        The user's name is "${userName || 'friend'}". They live in "${ward || 'their local ward'}".
        User message: "${prompt}"

        Give a helpful, optimistic response about civic engagement, Swachh Bharat spirit, and the power of local citizens.
        Use 1-2 friendly sentences. Add exactly 1 suitable emoji at the end.`,
    });

    res.json({ success: true, response: response.text || getMascotHeuristicResponse(prompt, userName, ward) });
  } catch (error: any) {
    console.log("Gemini Mascot status check: active/high-demand - utilizing local swachh engine fallback mode.");
    const friendlyFallback = getMascotHeuristicResponse(req.body.prompt, req.body.userName, req.body.ward);
    res.json({ success: true, response: friendlyFallback });
  }
});

// ==========================================
// SERVING APP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
