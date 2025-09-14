# Smart Tourist Safety System - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service development)
- Flutter SDK (for mobile app development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Production
chmod +x setup.sh
./setup.sh
```

### 2. Access Services
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **AI Service**: http://localhost:8001

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Web Dashboard  │    │   IoT Devices   │
│    (Flutter)    │    │   (React.js)    │    │   (Smart Bands) │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Backend API          │
                    │      (NestJS)             │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼───────┐    ┌───────────▼───────────┐    ┌────────▼────────┐
│  PostgreSQL   │    │      Redis Cache      │    │    MongoDB      │
│   Database    │    │                       │    │   (Analytics)   │
└───────────────┘    └───────────────────────┘    └─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    AI/ML Service     │
                    │    (Python FastAPI)  │
                    └───────────────────────┘
```

## 📱 Mobile App (Flutter)

### Features
- Digital Tourist ID with QR code
- Real-time location tracking
- Panic button with emergency contacts
- Geo-fencing alerts
- Safety score monitoring
- Multilingual support (10+ Indian languages)
- Offline capability

### Setup
```bash
cd mobile
flutter pub get
flutter run
```

### Key Components
- **Authentication**: JWT-based with biometric login
- **Location Services**: GPS tracking with background updates
- **Maps Integration**: Google Maps/Mapbox for navigation
- **Notifications**: Push notifications for alerts
- **Offline Storage**: Hive for local data persistence

## 🌐 Web Dashboard (React.js)

### Features
- Real-time tourist monitoring
- Interactive maps with heatmaps
- Alert management system
- Analytics and reporting
- Geo-fence management
- Emergency response coordination

### Setup
```bash
cd frontend
npm install
npm start
```

### Key Components
- **Maps**: Mapbox GL JS for interactive maps
- **Charts**: Recharts for data visualization
- **State Management**: React Query for server state
- **UI Framework**: Material-UI (MUI)
- **Real-time**: Socket.IO for live updates

## 🔧 Backend API (NestJS)

### Features
- RESTful API with OpenAPI documentation
- Real-time WebSocket communication
- JWT authentication and authorization
- Database integration (PostgreSQL + MongoDB)
- Redis caching
- File upload and processing
- Rate limiting and security

### Setup
```bash
cd backend
npm install
npm run start:dev
```

### API Endpoints
- **Authentication**: `/auth/*`
- **Tourists**: `/tourists/*`
- **Safety**: `/safety/*`
- **Blockchain**: `/blockchain/*`
- **AI**: `/ai/*`
- **Dashboard**: `/dashboard/*`

## 🤖 AI/ML Service (Python FastAPI)

### Features
- Anomaly detection using Isolation Forest
- Location pattern analysis
- Safety score calculation
- Risk prediction
- Behavior analysis
- Real-time insights generation

### Setup
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### ML Models
- **Anomaly Detection**: Isolation Forest for unusual patterns
- **Location Analysis**: Geospatial clustering and analysis
- **Risk Assessment**: Multi-factor safety scoring
- **Behavior Analysis**: Pattern recognition for tourist behavior

## 🗄️ Database Schema

### PostgreSQL (Primary Database)
- **tourists**: Tourist profiles and information
- **safety_alerts**: Safety incidents and alerts
- **location_history**: GPS tracking data
- **geo_fences**: Restricted and monitored areas

### MongoDB (Analytics)
- **analytics_data**: Aggregated statistics
- **ml_models**: AI model data and results
- **audit_logs**: System activity logs

### Redis (Caching)
- **session_data**: User sessions
- **location_cache**: Real-time location data
- **notification_queue**: Push notification queue

## 🔐 Security Features

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Multi-factor authentication support
- Session management with Redis

### Data Protection
- End-to-end encryption for sensitive data
- HTTPS/TLS for all communications
- Database encryption at rest
- Secure API key management

### Privacy Compliance
- GDPR compliance for data handling
- Data anonymization for analytics
- User consent management
- Right to data deletion

## 🌍 Multilingual Support

### Supported Languages
- English (Default)
- Hindi (हिन्दी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)

### Implementation
- i18next for web dashboard
- Flutter localization for mobile app
- Backend API supports language headers
- Database stores multilingual content

## 📊 Monitoring & Analytics

### Real-time Monitoring
- Tourist location tracking
- Safety alert monitoring
- System health checks
- Performance metrics

### Analytics Dashboard
- Tourist behavior patterns
- Safety incident trends
- Geographic risk analysis
- Response time metrics

### Reporting
- Daily safety reports
- Monthly analytics summaries
- Emergency response reports
- Custom report generation

## 🚨 Emergency Response

### Panic Button
- One-tap emergency activation
- Automatic location sharing
- Emergency contact notification
- Police/authority alerting

### Alert System
- Real-time alert generation
- Multi-channel notifications (SMS, Email, Push)
- Escalation procedures
- Response tracking

### E-FIR Generation
- Automated missing person reports
- Digital evidence collection
- Police integration
- Case management

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=tourist_safety

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# External Services
AI_SERVICE_URL=http://localhost:8001
MAPBOX_TOKEN=your-mapbox-token
TWILIO_ACCOUNT_SID=your-twilio-sid
```

### Docker Configuration
- Multi-stage builds for optimization
- Health checks for all services
- Volume mounts for data persistence
- Network isolation for security

## 📈 Performance Optimization

### Backend
- Database query optimization
- Redis caching strategy
- Connection pooling
- API response compression

### Frontend
- Code splitting and lazy loading
- Image optimization
- CDN integration
- Service worker caching

### Mobile
- Offline-first architecture
- Background sync
- Image caching
- Battery optimization

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### Mobile Testing
```bash
cd mobile
flutter test
flutter test integration_test/
```

## 🚀 Deployment

### Production Deployment
1. Set up production environment variables
2. Configure SSL certificates
3. Set up monitoring and logging
4. Deploy using Docker Compose
5. Configure load balancing
6. Set up backup procedures

### Cloud Deployment (AWS/Azure/GCP)
- Use managed databases (RDS, Azure SQL)
- Implement auto-scaling
- Set up monitoring (CloudWatch, Azure Monitor)
- Configure CDN for static assets
- Implement disaster recovery

## 📞 Support & Maintenance

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Database performance monitoring
- Infrastructure monitoring

### Maintenance
- Regular security updates
- Database maintenance
- Performance optimization
- Feature updates and bug fixes

## 🔗 Integration Points

### External APIs
- Police department systems
- Emergency services
- Tourism department databases
- Weather services
- Traffic data APIs

### IoT Devices
- Smart bands and wearables
- GPS trackers
- Environmental sensors
- Emergency beacons

## 📋 Troubleshooting

### Common Issues
1. **Database Connection**: Check PostgreSQL service and credentials
2. **Redis Connection**: Verify Redis service is running
3. **Location Services**: Check GPS permissions and accuracy
4. **Push Notifications**: Verify FCM configuration
5. **AI Service**: Check Python dependencies and model files

### Logs
- Backend logs: `docker-compose logs backend`
- AI service logs: `docker-compose logs ai-service`
- Database logs: `docker-compose logs postgres`
- All services: `docker-compose logs -f`

## 📚 Additional Resources

- [API Documentation](http://localhost:3001/api/docs)
- [Mobile App Documentation](./mobile/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [AI Service Documentation](./ai-service/README.md)

---

**For SIH 2025 Team**: This system is designed to be scalable, secure, and user-friendly. All components are production-ready and can be deployed in various environments. The modular architecture allows for easy customization and extension based on specific requirements.
