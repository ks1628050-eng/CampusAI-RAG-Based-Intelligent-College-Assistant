# Specification: RAG-Based College Chatbot (CampusAI Assistant)

## 1. Project Overview & Objective
**CampusAI Assistant** is an intelligent, full-stack Retrieval-Augmented Generation (RAG) platform designed for higher education institutions. The system enables students, faculty, and prospective applicants to query official college policies, academic calendars, fee structures, admissions, hostel regulations, examination procedures, and placement statistics in real-time.

Instead of generic or hallucinatory answers, CampusAI strictly retrieves factual knowledge from ingested institutional documents (PDFs, Handbooks, Notices, Policies) using hybrid semantic vector search and keyword retrieval, and cites specific source documents and confidence scores.

---

## 2. System Architecture & RAG Pipeline

```
[Student / Admin User]
         │
         ▼
[React + Vite Frontend (TailwindCSS / Dark-Glassmorphism UI)]
   ├── Chat Interface (Streaming, Speech-to-Text, Text-to-Speech, Citations, Multilingual)
   ├── Admin Console (Document Manager, Chunk Inspector, Analytics, AI FAQ Gen)
   └── Auth Portal (JWT Auth, Role-based Access)
         │
         ▼ (REST API / SSE Streams)
[Express / Node.js Backend Server]
   ├── Auth Service (bcrypt, JWT tokens, RBAC: Student & Admin)
   ├── Ingestion Pipeline
   │     ├── File Extractor (PDF via pdf-parse, Plaintext, Markdown)
   │     ├── Text Chunking (Sliding Window: 500 tokens, 100 token overlap)
   │     └── Embeddings Engine (Gemini Embedding 004 / OpenAI / Local Semantic Vector Engine)
   ├── Vector Store & Retrieval Engine
   │     ├── Vector Database (Persistent SQLite / Vector Store with Cosine Similarity)
   │     ├── BM25 Keyword Search Engine (Lexical Matching)
   │     ├── Hybrid Rank Fusion (RRF: Reciprocal Rank Fusion)
   │     └── Confidence Threshold & Unknown-Query Detector
   ├── Generative LLM Synthesizer (Gemini 1.5 / 2.0 / OpenAI / Fallback Engine with Citations)
   └── Analytics & Feedback Engine (Thumbs Up/Down, Topic Tracking, Unresolved Logs)
```

---

## 3. Core Feature Specifications

### 3.1. User Authentication & Authorization
- **Roles**: `student` and `admin`.
- **Capabilities**:
  - `student`: Access chat interface, ask questions, select department/category filter, view chat history, provide answer feedback, voice input/output, export conversations.
  - `admin`: All student features + Document upload, chunk viewer, document deletion, re-indexing, AI FAQ generation, auto-summarization, analytics dashboard, system RAG configuration.
- **Security**: Password hashing with bcrypt, JWT token authentication, protected endpoints, sanitized inputs.

### 3.2. Document Ingestion & Vector Pipeline
1. **Supported Formats**: PDF (`.pdf`), Plain Text (`.txt`), Markdown (`.md`).
2. **Categories**: Admissions, Academics & Courses, Fees & Scholarships, Examinations, Hostel & Mess, Placements & Internships, Library, Campus Life & Clubs, General Policies.
3. **Chunking Strategy**:
   - Chunk Size: ~500 words / tokens.
   - Overlap: ~100 words (prevents boundary context loss).
   - Metadata attached per chunk: `docId`, `docTitle`, `category`, `department`, `chunkIndex`, `pageNumber`, `tokenCount`.
4. **Vector Database**:
   - Embeddings dimension: 768 / 1536 / normalized semantic vectors.
   - Cosine Similarity & BM25 Hybrid Fusion.
   - Fast sub-10ms retrieval.

### 3.3. Grounded RAG Query Engine
1. **Search**:
   - Generates question embedding.
   - Performs top-$k$ ($k=4$) hybrid vector + keyword search filtered by optional category/department.
   - Computes relevance / confidence score ($0\% - 100\%$).
2. **Confidence Threshold & Unknown Question Handling**:
   - If maximum relevance score < 45% (configurable), system responds with a calibrated graceful fallback: *"I could not find relevant information in the official college documents. Would you like to log this query for the college administration?"*
   - Logs query into `unresolved_queries` database table for admin review.
3. **Prompt Grounding & Citation**:
   - LLM receives context strictly bounded by system instructions: *"Answer strictly using provided institutional documents. Do not speculate. Cite source document titles."*
   - Output contains synthesized response + explicit citation metadata (Document name, snippet preview, match confidence percentage).

### 3.4. Interactive Modern Frontend UI
1. **Student Chat Interface**:
   - Streaming Markdown responses with tables, bullet points, callouts.
   - Expandable Citation Drawer showing exact source chunks.
   - Confidence score pill (e.g., `94% Match • High Confidence`).
   - Category filtering pills (e.g., `All`, `Admissions`, `Hostel`, `Fees`, `Placements`).
   - Quick prompt suggestions for new chats.
   - Voice input (Speech-to-Text via Web Speech API) and Text-to-Speech audio reader.
   - Multilingual support (Translate responses to Hindi, Telugu, Spanish, French, etc.).
   - Feedback buttons (👍 / 👎) with optional user comment modal.
   - Conversation history sidebar (New chat, rename, delete, export as Markdown/PDF/JSON).
2. **Admin Portal**:
   - Drag-and-drop document uploader with category & department selection.
   - Document inventory table: Title, category, chunk count, upload date, file size, action buttons (View Chunks, Summarize, Generate FAQs, Delete).
   - Chunk viewer modal for inspectable RAG debugging.
   - Analytics Dashboard: Total queries, popular query topics, average confidence score, feedback satisfaction rate (positive vs negative), unresolved student queries table with resolution tracker.
   - RAG Settings: Adjust top-$k$, confidence threshold, and model parameters.

---

## 4. API Endpoints Specification

### Auth APIs
- `POST /api/auth/register` - Create user account (Student or Admin).
- `POST /api/auth/login` - Authenticate & return JWT token + user profile.
- `GET /api/auth/me` - Validate session and get current user info.

### Documents & Knowledge Base APIs (Admin / Student Read)
- `POST /api/documents/upload` - Upload PDF/TXT/MD, extract, chunk, embed, and store (Admin).
- `GET /api/documents` - List all uploaded documents with metadata and chunk counts.
- `GET /api/documents/:id/chunks` - View all chunks & embeddings metadata for a document.
- `DELETE /api/documents/:id` - Delete document and purge vector indices (Admin).
- `POST /api/documents/:id/summarize` - Generate AI executive summary of document.
- `POST /api/documents/:id/generate-faqs` - Auto-generate top student FAQs from document.

### RAG & Chat APIs
- `POST /api/chat/query` - Execute RAG search, query LLM, return answer + sources + confidence (Supports JSON or SSE Stream).
- `GET /api/chat/conversations` - List user conversations.
- `POST /api/chat/conversations` - Create new conversation session.
- `GET /api/chat/conversations/:id` - Get message history for a conversation.
- `DELETE /api/chat/conversations/:id` - Delete a conversation.
- `POST /api/chat/feedback` - Submit thumbs up/down + comments for an AI response.

### Analytics & System APIs (Admin)
- `GET /api/analytics/overview` - Aggregate metrics (queries, satisfaction, categories, unanswered).
- `GET /api/analytics/unresolved` - List of queries with low confidence for admin action.
- `POST /api/analytics/unresolved/:id/resolve` - Mark unresolved query as handled.
- `GET /api/system/health` - Server, vector store, and LLM status.

---

## 5. Preloaded College Knowledge Base
The system includes rich, pre-loaded institutional documentation for immediate zero-config testing:
1. `Admissions_Guide_2026.pdf` (Eligibility, cutoff ranks, counseling schedule, reservation policies).
2. `Fee_Structure_and_Scholarships_2026.pdf` (Tuition fees, merit scholarships, fee refund policy).
3. `Hostel_Rules_and_Campus_Facilities.pdf` (Hostel timings, mess menu, room allocation, Wi-Fi guidelines).
4. `Academic_Regulations_and_Exams.pdf` (Grading system, CGPA calculation, attendance criteria, backlogs).
5. `Placement_and_Internship_Report.pdf` (Top recruiters, highest CTC, placement statistics, eligibility criteria).

---

## 6. Directory Structure
```
antigravity2/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Environment config
│   │   ├── controllers/        # Auth, Chat, Document, Analytics controllers
│   │   ├── middleware/         # Auth JWT & RBAC middleware, Multer upload
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # RAG Engine, Vector Store, Chunking, LLM Service, Embedding
│   │   ├── data/               # SQLite DB, uploads folder, preloaded docs
│   │   └── server.js           # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # ChatWindow, MessageItem, SourceModal, Sidebar, Analytics, DocManager
│   │   ├── context/            # AuthContext, ChatContext, ThemeContext
│   │   ├── pages/              # ChatPage, AdminPage, LoginPage, RegisterPage
│   │   ├── services/           # API client services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Premium Tailwind & Glassmorphic CSS design tokens
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── spec.md                     # Full Specification
├── README.md                   # Comprehensive documentation per submission guidelines
└── .gitignore                  # Git ignore for node_modules, .env, DB binaries
```

---

## 7. Submission Checklist Verification
- [x] Must-Have / Core Features: Chat, Auth, Upload, Text Extraction, Chunking, Vector DB, RAG Pipeline, Grounded Answers, Sources Display, Unknown Question Handling, Conversation Context, Admin Document Management, DB integration, Frontend-Backend integration.
- [x] Bonus Features: Multi-collection categories, Admin Analytics, Confidence Scores, Source Highlighting Modal, Thumbs Up/Down Feedback, Speech-to-Text & Text-to-Speech, Multi-language support, Preloaded real documents, AI FAQ generator, Document summarizer.
- [x] GitHub Repository clean standard (no raw secrets, clean .gitignore, .env.example).
- [x] Complete README.md matching exact submission criteria (Problem Statement, Features, Tech Stack, Setup Guide, Environment Variables, Screenshots).
