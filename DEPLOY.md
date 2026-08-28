# 🚀 CampusAI — Deployment & Production Guide

This guide provides end-to-end instructions for deploying **CampusAI** to free cloud hosting platforms (Render, Railway, Vercel) and managing your project with Git & GitHub.

---

## 📋 Table of Contents
1. [Git Setup & Pushing to GitHub](#1-git-setup--pushing-to-github)
2. [Option A: Deploy to Render (Recommended - 1-Click Unified Service)](#2-option-a-deploy-to-render-recommended)
3. [Option B: Deploy to Railway](#3-option-b-deploy-to-railway)
4. [Option C: Decoupled Deployment (Vercel Frontend + Render Backend)](#4-option-c-decoupled-deployment)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Post-Deployment Verification](#6-post-deployment-verification)

---

## 1. Git Setup & Pushing to GitHub

### Step 1: Create a New Repository on GitHub
1. Go to [GitHub](https://github.com/new) and log in.
2. Enter a repository name (e.g. `campus-ai-rag-chatbot`).
3. Set visibility to **Public** or **Private**.
4. **Do NOT** initialize with a README, .gitignore, or license (these already exist locally).
5. Click **Create repository**.

### Step 2: Push Local Code to GitHub
Open PowerShell or your terminal in the project root directory (`antigravity2`):

```bash
# 1. Initialize local git repository
git init

# 2. Stage all project files (secrets in .env are automatically ignored)
git add .

# 3. Commit your project
git commit -m "feat: complete CampusAI RAG college chatbot with MongoDB Atlas and latency diagnostics"

# 4. Set default branch to main
git branch -M main

# 5. Link your remote GitHub repository
git remote add origin https://github.com/ks1628050-eng/CampusAI-RAG-Based-Intelligent-College-Assistant.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 2. Option A: Deploy to Render (Recommended)

Render allows you to host both the React frontend and Express backend as a **single unified Web Service** for free.

### Steps:
1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`CampusAI-RAG-Based-Intelligent-College-Assistant`).
4. Configure the service settings:
   - **Name**: `campus-ai-rag`
   - **Language / Runtime**: `Node`
   - **Region**: Closest to your users (e.g., `Singapore`, `Frankfurt`, `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root)
   - **Build Command**:
     ```bash
     npm run build:all
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free

5. Add **Environment Variables** under the **Environment** tab:
   | Key | Value | Note |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render assigns port |
   | `JWT_SECRET` | `your_super_secret_jwt_key_here` | Any secure random string |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |

6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a live public URL (e.g. `https://campus-ai-rag.onrender.com`).

---

## 3. Option B: Deploy to Railway

1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository (`campus-ai-rag-chatbot`).
4. In **Settings**:
   - **Build Command**: `npm run build:all`
   - **Start Command**: `npm start`
5. In **Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_random_secret_string`
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
6. Click **Generate Domain** under Networking.

---

## 4. Option C: Decoupled Deployment

If you prefer hosting the frontend on Vercel and backend on Render/Railway:

### Backend (Render Web Service):
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`
- **Env Variables**: `MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET`

### Frontend (Vercel):
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Env Variable**: `VITE_API_URL` = `https://your-backend-service.onrender.com`

---

## 5. Environment Variables Reference

### Backend
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=campus_ai_super_secret_jwt_key_2026
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/campus_ai?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

### Frontend (Only needed if decoupled)
```env
VITE_API_URL=https://your-backend-service.onrender.com
```

---

## 6. Post-Deployment Verification

1. Open your live deployment URL in your browser.
2. Check `/api/health` (e.g. `https://your-app.onrender.com/api/health`):
   ```json
   {
     "status": "healthy",
     "databaseType": "MongoDB Atlas (Connected)",
     "mongoConnected": true,
     "vectorStoreChunks": 11,
     "documentsCount": 5,
     "geminiConfigured": true
   }
   ```
3. Test **"⚡ Evaluator Suite"** on the home page to run a live query in 1 click.
4. Verify source citations and real-time response latency.
