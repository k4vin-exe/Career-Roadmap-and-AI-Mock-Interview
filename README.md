# Career R&I (Career Roadmap & AI Mock Interview)

> An AI-powered personal career command center offering custom week-by-week learning roadmaps and voice-enabled interactive AI mock interviews.

---

## 📖 Quick Setup & Installation Guide

For full detailed documentation, see [`SETUP_GUIDE.txt`](./SETUP_GUIDE.txt) and [`documentation.md`](./documentation.md).

### ⚡ Quick Start (5 Minutes)

#### 1. Prerequisites
- **Node.js**: `v18+` or higher
- **MongoDB**: Local MongoDB or MongoDB Atlas URI
- **AI API Key**: [Google Gemini API Key](https://aistudio.google.com/) or [Groq API Key](https://console.groq.com/)

#### 2. Clone Repository
```bash
git clone https://github.com/k4vin-exe/Career-Roadmap-and-AI-Mock-Interview.git
cd Career-Roadmap-and-AI-Mock-Interview
```

#### 3. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-mock-interview
CLIENT_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```
Start server:
```bash
npm run dev
```

#### 4. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```

#### 5. Launch
Open your browser at `http://localhost:5173`.

---

## 🌟 Key Features
- 🎯 **AI Roadmap Generation**: Personalized weekly goals, topics, and daily tasks tailored to your role & skills.
- 🎙️ **Voice-Enabled AI Mock Interviews**: Live voice capture using Web Speech API with real-time AI feedback.
- 📊 **Detailed Performance Reports**: Scoring breakdown across technical accuracy, communication, and topic mastery.
- 🎨 **Modern Light Theme UI**: Built with Framer Motion, Tailwind CSS, Lucide icons, and sleek glassmorphism aesthetic.
