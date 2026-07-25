 require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

// Serve all static files
app.use(express.static(path.join(__dirname)));

// Gemini
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

// --------------------
// Dummy Data
// --------------------
const dummyNotices = [
  {
    id: 1,
    title: "End Semester Practical Examination Schedule",
    category: "Examinations",
    date: "2026-10-25",
    is_new: true,
  },
];

const dummyPosts = [
  {
    id: 1,
    author_name: "Alex",
    content: "Welcome to FreshConnect!",
    likes: 25,
    comments: 3,
    created_at: new Date().toISOString(),
  },
];

// --------------------
// HTML Routes
// --------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/faculty.html", (req, res) => {
  res.sendFile(path.join(__dirname, "faculty.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// --------------------
// API Routes
// --------------------

app.post("/api/login", (req, res) => {
  const { roll_no, password } = req.body;

  if (roll_no && password) {
    return res.json({
      success: true,
      user: {
        name: roll_no,
      },
    });
  }

  res.status(401).json({
    success: false,
  });
});

app.get("/api/notices", (req, res) => {
  res.json(dummyNotices);
});

app.get("/api/posts", (req, res) => {
  res.json(dummyPosts);
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.json({
        reply: "Gemini API Key not configured.",
      });
    }

    const { message } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    res.json({
      reply: response.text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "AI Error",
    });
  }
});

// Export for Vercel
module.exports = app;