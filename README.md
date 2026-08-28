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

### ⭐ Core RAG & Intelligence Features
- **Interactive Student Chat Portal**: Students can ask questions across all campus domains in natural language.
- **Role-Based Authentication (RBAC)**: Secure JWT authentication supporting `Student` and `Admin` accounts + One-Click Demo evaluation buttons.
- **Document Ingestion Engine**: Upload PDFs (`.pdf`), text files (`.txt`), and Markdown (`.md`).
- **Text Extraction & Sliding-Window Chunking**: Splits institutional documents into overlapping chunks (~250 words, 50-word overlap) preserving paragraph and section headers.
- **Vector Embeddings & Persistent Vector Store**: Generates dense numerical embeddings and stores them with rich metadata (doc title, category, department, page number).
- **Hybrid Retrieval (Vector + BM25)**: Combines dense vector cosine similarity with lexical BM25 token matching for exact acronyms and policies.
- **Strict Grounding & Zero Hallucination**: Synthesizes answers strictly using retrieved context.
- **Verifiable Source Citations**: Shows clickable source tags (e.g., `Admissions Guide 2026 • Page 2`) opening the exact chunk inspector.
- **Unknown Question Detector**: Calibrated confidence threshold detector that flags low-confidence queries for college administration review.
- **Conversation History & Session Memory**: Full multi-session chat history with create, switch, and delete actions.
- **Admin Document Management**: Upload, inspect vector chunks, summarize, generate FAQs, and delete documents with automatic vector index purging.

### 🌟 Advanced & Submission Excellence Features
- **⚡ Real-Time RAG Diagnostic Inspector**: Displays exact query execution latency (`latencyMs`), hybrid retrieval stages, and zero-hallucination verification seal on every response.
- **🎯 1-Click Evaluator Benchmark Suite**: 6 curated gold-standard test scenarios (Admissions, Fees, Hostel, Exams, Placements, Unknown Query) for rapid evaluation.
- **📜 Certified Inquiry Transcript Export**: Exports formatted, timestamped official inquiry reports (`.md` / print-ready) with citation seals.
- **🚨 Campus Emergency Helplines Directory**: 1-click contact copy for Anti-Ragging, Campus Ambulance, Women’s Safety Cell, and Exam Helplines.
- **🔍 Institutional Policy Diff Tool**: Side-by-side comparative semantic analysis across any two college guidelines or handbook versions.
- **📊 Compliance & Audit Log Export (CSV)**: 1-click download of institutional inquiry telemetry.
- **🍃 MongoDB Atlas Cloud Integration**: Dual-mode persistence with automatic collection synchronization and graceful local fallback.
- **🌓 Dark & Light Mode Theme Engine**: Persistent theme switching across all views, cards, modals, and markdown components.
- **🎙️ Speech-to-Text & Text-to-Speech**: Voice input questioning and natural audio playback.
- **🌐 Multi-Language Support**: Dropdown translation for English, Hindi, Telugu, Spanish, French, and German.
- **📑 Preloaded Institutional Knowledge Base**: Shipped with 5 complete official documents (Admissions 2026, Fee Structure, Hostel Rules, Academic Regulations, Placement Report).

---

## 4. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS v3, Lucide Icons, Web Speech API (STT & TTS) |
| **Backend API** | Node.js, Express.js (ES Modules), Mongoose, CORS, Multer |
| **Vector Engine & RAG** | Dense Vector Embeddings, Cosine Similarity, BM25 Lexical Ranking, Google Gemini SDK (`@google/generative-ai`) |
| **Document Processing** | `pdf-parse`, Sliding-Window Chunker with overlap |
| **Database & Cloud Storage** | MongoDB Atlas Cloud Database + Persistent JSON Fallback |
| **Security & Auth** | JSON Web Tokens (JWT), `bcryptjs` password hashing, RBAC |

---

## 5. System Architecture & RAG Flow

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

## 6. Quick Start Guide (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/campus-ai-rag-chatbot.git
cd campus-ai-rag-chatbot

# Install root, backend, and frontend dependencies in one command
npm run install:all
```

### 2. Configure Environment Variables
Copy the example environment files:
```bash
# Backend Environment:
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=campus_ai_super_secret_jwt_key_2026

# Optional: MongoDB Atlas Cloud Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/campus_ai?retryWrites=true&w=majority

# Optional: Google Gemini API Key (system includes built-in semantic vector retrieval fallback)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend and Frontend Concurrently
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.
- Click **"Sign In / Demo"** -> Select **"Demo Student"** or **"Demo Admin"**!

---

## 7. Git & Production Deployment

For complete step-by-step instructions on pushing to GitHub and deploying to **Render**, **Railway**, or **Vercel**, refer to the dedicated guide:

👉 **[Read the Full Deployment Guide (DEPLOY.md)](./DEPLOY.md)**

### Quick Git Commands:
```bash
# 1. Initialize & Stage files
git init
git add .

# 2. Commit
git commit -m "feat: complete CampusAI RAG college chatbot"

# 3. Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/campus-ai-rag-chatbot.git
git push -u origin main
```

---

## 8. Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default | Required? |
|---|---|---|---|
| `PORT` | Backend server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `JWT_SECRET` | Secret key for JWT signing | `campus_ai_super_secret_jwt_key_2026` | Yes |
| `MONGODB_URI` | MongoDB Atlas Connection URI (`mongodb+srv://...`) | *Optional* | No (Local fallback enabled) |
| `GEMINI_API_KEY` | Google Gemini API Key for LLM & Embeddings | *Optional* | No (Local fallback enabled) |

### Frontend (`frontend/.env`)
| Variable | Description | Default | Required? |
|---|---|---|---|
| `VITE_API_URL` | Backend API Base URL | Relative (`/api`) | No |

---

## 9. Preloaded Official College Documents
The application includes 5 preloaded institutional documents:
1. `Admissions Guide & Eligibility 2026` (Eligibility, cutoff ranks, counseling rounds, documents required)
2. `Fee Structure & Scholarships 2026` (Tuition fees, mess fees, merit waivers, refund policy)
3. `Hostel Rules & Campus Facilities` (Curfew timings, night out ERP pass, prohibited appliances, healthcare)
4. `Academic Regulations & Examination Guidelines` (75% attendance rule, 10-point grading, backlogs)
5. `Placement & Internship Report 2025-2026` (Highest & avg packages, top recruiters, eligibility criteria)

---

## 10. License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
