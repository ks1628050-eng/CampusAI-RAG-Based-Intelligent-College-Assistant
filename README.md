# CampusAI — RAG-Based Intelligent College Assistant

> **An AI-Powered Institutional Assistant with Grounded Semantic Vector Retrieval, Document Ingestion, Hybrid BM25 Ranking, Real-Time Source Citations, and MongoDB Atlas Cloud Integration.**

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![RAG Architecture](https://img.shields.io/badge/Architecture-Hybrid%20RAG%20Vector-purple.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Project Name
**CampusAI: RAG-Based College Information Assistant & Student Advising System**

---

## 2. Problem Statement
In educational institutions, students and applicants routinely struggle to find precise, authoritative answers to critical inquiries regarding **admission cutoffs, tuition fee installments, hostel curfew rules, examination attendance requirements, and placement reports**. Traditional college websites are cluttered with dozens of disjointed PDFs, unstructured notices, and circulars, leading to administrative overhead and misinformation.

**CampusAI** solves this by establishing an institutional **Retrieval-Augmented Generation (RAG)** pipeline. The chatbot extracts, chunks, and semantically embeds official institutional documentation into a vector database. When a student asks a question, CampusAI performs hybrid semantic vector + BM25 keyword retrieval to extract only the relevant official paragraphs, synthesizes a direct answer using an LLM, and provides verifiable document citations with confidence scores. If an inquiry falls outside the institutional knowledge base, the system gracefully responds with calibrated fallback advice and flags the query for administration review.

---

## 3. Features

### ⭐ Core / Must-Have Features
- **Interactive Student Chat Portal**: Students can ask questions across all campus domains in natural language.
- **User Authentication (RBAC)**: Secure JWT authentication supporting `Student` and `Admin` accounts + One-Click Demo evaluation logins.
- **Document Upload & Ingestion**: Upload institutional PDFs (`.pdf`), text files (`.txt`), and Markdown (`.md`).
- **Document Processing (Text Extraction & Chunking)**: Extracts raw text and splits documents into overlapping chunks (~250 words, 50-word overlap) preserving contextual section headers.
- **Embedding Generation**: Vectorizes chunks into dense semantic embeddings using Google Gemini `text-embedding-004` (with local vector engine fallback).
- **Vector Database & Semantic Search**: Stores dense numerical vectors with rich metadata (doc title, category, department, page number).
- **Hybrid RAG Pipeline**: Combines dense vector cosine similarity with lexical BM25 token matching for exact numerical and policy matching.
- **AI-Generated Grounded Answers**: Synthesizes structured, student-friendly answers strictly based on retrieved knowledge base excerpts.
- **Source & Reference Display**: Displays verifiable, clickable source citation badges with exact page references and chunk inspector.
- **Unknown Question Handling**: Calibrated confidence threshold detector that gracefully informs the student and logs the query to the Admin Review Queue.
- **Chat History & Conversation Context**: Multi-session persistent chat history with create, switch, and delete capabilities.
- **Admin Document Management**: Full administrative CRUD to upload, inspect vector chunks, generate executive summaries, create FAQs, and delete documents.
- **Database & Storage Integration**: Dual-mode persistence with MongoDB Atlas cloud sync and persistent local store.
- **Frontend–Backend Integration**: Complete REST API and Event Streaming architecture.

### 🚀 Bonus / Advanced Features
- **⚡ Real-Time RAG Diagnostic Inspector**: Live execution latency (`latencyMs`), chunk search depth, and zero-hallucination verification seal on every response.
- **🎯 1-Click Evaluator Benchmark Suite**: 6 curated gold-standard test scenarios (Admissions, Fees, Hostel, Exams, Placements, Unknown Query).
- **📜 Certified Inquiry Transcript Export**: Exports formatted, timestamped official inquiry reports (`.md` / print-ready) with citation seals.
- **🚨 Campus Emergency Helplines Directory**: 1-click contact copy for Anti-Ragging, Campus Ambulance, Women’s Safety Cell, and Exam Helplines.
- **🔍 Institutional Policy Diff Tool**: Side-by-side comparative semantic analysis across any two college circulars or guideline versions.
- **📊 Compliance & Audit Log Export (CSV)**: 1-click download of institutional inquiry telemetry.
- **🌓 Dark & Light Mode Theme Engine**: Persistent theme switching across all views, cards, modals, and markdown components.
- **🎙️ Speech-to-Text & Text-to-Speech**: Hands-free voice questioning (STT) and voice audio playback (TTS).
- **🌐 Multi-Language Support**: Dropdown translation for English, Hindi, Telugu, Spanish, French, and German.
- **📑 Preloaded Institutional Knowledge Base**: Shipped with 5 complete official documents (Admissions 2026, Fee Structure, Hostel Rules, Academic Regulations, Placement Report).

---

## 4. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS v3, Lucide React Icons, Web Speech API (STT & TTS) |
| **Backend API** | Node.js, Express.js (ES Modules), Mongoose, CORS, Multer |
| **Vector Engine & RAG** | Dense Vector Embeddings, Cosine Similarity, BM25 Lexical Ranking, Google Gemini SDK (`@google/generative-ai`) |
| **Document Processing** | `pdf-parse`, Sliding-Window Chunker with overlap |
| **Database & Cloud Storage** | MongoDB Atlas Cloud Database + Persistent JSON Fallback |
| **Security & Auth** | JSON Web Tokens (JWT), `bcryptjs` password hashing, RBAC |

---

## 5. Screenshots & Architecture

### System Architecture & RAG Pipeline Flow
```
+-------------------------------------------------------------------------+
|                          STUDENT USER / ADMIN                           |
|       (Natural Language Inquiry, Voice STT, Multilingual Selection)      |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  CAMPUSAI FRONTEND (React 18 + Vite)                    |
|  - Dark/Light Theme System           - RAG Diagnostic Latency Inspector  |
|  - 1-Click Evaluator Suite           - Certified Transcript Export      |
|  - Emergency Directory               - Source Citation Inspector        |
+------------------------------------+------------------------------------+
                                     |  REST API / Event Streams
                                     v
+-------------------------------------------------------------------------+
|                     EXPRESS.JS BACKEND ORCHESTRATOR                     |
|  - JWT Authentication Middleware     - Multer File Ingestion Parser     |
|  - Unknown Question Detector         - Analytics & Audit Engine         |
+------------------------------------+------------------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
+--------------------------------+       +--------------------------------+
|       HYBRID RAG RETRIEVAL     |       |      DATABASE PERSISTENCE      |
|  - Dense Vector Cosine Sim     |       |  - MongoDB Atlas Cloud DB      |
|  - Lexical BM25 Keyword Search |       |  - Dual-Mode Auto Sync         |
|  - Sliding-Window Document     |       |  - Local Storage Fallback      |
|    Chunking with Metadata      |       |  - Users, Chunks, Feedback     |
+---------------+----------------+       +--------------------------------+
                |
                v
+-------------------------------------------------------------------------+
|                GROUNDED LLM GENERATION & ANSWER SYNTHESIZER             |
|  - Google Gemini API (`gemini-1.5-flash` / `text-embedding-004`)       |
|  - Built-in Deterministic Zero-Hallucination Synthesizer Fallback      |
|  - Structured Document Citations & Page References                      |
+-------------------------------------------------------------------------+
```

---

## 6. Live Demo
- **Live Deployed Application**: [CampusAI on Render](https://campusai-rag-based-intelligent-college.onrender.com) *(or your deployed Render/Vercel URL)*
- **GitHub Repository**: [https://github.com/ks1628050-eng/CampusAI-RAG-Based-Intelligent-College-Assistant](https://github.com/ks1628050-eng/CampusAI-RAG-Based-Intelligent-College-Assistant)

---

## 7. Backend
- **Live Backend API Endpoint**: `https://campusai-rag-based-intelligent-college.onrender.com/api`
- **Health Check & Diagnostics**: `https://campusai-rag-based-intelligent-college.onrender.com/api/health`

---

## 8. Setup Instructions (Local Development)

### Step 1: Clone Repository
```bash
git clone https://github.com/ks1628050-eng/CampusAI-RAG-Based-Intelligent-College-Assistant.git
cd CampusAI-RAG-Based-Intelligent-College-Assistant
```

### Step 2: Install All Dependencies
```bash
npm run install:all
```

### Step 3: Configure Environment Variables
Create your `backend/.env` file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=campus_ai_super_secret_jwt_key_2026

# Optional: MongoDB Atlas Cloud Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/campus_ai?retryWrites=true&w=majority

# Optional: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run Application
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.
- Click **"Sign In / Demo"** -> Select **"Demo Student"** or **"Demo Admin"** for immediate access.

---

## 9. Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default | Required? |
|---|---|---|---|
| `PORT` | Backend server port | `5000` | No |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` | No |
| `JWT_SECRET` | Secret key for JWT signing & verification | `campus_ai_super_secret_jwt_key_2026` | Yes |
| `MONGODB_URI` | MongoDB Atlas Connection URI (`mongodb+srv://...`) | *Optional* | No (Local fallback enabled) |
| `GEMINI_API_KEY` | Google Gemini API Key for LLM & Embeddings | *Optional* | No (Local fallback enabled) |

### Frontend (`frontend/.env`)
| Variable | Description | Default | Required? |
|---|---|---|---|
| `VITE_API_URL` | Backend API Base URL | Relative (`/api`) | No |

---

## 10. Preloaded Institutional Knowledge Base Documents
The application includes 5 preloaded official institutional documents:
1. `Admissions Guide & Eligibility 2026` (Eligibility, cutoff ranks, counseling rounds, documents required)
2. `Fee Structure & Scholarships 2026` (Tuition fees, mess fees, merit waivers, refund policy)
3. `Hostel Rules & Campus Facilities` (Curfew timings, night out ERP pass, prohibited appliances, healthcare)
4. `Academic Regulations & Examination Guidelines` (75% attendance rule, 10-point grading, backlogs)
5. `Placement & Internship Report 2025-2026` (Highest & avg packages, top recruiters, eligibility criteria)

---

## 11. License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
