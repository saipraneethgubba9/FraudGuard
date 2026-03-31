# FraudGuard Deployment Guide

This project is a full-stack application built with React (Vite) and Express (Node.js). Follow these steps to publish it permanently.

## 1. Prerequisites
- A GitHub account
- A [Railway.app](https://railway.app/) or [Render.com](https://render.com/) account

## 2. Environment Variables
You must set the following variables in your hosting provider's dashboard:
- `GEMINI_API_KEY`: Your Google AI API Key.
- `JWT_SECRET`: A long, random string for secure user sessions.
- `NODE_ENV`: Set to `production`.
- `DATABASE_PATH`: (Optional) Set this if using a persistent volume (e.g., `/data/fraudguard.db`).

## 3. Deployment Steps (Railway.app)
1. **Push to GitHub**: Initialize a git repo and push your code.
2. **New Project**: In Railway, select "Deploy from GitHub repo".
3. **Variables**: Add the environment variables listed above.
4. **Volumes (Persistent Data)**:
   - Go to the "Settings" tab of your service.
   - Click "Add Volume".
   - Mount it at `/data`.
   - Set your `DATABASE_PATH` variable to `/data/fraudguard.db`.
5. **Deploy**: Railway will automatically build and start your server.

## 4. Local Build & Test
To test the production build locally:
```bash
npm run build
NODE_ENV=production node server.ts
```

## 5. Reporting Issues
If you encounter "Requested entity was not found" errors with the AI Scam Checker, ensure your `GEMINI_API_KEY` is valid and has billing enabled for paid models.
