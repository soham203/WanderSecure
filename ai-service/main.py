from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.metrics.pairwise import haversine_distances
import geopy.distance
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Tourist Safety AI Service",
    description="AI/ML service for tourist safety monitoring and anomaly detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LocationData(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None

class TouristData(BaseModel):
    touristId: str
    locations: List[LocationData]
    personalInfo: Optional[Dict[str, Any]] = None

class AnomalyRequest(BaseModel):
    touristId: str
    data: Dict[str, Any]

class SafetyScoreRequest(BaseModel):
    touristId: str
    factors: Dict[str, Any]

class RiskPredictionRequest(BaseModel):
    touristId: str
    location: Dict[str, float]
    timeOfDay: str

class BehaviorAnalysisRequest(BaseModel):
    touristId: str
    behavior: Dict[str, Any]

class InsightsRequest(BaseModel):
    touristId: str
    data: Dict[str, Any]

# AI Models and Services
class AnomalyDetector:
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit(self, data: np.ndarray):
        """Fit the anomaly detection model"""
        scaled_data = self.scaler.fit_transform(data)
        self.isolation_forest.fit(scaled_data)
        self.is_fitted = True

    def predict(self, data: np.ndarray) -> List[bool]:
        """Predict anomalies in the data"""
        if not self.is_fitted:
            return [False] * len(data)
        
        scaled_data = self.scaler.transform(data)
        predictions = self.isolation_forest.predict(scaled_data)
        return predictions == -1

class SafetyScoreCalculator:
    def __init__(self):
        self.weights = {
            'location_risk': 0.3,
            'time_risk': 0.2,
            'behavior_risk': 0.2,
            'historical_risk': 0.2,
            'environmental_risk': 0.1
        }

    def calculate(self, factors: Dict[str, Any]) -> float:
        """Calculate safety score based on various factors"""
        score = 0.0
        
        # Location risk (0-1, higher is more dangerous)
        location_risk = factors.get('location_risk', 0.5)
        score += location_risk * self.weights['location_risk']
        
        # Time risk (0-1, higher is more dangerous)
        time_risk = factors.get('time_risk', 0.5)
        score += time_risk * self.weights['time_risk']
        
        # Behavior risk (0-1, higher is more dangerous)
        behavior_risk = factors.get('behavior_risk', 0.5)
        score += behavior_risk * self.weights['behavior_risk']
        
        # Historical risk (0-1, higher is more dangerous)
        historical_risk = factors.get('historical_risk', 0.5)
        score += historical_risk * self.weights['historical_risk']
        
        # Environmental risk (0-1, higher is more dangerous)
        environmental_risk = factors.get('environmental_risk', 0.5)
        score += environmental_risk * self.weights['environmental_risk']
        
        return min(max(score, 0.0), 1.0)

class LocationAnalyzer:
    def __init__(self):
        self.risk_zones = self._load_risk_zones()

    def _load_risk_zones(self) -> List[Dict[str, Any]]:
        """Load predefined risk zones"""
        return [
            {
                'name': 'High Crime Area',
                'center': {'lat': 15.2993, 'lng': 74.1240},
                'radius': 1000,
                'risk_level': 0.8
            },
            {
                'name': 'Remote Forest Area',
                'center': {'lat': 15.3500, 'lng': 74.1000},
                'radius': 2000,
                'risk_level': 0.9
            }
        ]

    def analyze_pattern(self, locations: List[LocationData]) -> Dict[str, Any]:
        """Analyze location patterns for anomalies"""
        if len(locations) < 2:
            return {'risk_score': 0.5, 'anomalies': []}

        # Convert to numpy array
        coords = np.array([[loc.latitude, loc.longitude] for loc in locations])
        timestamps = np.array([loc.timestamp for loc in locations])
        
        # Calculate movement patterns
        distances = []
        speeds = []
        
        for i in range(1, len(locations)):
            dist = geopy.distance.geodesic(
                (locations[i-1].latitude, locations[i-1].longitude),
                (locations[i].latitude, locations[i].longitude)
            ).meters
            
            time_diff = (timestamps[i] - timestamps[i-1]).total_seconds()
            speed = dist / time_diff if time_diff > 0 else 0
            
            distances.append(dist)
            speeds.append(speed)

        # Detect anomalies
        anomalies = []
        
        # Check for sudden location changes
        if distances:
            avg_distance = np.mean(distances)
            for i, dist in enumerate(distances):
                if dist > avg_distance * 3:  # 3x average distance
                    anomalies.append({
                        'type': 'sudden_location_change',
                        'severity': 'high',
                        'description': f'Sudden location change of {dist:.0f}m',
                        'timestamp': timestamps[i+1]
                    })

        # Check for unusual speeds
        if speeds:
            avg_speed = np.mean(speeds)
            for i, speed in enumerate(speeds):
                if speed > avg_speed * 2:  # 2x average speed
                    anomalies.append({
                        'type': 'unusual_speed',
                        'severity': 'medium',
                        'description': f'Unusual speed of {speed:.1f} m/s',
                        'timestamp': timestamps[i+1]
                    })

        # Check proximity to risk zones
        risk_score = 0.0
        for loc in locations:
            for zone in self.risk_zones:
                distance = geopy.distance.geodesic(
                    (loc.latitude, loc.longitude),
                    (zone['center']['lat'], zone['center']['lng'])
                ).meters
                
                if distance <= zone['radius']:
                    risk_score = max(risk_score, zone['risk_level'])
                    anomalies.append({
                        'type': 'risk_zone_proximity',
                        'severity': 'high',
                        'description': f'Near {zone["name"]}',
                        'timestamp': loc.timestamp
                    })

        return {
            'risk_score': risk_score,
            'anomalies': anomalies,
            'total_distance': sum(distances),
            'avg_speed': np.mean(speeds) if speeds else 0,
            'location_count': len(locations)
        }

# Initialize AI services
anomaly_detector = AnomalyDetector()
safety_calculator = SafetyScoreCalculator()
location_analyzer = LocationAnalyzer()

@app.get("/")
async def root():
    return {"message": "Smart Tourist Safety AI Service is running! 🤖"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AI Service",
        "version": "1.0.0"
    }

@app.post("/analyze-location-pattern")
async def analyze_location_pattern(request: TouristData):
    """Analyze tourist location patterns for anomalies"""
    try:
        result = location_analyzer.analyze_pattern(request.locations)
        return {
            "touristId": request.touristId,
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error analyzing location pattern: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-anomalies")
async def detect_anomalies(request: AnomalyRequest):
    """Detect anomalies in tourist behavior and location data"""
    try:
        # Extract features for anomaly detection
        features = []
        
        # Location features
        if 'locations' in request.data:
            locations = request.data['locations']
            if len(locations) > 0:
                coords = np.array([[loc['latitude'], loc['longitude']] for loc in locations])
                features.extend(coords.flatten())
        
        # Time features
        current_hour = datetime.now().hour
        time_features = [
            np.sin(2 * np.pi * current_hour / 24),  # Hour of day
            np.cos(2 * np.pi * current_hour / 24),
            current_hour / 24  # Normalized hour
        ]
        features.extend(time_features)
        
        # Pad or truncate to fixed length
        max_features = 20
        if len(features) < max_features:
            features.extend([0] * (max_features - len(features)))
        else:
            features = features[:max_features]
        
        features_array = np.array(features).reshape(1, -1)
        
        # Detect anomalies
        is_anomaly = anomaly_detector.predict(features_array)[0]
        
        # Calculate risk score
        risk_score = 0.5
        if is_anomaly:
            risk_score = 0.8
        
        return {
            "touristId": request.touristId,
            "isAnomaly": bool(is_anomaly),
            "riskScore": float(risk_score),
            "confidence": 0.8 if is_anomaly else 0.6,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calculate-safety-score")
async def calculate_safety_score(request: SafetyScoreRequest):
    """Calculate safety score for a tourist"""
    try:
        safety_score = safety_calculator.calculate(request.factors)
        
        # Convert to categorical score
        if safety_score < 0.3:
            score_category = "low"
        elif safety_score < 0.6:
            score_category = "medium"
        elif safety_score < 0.8:
            score_category = "high"
        else:
            score_category = "critical"
        
        return {
            "touristId": request.touristId,
            "safetyScore": float(safety_score),
            "scoreCategory": score_category,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error calculating safety score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-risk")
async def predict_risk(request: RiskPredictionRequest):
    """Predict risk level for tourist at current location and time"""
    try:
        location = request.location
        time_of_day = request.timeOfDay
        
        # Calculate location risk
        location_risk = 0.0
        for zone in location_analyzer.risk_zones:
            distance = geopy.distance.geodesic(
                (location['latitude'], location['longitude']),
                (zone['center']['lat'], zone['center']['lng'])
            ).meters
            
            if distance <= zone['radius']:
                location_risk = max(location_risk, zone['risk_level'])
        
        # Calculate time risk
        current_hour = datetime.now().hour
        if 22 <= current_hour or current_hour <= 5:  # Night time
            time_risk = 0.8
        elif 18 <= current_hour <= 22:  # Evening
            time_risk = 0.6
        else:  # Day time
            time_risk = 0.3
        
        # Combine risks
        total_risk = (location_risk + time_risk) / 2
        
        # Determine risk level
        if total_risk < 0.3:
            risk_level = "low"
            confidence = 0.8
        elif total_risk < 0.6:
            risk_level = "medium"
            confidence = 0.7
        elif total_risk < 0.8:
            risk_level = "high"
            confidence = 0.8
        else:
            risk_level = "critical"
            confidence = 0.9
        
        return {
            "touristId": request.touristId,
            "riskLevel": risk_level,
            "confidence": confidence,
            "locationRisk": float(location_risk),
            "timeRisk": float(time_risk),
            "totalRisk": float(total_risk),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error predicting risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-behavior")
async def analyze_behavior(request: BehaviorAnalysisRequest):
    """Analyze tourist behavior patterns"""
    try:
        behavior = request.behavior
        
        # Analyze various behavior patterns
        is_normal = True
        confidence = 0.8
        anomalies = []
        
        # Check for unusual app usage patterns
        if 'app_usage' in behavior:
            usage_time = behavior['app_usage'].get('total_time', 0)
            if usage_time > 8 * 60 * 60:  # More than 8 hours
                is_normal = False
                anomalies.append("Excessive app usage")
        
        # Check for unusual location update frequency
        if 'location_updates' in behavior:
            update_freq = behavior['location_updates'].get('frequency', 0)
            if update_freq > 100:  # More than 100 updates per hour
                is_normal = False
                anomalies.append("Unusual location update frequency")
        
        # Check for panic button usage
        if 'panic_activated' in behavior and behavior['panic_activated']:
            is_normal = False
            anomalies.append("Panic button activated")
        
        return {
            "touristId": request.touristId,
            "isNormal": is_normal,
            "confidence": confidence,
            "anomalies": anomalies,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error analyzing behavior: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-insights")
async def generate_insights(request: InsightsRequest):
    """Generate insights and recommendations for tourist safety"""
    try:
        data = request.data
        insights = []
        recommendations = []
        
        # Analyze location patterns
        if 'locations' in data:
            locations = data['locations']
            if len(locations) > 10:
                # Check for clustering
                coords = np.array([[loc['latitude'], loc['longitude']] for loc in locations])
                if len(coords) > 2:
                    clustering = DBSCAN(eps=0.01, min_samples=2).fit(coords)
                    n_clusters = len(set(clustering.labels_)) - (1 if -1 in clustering.labels_ else 0)
                    
                    if n_clusters > 1:
                        insights.append("Tourist visits multiple distinct areas")
                        recommendations.append("Consider setting up geo-fences for frequently visited areas")
        
        # Analyze time patterns
        if 'timestamps' in data:
            timestamps = [datetime.fromisoformat(ts) for ts in data['timestamps']]
            hours = [ts.hour for ts in timestamps]
            
            night_activity = sum(1 for h in hours if h < 6 or h > 22)
            if night_activity > len(hours) * 0.3:
                insights.append("High night-time activity detected")
                recommendations.append("Consider additional safety measures for night-time travel")
        
        # Analyze alert patterns
        if 'alerts' in data:
            alert_count = len(data['alerts'])
            if alert_count > 5:
                insights.append("High number of safety alerts")
                recommendations.append("Review safety protocols and consider additional monitoring")
        
        return {
            "touristId": request.touristId,
            "insights": insights,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
