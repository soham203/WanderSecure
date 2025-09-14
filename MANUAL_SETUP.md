# Manual Setup Guide (Without Docker)

## Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- MongoDB 7+

## Step 1: Install Prerequisites

### Install Node.js
1. Download from: https://nodejs.org/
2. Install Node.js 18 or higher
3. Verify: `node --version`

### Install Python
1. Download from: https://www.python.org/downloads/
2. Install Python 3.11 or higher
3. Verify: `python --version`

### Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL 15
3. Create database: `tourist_safety`
4. Set password: `password`

### Install Redis
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Install Redis 7
3. Start Redis service

### Install MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB 7
3. Start MongoDB service

## Step 2: Setup Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env file with your database credentials
npm run start:dev
```

## Step 3: Setup AI Service

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

## Step 4: Setup Frontend

```bash
cd frontend
npm install
npm start
```

## Step 5: Setup Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

## Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Service: http://localhost:8001
- API Docs: http://localhost:3001/api/docs
