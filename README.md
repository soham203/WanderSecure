# Smart Tourist Safety Monitoring & Incident Response System

A comprehensive digital ecosystem for ensuring tourist safety through AI, Blockchain, and Geo-Fencing technologies.

## 🏗️ Architecture

- **Mobile App (Tourists)**: Flutter
- **Web Dashboard (Authorities)**: React.js + Mapbox
- **Backend**: Node.js (NestJS) + Express APIs + Socket.IO
- **Databases**: PostgreSQL + MongoDB + Redis
- **Blockchain**: Hyperledger Fabric
- **AI/ML**: Python (FastAPI) + ML models
- **Cloud**: NIC Cloud / AWS

## 🚀 Features

### For Tourists
- Digital Tourist ID with blockchain verification
- Auto-assigned Safety Score based on travel patterns
- Geo-fencing alerts for high-risk zones
- Panic Button with live location sharing
- Real-time tracking (opt-in)
- Multilingual support (10+ Indian languages)

### For Authorities
- Real-time tourist cluster visualizations
- Heat maps of high-risk zones
- Digital ID records and alert history
- Automated E-FIR generation
- Emergency response coordination

### AI-Powered
- Anomaly detection for unusual behavior
- Predictive alerts for potential incidents
- Route deviation monitoring
- Health and safety pattern analysis

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Start Development Servers**
   ```bash
   npm run dev
   ```

3. **Individual Services**
   ```bash
   # Backend API
   npm run dev:backend
   
   # Web Dashboard
   npm run dev:frontend
   
   # Mobile App
   npm run dev:mobile
   
   # AI Service
   npm run dev:ai
   ```

## 📁 Project Structure

```
Production/
├── backend/           # NestJS API server
├── frontend/          # React.js dashboard
├── mobile/            # Flutter mobile app
├── ai-service/        # Python FastAPI ML service
├── blockchain/        # Hyperledger Fabric integration
├── iot-devices/       # IoT device integration
└── docs/             # Documentation
```

## 🔐 Security Features

- End-to-end encryption
- Blockchain-based identity verification
- GDPR compliance
- Secure API authentication
- Data privacy protection

## 🌐 Multilingual Support

Supports 10+ Indian languages including:
- Hindi, Tamil, Telugu, Bengali, Marathi
- Gujarati, Kannada, Malayalam, Punjabi, Odia
- English (default)

## 📱 IoT Integration

- Smart bands for high-risk areas
- Continuous health monitoring
- Manual SOS functionality
- Real-time location tracking

## 🤝 Contributing

This project is developed for SIH 2025. Please follow the coding standards and contribute responsibly.

## 📄 License

MIT License - See LICENSE file for details