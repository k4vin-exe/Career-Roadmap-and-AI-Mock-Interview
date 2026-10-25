SMART CAREER ROADMAP AND AI MOCK INTERVIEW PLATFORM

| KEVIN JOHNSON A A   | 25MX324   |
| S.S. SOBAN   | 25MX348   |

23MX37 – MINI PROJECT

REPORT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE DEGREE OF
MASTER OF COMPUTER APPLICATIONS

ANNA UNIVERSITY
[DEC 2026]

DEPARTMENT OF COMPUTER APPLICATIONS
PSG COLLEGE OF TECHNOLOGY
(Autonomous Institution)
COIMBATORE - 641 004

---

TABLE OF CONTENTS
1. INTRODUCTION
2. SYSTEM ANALYSIS
3. SYSTEM DESIGN
4. SYSTEM IMPLEMENTATION
5. SYSTEM TESTING
6. CONCLUSION
7. BIBLIOGRAPHY

---

ACKNOWLEDGEMENT

We would like to thank everyone who supported us, with suggestions, feedback and their time, while we worked on this project.

We sincerely thank Dr. G. Thilagavathi, Principal, PSG College of Technology, for providing the facilities within the campus that made this work possible.

We are grateful to Dr. N. Ilayaraja, Professor and Head, Department of Computer Applications, PSG College of Technology, for his academic support and encouragement throughout the course.

We extend our thanks to our Programme Coordinator, Dr. A. Kalyani, Associate Professor, Department of Computer Applications, PSG College of Technology, for motivating us to take up this project and see it through.

We are especially thankful to our guide, Dr. M. Subathra, Associate Professor (Sr.Gr), Department of Computer Applications, PSG College of Technology, for her guidance and for reviewing our work at every stage, from the requirements document to the final report.

We also thank all the faculty members of the Department of Computer Applications for their encouragement, and our parents and friends for their constant support.

*(Note: Please double-check the names and designations of the Principal, HOD, Coordinator, and Guide before final printing).*

---

SYNOPSIS

The Smart Career Roadmap and AI Mock Interview Platform is a web application for students and job seekers who are preparing for placements. The idea came from a common situation: there is more free learning material online than anyone can finish, and very little help in deciding what to learn first, how long to spend on it, and when one is ready to face an interview. Interview practice is usually limited to coding problems or to a friend's time, and neither gives regular, specific feedback.

The application asks the user for a target job role and their experience, and then uses a Large Language Model to build a week-by-week roadmap of milestones, with free learning resources attached to each one. The user marks milestones as complete and sees their progress. As the user moves ahead, the mock interview section opens, where the AI asks role-specific technical and behavioural questions. Answers can be typed or spoken. In voice mode, the user's audio is recorded and sent to the server where the Groq Whisper-large-v3 model accurately transcribes the spoken answer to text.

Every answer is evaluated immediately and returns a score, a comment on correctness and clarity, and one or two specific suggestions. Sessions are stored, so an analytics page can show scores by topic and over time. Version 1.0 has a single user role, and each user can read and change only their own profile, roadmap and interview data.

The frontend is written in React.js with Tailwind CSS. The backend is a Node.js and Express REST API with MongoDB as the database, accessed through Mongoose. Authentication uses JSON Web Tokens and bcrypt-hashed passwords. The LLM APIs (Groq Llama-3.3-70b-versatile and Whisper-large-v3) are called exclusively from the backend so that API keys are never exposed to the browser.

---

CHAPTER 1
INTRODUCTION

Getting ready for a first job has become a research task in itself. A student who wants to become a frontend developer or a data analyst can find thousands of free videos, articles and practice sites, but nothing tells them which topics matter for the role, in what order to take them, or how much time each one needs. 

Interview preparation has a similar gap. Coding platforms are useful for algorithmic practice, but a real interview also includes conceptual and behavioural questions, and it is spoken, not typed. Practising with a friend helps, yet it depends on both people being free, and the feedback is only as good as the friend's own experience. 

The Smart Career Roadmap and AI Mock Interview Platform was built to address this gap. It is a full-stack web application that joins the two halves of preparation, learning and interview practice, in one place. The user states a target role and experience level, and receives a personal week-by-week roadmap. Each week is broken into milestones with free resources.

Once the user has made some progress, the mock interview section becomes available. The AI asks questions for the chosen role, the user answers by typing or speaking, and feedback comes back within seconds. Every session is saved, and analytics show which topics are strong and which need more work.

1.1 PROJECT OVERVIEW
The main objective of the platform is to replace scattered, unguided preparation with a single guided loop of assessment, roadmap, practice and feedback. The project covers the following areas:
- Authentication and profile: registration and login with email and password, JWT-based sessions, and a profile page.
- Skill profile creation: classifying the user as Beginner, Intermediate, or Experienced based on their background.
- Roadmap generation: an LLM-generated, week-by-week roadmap of milestones for the chosen role.
- Progress tracking: a Mark Complete action on each milestone, updating overall progress.
- Mock interviews: text and voice interviews with AI-generated, role-specific questions and instant, structured feedback.
- Performance analytics: scores grouped by topic and by date.

The frontend and backend are kept in two separate projects. The frontend is a React application that talks to an Express REST API over HTTPS. The backend exposes 16 distinct API routes grouped into feature modules for authentication, profile, roadmaps, progress, interviews and analytics.

1.2 TOOLS AND TECHNOLOGIES
The technologies follow the MERN stack: MongoDB, Express.js, React and Node.js. The backend uses TypeScript, which adds static types to the server code. The browser and the server exchange data as JSON over a REST API.

React.js and Vite (Frontend)
React is used to build the interface as reusable components. Vite is the build tool and development server, producing a small, optimised production bundle.

Tailwind CSS & Framer Motion
Tailwind CSS is a utility-first CSS framework used for styling. Framer Motion provides page transitions, interactive components, and animated loading screens. 

Charts for Analytics
The analytics page draws score trends and averages using custom UI components built directly with Tailwind CSS.

Node.js and Express.js (Backend)
Node.js is the JavaScript runtime for the server, and Express.js provides routing and middleware. Custom middleware using express-validator handles request validation, error handling and CORS.

MongoDB and Mongoose
MongoDB is a document database, and Mongoose adds schemas and validation on top of it. Milestones and progress are naturally stored inside the roadmap document to ensure atomic updates.

JWT and bcrypt
Authentication uses JSON Web Tokens issued by the jsonwebtoken library. Passwords are never stored as plain text; they are hashed with bcrypt before being saved.

Large Language Model API (Groq)
The platform uses the Groq API through its SDK, running models such as llama-3.3-70b-versatile for incredibly fast JSON generation (roadmaps and evaluations), and whisper-large-v3 for highly accurate audio-to-text transcription. This ensures low latency and high quality without exposing API keys to the client.

Development and Deployment Tools
Visual Studio Code was used as the editor, Git and GitHub for version control, Postman for API testing, and Figma for screen designs. 

---

CHAPTER 2
SYSTEM ANALYSIS

2.1 EXISTING SYSTEM
Most candidates today prepare with a mix of course sites, video playlists, coding-practice websites and messaging groups. Problems include:
- Plenty of Content, No Personal Plan
- Interview Practice Limited to Coding Questions
- Peer Mock Interviews Are Hard to Schedule and Inconsistent
- No Link Between Learning Progress and Interview Readiness

2.2 PROPOSED SYSTEM
The Smart Career Roadmap and AI Mock Interview Platform brings these activities into one web application. The backend asks the Groq LLM for a roadmap in a fixed JSON format. The response is validated before it is saved. 
When the mock interview module opens, the backend asks the LLM for a role-specific technical or behavioural question. In text mode the user types the answer. In voice mode the browser records the audio and sends it to the backend, where the Groq Whisper model accurately converts it to text. The text answer goes back to the LLM, which returns a score, correctness analysis, and suggestions. 

2.3 FUNCTIONAL REQUIREMENTS
- Register with name, email, password and target job role.
- Log in securely via JWT.
- Generate a personalised, week-by-week roadmap.
- Mark milestones as complete.
- Start a text interview, receive a role-relevant question and submit a typed answer.
- Start a voice interview, speak naturally, and have the audio transcribed via backend AI.
- Receive a numeric score and structured feedback after every answer.
- Validate every LLM response to ensure JSON integrity.

2.4 NON-FUNCTIONAL REQUIREMENTS
- Scalability: The API is stateless; session information is carried in the JWT.
- Security: Passwords are stored only as bcrypt hashes. The LLM API key stays on the server.
- Usability: Clean light theme with purple accents, bordered cards, and glassmorphism.

---

CHAPTER 3
SYSTEM DESIGN

3.1 SYSTEM FLOW DIAGRAM
The system follows a three-tier architecture. The presentation tier is the React app. The application tier is the Express API. The data tier is MongoDB Atlas. The LLM service (Groq Llama-3 & Whisper) is reached only from the application tier.

3.2 DATABASE SCHEMA
Collections (Mongoose Models):

Table 3.1 users
- _id: ObjectId (PK)
- name: String
- email: String (unique)
- passwordHash: String

Table 3.2 roadmap_profiles
- _id: ObjectId (PK)
- userId: ObjectId (FK)
- targetRole: String
- weeklyPlan: Array of Objects
- completedTasks: Map
- estimatedReadinessDate: String

Table 3.3 interview_sessions
- _id: ObjectId (PK)
- userId: ObjectId (FK)
- mode: String (text or voice)
- topic: String
- score: Number
- feedback: Object

---

CHAPTER 4
SYSTEM IMPLEMENTATION

4.1 USER AUTHENTICATION MODULE
Implementation
The register controller validates the input, hashes the password using 10 salt rounds, and returns a token that expires in 7 days.

`	ypescript
// controllers/authController.ts
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);
const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
`

4.2 SKILL ASSESSMENT & PROFILE MODULE
Implementation
The system determines the experience level (Beginner, Intermediate, Experienced) based on the user's declared years of experience.

`	ypescript
// services/roadmapService.ts
let expKey = 'Beginner';
const expLower = profileInput.workExperience.toLowerCase();
if (expLower.includes('2') || expLower.includes('3') || expLower.includes('4')) expKey = 'Intermediate';
if (expLower.includes('5') || expLower.includes('experienced')) expKey = 'Experienced';
`

4.3 CAREER ROADMAP GENERATION MODULE
Implementation
A structured prompt is built and sent to the LLM to return strict JSON data. The inputs are validated using express-validator.

`	ypescript
// prompts/roadmapGeneration.ts
export function generateRoadmapPrompt(profile: ProfileInput): string {
  return \You are a career coach. Create a personalized week-by-week roadmap...
Return ONLY this JSON (no markdown, no explanation):
{
  "targetRole": "\",
  "totalWeeks": <number 6-12>,
  "weeklyPlan": [ ... ]
}\;
}
`

4.4 LEARNING RESOURCES & PROGRESS TRACKING MODULE
Implementation
Progress is stored as a Map in the MongoDB document, allowing single atomic writes.

`	ypescript
// services/roadmapService.ts
async updateProgress(profileId: string, userId: string, completedTasks: Record<string, boolean>) {
  const doc = await RoadmapProfile.findOne({ _id: profileId, userId });
  doc.completedTasks = new Map(Object.entries(completedTasks));
  await doc.save();
}
`

4.5 MOCK INTERVIEW MODULE (TEXT & VOICE)
Implementation
Audio is captured on the frontend via MediaRecorder and sent to the backend endpoint, which utilizes Groq's Whisper-large-v3 model to generate a highly accurate text transcript.

`	ypescript
// controllers/interviewController.ts
async transcribeAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  const groqService = GroqService.getInstance();
  const transcript = await groqService.transcribeAudio(filePath);
  res.json({ success: true, text: transcript });
}
`

---

CHAPTER 5
SYSTEM TESTING

5.1 TESTING TECHNIQUES
The platform was tested using Manual API Testing (via Postman) and End-to-End UI Validation (Browser testing). 

API Endpoint Testing
Each of the 16 Express routes was hit via Postman to verify robust error handling, token validation (returning 401 Unauthorized for missing tokens), and correct JSON parsing from the Groq API.

Validation Testing
The finished system was navigated extensively from the user's point of view. Scenarios tested included: user registration, generating a 12-week roadmap, marking daily tasks complete, starting voice and text mock interviews, and analyzing the resulting feedback scores.

Table 5.1 Test Cases and Results
| Test ID | Module | Input / Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC_01 | Registration | Valid details | Account created, JWT issued | 201 Created, token returned | Pass |
| TC_02 | Login | Wrong password | 401 Unauthorized | 401 error returned | Pass |
| TC_03 | Auth | No JWT Token | 401 Unauthorized | API blocks request | Pass |
| TC_04 | Roadmap | Request new roadmap | Returns JSON weekly plan | Formatted roadmap displayed | Pass |
| TC_05 | Progress | Mark task complete | DB Map updates instantly | UI reflects checked task | Pass |
| TC_06 | Interview | Upload voice audio | Groq transcribes audio | Transcript text returned | Pass |
| TC_07 | Feedback | Submit text answer | LLM evaluates correctness | Score and hints returned | Pass |

---

CHAPTER 6
CONCLUSION
The Smart Career Roadmap and AI Mock Interview Platform successfully replaced scattered learning links with one guided preparation loop. Building the project demonstrated the power of combining a full-stack MERN application with state-of-the-art Large Language Models. Requesting JSON in a fixed format allowed dynamic yet structured UI rendering. Integrating Groq's Whisper model completely bypassed frontend speech recognition inconsistencies, providing flawless transcriptions across all devices. 

Future Enhancements
- Resume builder.
- Peer benchmarking.
- Multi-language interviews.

---

CHAPTER 7
BIBLIOGRAPHY

Book References
1. Vasan Subramanian, "Pro MERN Stack: Full Stack Web App Development with Mongo, Express, React, and Node", 2nd Edition, Apress, 2019.
2. Shannon Bradshaw, Eoin Brazil and Kristina Chodorow, "MongoDB: The Definitive Guide", 3rd Edition, O'Reilly Media, 2019.
3. Ethan Brown, "Web Development with Node and Express", 2nd Edition, O'Reilly Media, 2019.
4. David Flanagan, "JavaScript: The Definitive Guide", 7th Edition, O'Reilly Media, 2020.
5. Ian Sommerville, "Software Engineering", 10th Edition, Pearson, 2015.

Web References
- React Documentation: https://react.dev/learn
- Vite Documentation: https://vite.dev/guide/
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Express.js Documentation: https://expressjs.com
- MongoDB Documentation: https://www.mongodb.com/docs/
- Groq Cloud Documentation: https://console.groq.com/docs/
- JWT Introduction: https://jwt.io/introduction
