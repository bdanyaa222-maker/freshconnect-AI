require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const pool = require('./config/db'); // MySQL Database Pool
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
// Initialize Gemini API (if key is provided)
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
// IN-MEMORY DATABASE (No MySQL needed!)
// ---------------------------
const dummyNotices = [
    { id: 1, title: 'End Semester Practical Examination Schedule - Nov 2026', category: 'Examinations', date: '2026-10-25', is_new: true },
    { id: 2, title: 'Google Campus Recruitment Drive - Eligible Students List', category: 'Placements', date: '2026-10-20', is_new: false },
    { id: 3, title: 'Holiday Declaration for State Festival', category: 'Circulars', date: '2026-10-15', is_new: false }
];
const dummyPosts = [
    { id: 1, author_name: 'Alex Mercer', content: 'Just published my first research paper on Natural Language Processing optimization! Huge thanks to Prof. Smith for the guidance. 🚀', tags: '#NLP #AI #Research', likes: 42, comments: 5, created_at: new Date().toISOString() },
    { id: 2, author_name: 'Sarah Connor', content: 'Built an autonomous obstacle-avoiding robot for the upcoming Tech Symposium!', tags: '#Robotics #Hardware', likes: 128, comments: 12, created_at: new Date(Date.now() - 86400000).toISOString() }
];
// Routes
// Root route - serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// AI Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!ai) {
      return res.json({ reply: 'Gemini API is not configured. (Please add GEMINI_API_KEY to your .env file). Mock reply: "Block A is near the main entrance."' });
    }
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are FreshConnect AI Assistant for a modern college. Keep answers brief and helpful. Student asked: ${message}`
    });
    
    res.json({ reply: response.text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI request.' });
  }
});
// 2. Student Login endpoint
app.post('/api/login', (req, res) => {
    const { roll_no, password } = req.body;
    
    // Accept any login for demo purposes
    if (roll_no && password) {
        res.json({ success: true, message: 'Login successful', user: { name: 'Student (' + roll_no + ')', role: 'student' } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Roll Number or Password' });
    }
});

// 3. Fetch Notices endpoint
app.get('/api/notices', (req, res) => {
    res.json(dummyNotices);
    
});
// 4. Fetch Hub Posts endpoint
app.get('/api/posts', (req, res) => {
    res.json(dummyPosts);
    
});


// Start Server
app.listen(PORT, () => {
  console.log(`FreshConnect AI server is running on http://localhost:${PORT}`);
});
