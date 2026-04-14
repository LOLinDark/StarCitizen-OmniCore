# OMNI-CORE: Citizen Operations & Intelligence Network

> "Take the helm. Own your success."

A comprehensive Star Citizen companion dashboard — tools, guides, and resources for citizens of the verse.

## Tech Stack
- React 18 + Vite
- Mantine UI
- Express (backend API)
- Google Gemini + AWS Bedrock (AI)

## Setup
```bash
npm install
```

## Running
```bash
# Frontend (port 5173)
npm run dev

# Backend API (port 3001)
npm run server
```

## Environment Variables
Copy `.env` and add your keys:
- `GEMINI_API_KEY` — Google Gemini API key
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — optional, for Bedrock
- `PORT` — backend port (default 3001)

## Project Structure
```
/src          - React frontend
/server       - Express backend API
/public       - PWA assets
```

## Disclaimer
OMNI-CORE is a fan-made project. Star Citizen® is a registered trademark of Cloud Imperium Rights LLC.
