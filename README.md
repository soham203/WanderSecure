Smart Tourist Safety Monitoring – MERN Prototype (Presentation)

Overview
- Simple MERN app for demo/presentation:
  - Backend: Node.js (Express + Socket.IO) with MongoDB
  - Frontend: React (Vite) single page
  - No Docker, no AI, no blockchain in this cut
  - Demonstrates: Tourist ID issuance, Panic alerts, Real-time updates

Quick Start
1) Prereqs: Node.js 18+, MongoDB running locally (mongodb://127.0.0.1:27017)
2) Install deps
   - cd backend && npm install
   - cd ../client && npm install
3) Run backend
   - cd backend && npm run dev
   - Backend on http://localhost:3000
4) Run frontend
   - cd client && npm run dev
   - Frontend on http://localhost:5173
5) Demo
   - Issue ID from frontend form
   - Trigger Panic alert; see live updates

Repo Structure
- backend/            Express + Socket.IO APIs (MongoDB)
- client/             React (Vite) SPA

Core Flows Implemented
- Digital ID issuance: stores KYC-lite, trip window, emergency contacts in Mongo, emits socket event, writes append-only receipt (hash + HMAC).
- Panic button: accepts touristId + location, broadcasts via Socket.IO, stores alert in Mongo.
- Geo events: endpoint for enter/exit zone; broadcasts to client (simulated).

API (Prototype)
- POST /api/id → issue tourist ID
  - body: { name, docType, docNumber, itinerary, emergencyContacts, tripStart, tripEnd }
  - returns: { touristId, receiptId, safetyScore }
- POST /api/alert/panic → raise SOS
  - body: { touristId, lat, lng }
- GET /api/tourists → list issued IDs
- GET /health → service check

Environment
- MongoDB mongodb://127.0.0.1:27017/wander

Notes
- This is a simplified MERN demo. AI, Blockchain, and advanced dashboards are omitted.

Security Notes
- Do NOT use in production. No auth, minimal security.

License
- For hackathon/demo use only.


