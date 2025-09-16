# Tourist Safety Monitor - Expo App

A modern React Native mobile app built with Expo for tourist safety monitoring and emergency response.

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npx expo start
```

3. **Run on device:**
   - Install **Expo Go** app on your phone
   - Scan the QR code from the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## ✨ Features

### 🏠 Home Screen
- Tourist status display with safety score
- Real-time location tracking
- GPS coordinates and accuracy
- Nearby safety zones
- Quick action buttons

### 🚨 Panic Screen
- Large emergency panic button
- Automatic location sharing
- Emergency contact calling
- Vibration feedback
- Tourist ID management

### 👤 Profile Screen
- Tourist registration form
- Personal information management
- Document verification
- Emergency contacts
- Trip information tracking

### ⚙️ Settings Screen
- Language selection (English, Hindi, Bengali)
- Privacy and security settings
- Connection status monitoring
- Data management
- App information

## 🔧 Technical Features

- **Expo Framework**: Easy development and deployment
- **TypeScript**: Type-safe development
- **React Navigation**: Bottom tab navigation
- **React Native Paper**: Material Design components
- **Expo Location**: GPS location services
- **Socket.IO**: Real-time communication
- **AsyncStorage**: Local data persistence

## 📱 Mobile Experience

### Installation Options
1. **Expo Go App** (Recommended for development)
   - Download from App Store/Play Store
   - Scan QR code to run the app
   - No build process required

2. **Development Build** (For production)
   - Build standalone app
   - Install directly on device
   - Full native performance

### Device Requirements
- iOS 11.0+ or Android 6.0+
- GPS/Location services enabled
- Internet connection for backend communication

## 🌐 Backend Integration

The app connects to your existing backend server:
- **Tourist Registration**: POST /api/id
- **Panic Alerts**: POST /api/alert/panic
- **Location Updates**: POST /api/tracking
- **Real-time Updates**: WebSocket connection

## 🚀 Development Commands

```bash
# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Build for production
npx expo build:android
npx expo build:ios

# Publish to Expo
npx expo publish
```

## 📋 Project Structure

```
src/
├── screens/          # App screens
│   ├── HomeScreen.tsx
│   ├── PanicScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
├── services/         # API and utility services
│   ├── ApiService.ts
│   ├── LocationService.ts
│   └── SocketService.ts
└── App.tsx          # Main app component
```

## 🔒 Permissions

The app requires the following permissions:
- **Location**: Fine and coarse location access
- **Phone**: Emergency calling functionality
- **Internet**: Backend communication
- **Vibration**: Emergency feedback

## 🌍 Multilingual Support

- 🇺🇸 English
- 🇮🇳 हिंदी (Hindi)
- 🇧🇩 বাংলা (Bengali)

## 🎯 Demo Features

Perfect for hackathon presentation:
- ✅ **Easy Setup**: No complex build process
- ✅ **Cross-Platform**: Works on iOS and Android
- ✅ **Real-time Features**: Live location tracking and alerts
- ✅ **Professional UI**: Material Design components
- ✅ **Offline Support**: Local data persistence
- ✅ **GPS Integration**: Accurate location services

## 🔧 Configuration

### Backend URL
Update the API base URL in `src/services/ApiService.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

### Socket Connection
Update the socket URL in `src/services/SocketService.ts`:
```typescript
this.socket = io('http://your-backend-url:3000', {
  // ... options
});
```

## 📱 Testing

### On Physical Device
1. Install Expo Go app
2. Run `npx expo start`
3. Scan QR code with Expo Go
4. Test all features

### On Emulator/Simulator
1. Start Android emulator or iOS simulator
2. Run `npx expo start`
3. Press `a` for Android or `i` for iOS
4. Test all features

## 🚀 Deployment

### Expo Go (Development)
```bash
npx expo publish
```

### Standalone App (Production)
```bash
npx expo build:android
npx expo build:ios
```

## 📞 Support

For hackathon/demo use only. Built with Expo for easy development and deployment.

---

**Ready to demo!** 🎉 Just run `npx expo start` and scan the QR code with Expo Go app.
