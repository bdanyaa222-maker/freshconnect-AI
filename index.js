require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

// Serve all HTML, CSS and JS files
app.use(express.static(path.join(__dirname, "..")));

let ai;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

// ---------------- Dummy Data ----------------

const dummyNotices = [
  {
    id: 1,
    title: "End Semester Practical Examination Schedule - Nov 2026",
    category: "Examinations",
    date: "2026-10-25",
    is_new: true,
  },
  {
    id: 2,
    title: "Google Campus Recruitment Drive",
    category: "Placements",
    date: "2026-10-20",
    is_new: false,
  }
];

const dummyPosts = [
  {
    id: 1,
    author_name: "Alex Mercer",
    content: "Welcome to FreshConnect AI!",
    likes: 45,
    comments: 5,
    created_at: new Date().toISOString(),
  }
];
// ---------------- HTML Routes ----------------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "about.html"));
});

app.get("/faculty.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "faculty.html"));
});

app.get("/department.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "department.html"));
});

app.get("/clubs.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "clubs.html"));
});

app.get("/events.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "events.html"));
});

app.get("/notices.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "notices.html"));
});

app.get("/papers.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "papers.html"));
});

app.get("/hub.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "hub.html"));
});

app.get("/timetable.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "timetable.html"));
});

app.get("/map.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "map.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

// ---------------- API Routes ----------------

app.post("/api/login", (req, res) => {
  const { roll_no, password } = req.body;

  if (roll_no && password) {
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        name: roll_no,
        role: "student"
      }
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid Roll Number or Password"
  });
});

app.get("/api/notices", (req, res) => {
  res.json(dummyNotices);
});

app.get("/api/posts", (req, res) => {
  res.json(dummyPosts);
});
// ---------------- AI Chat Route ----------------

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!ai) {
      return res.json({
        reply: "Gemini API Key is not configured."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are FreshConnect AI Assistant. Answer briefly and helpfully.\n\nStudent: ${message}`
    });

    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate response."
    });
  }
});

// Export for Vercel
module.exports = app;