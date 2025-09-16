from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import uvicorn

app = FastAPI(title="Tourist Safety AI Service", version="1.0.0")

# Pydantic models
class LocationData(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    accuracy: float = None

class TouristData(BaseModel):
    touristId: str
    locations: List[LocationData]
    safetyScore: float = None
    riskFactors: Dict[str, Any] = {}

class AnomalyRequest(BaseModel):
    touristId: str
    data: Dict[str, Any]

class SafetyScoreRequest(BaseModel):
    touristId: str
    factors: Dict[str, Any]

class RiskPredictionRequest(BaseModel):
    touristId: str
    currentLocation: Dict[str, float]
    timeOfDay: str

# Global variables for ML models
isolation_forest = IsolationForest(contamination=0.1, random_state=42)
scaler = StandardScaler()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Service"}

@app.post("/analyze-location-pattern")
async def analyze_location_pattern(request: TouristData):
    """Analyze tourist location patterns for anomalies"""
    try:
        if not request.locations:
            return {"riskScore": 0.5, "anomalies": []}
        
        # Extract coordinates
        coords = np.array([[loc.latitude, loc.longitude] for loc in request.locations])
        
        # Simple anomaly detection based on location clustering
        if len(coords) > 3:
            # Fit isolation forest for anomaly detection
            coords_scaled = scaler.fit_transform(coords)
            anomalies = isolation_forest.fit_predict(coords_scaled)
            
            # Calculate risk score based on anomaly ratio
            anomaly_ratio = np.sum(anomalies == -1) / len(anomalies)
            risk_score = min(1.0, anomaly_ratio * 2)
        else:
            risk_score = 0.3  # Low risk for insufficient data
        
        return {
            "riskScore": float(risk_score),
            "anomalies": [{"type": "location_deviation", "severity": "medium"}] if risk_score > 0.7 else []
        }
    except Exception as e:
        return {"riskScore": 0.5, "anomalies": [], "error": str(e)}

@app.post("/detect-anomalies")
async def detect_anomalies(request: AnomalyRequest):
    """Detect anomalies in tourist behavior"""
    try:
        data = request.data
        
        # Simple anomaly detection based on common patterns
        anomalies = []
        
        # Check for unusual movement patterns
        if "speed" in data and data["speed"] > 100:  # km/h
            anomalies.append({"type": "high_speed", "severity": "high"})
        
        # Check for late night activity
        if "timeOfDay" in data and data["timeOfDay"] == "night":
            anomalies.append({"type": "late_night_activity", "severity": "medium"})
        
        # Check for location changes
        if "locationChanges" in data and data["locationChanges"] > 10:
            anomalies.append({"type": "frequent_location_changes", "severity": "medium"})
        
        risk_score = min(1.0, len(anomalies) * 0.3)
        
        return {
            "anomalies": anomalies,
            "riskScore": risk_score
        }
    except Exception as e:
        return {"anomalies": [], "riskScore": 0.5, "error": str(e)}

@app.post("/calculate-safety-score")
async def calculate_safety_score(request: SafetyScoreRequest):
    """Calculate safety score based on various factors"""
    try:
        factors = request.factors
        score = 0.5  # Base score
        
        # Adjust score based on factors
        if "location_risk" in factors:
            score += factors["location_risk"] * 0.3
        
        if "time_risk" in factors:
            score += factors["time_risk"] * 0.2
        
        if "behavior_risk" in factors:
            score += factors["behavior_risk"] * 0.3
        
        if "weather_risk" in factors:
            score += factors["weather_risk"] * 0.2
        
        # Normalize score to 0-1 range
        score = max(0.0, min(1.0, score))
        
        return {"safetyScore": score}
    except Exception as e:
        return {"safetyScore": 0.5, "error": str(e)}

@app.post("/predict-risk")
async def predict_risk(request: RiskPredictionRequest):
    """Predict risk level for current situation"""
    try:
        location = request.currentLocation
        time_of_day = request.timeOfDay
        
        risk_level = "low"
        confidence = 0.7
        
        # Simple risk prediction logic
        if time_of_day == "night":
            risk_level = "medium"
            confidence = 0.8
        elif time_of_day == "late_night":
            risk_level = "high"
            confidence = 0.9
        
        # Check for high-risk coordinates (example: remote areas)
        if location.get("latitude", 0) < 10 or location.get("latitude", 0) > 40:
            risk_level = "medium"
            confidence = 0.8
        
        return {
            "riskLevel": risk_level,
            "confidence": confidence,
            "recommendations": [
                "Stay in well-lit areas",
                "Share location with emergency contacts",
                "Avoid isolated locations"
            ]
        }
    except Exception as e:
        return {"riskLevel": "medium", "confidence": 0.5, "error": str(e)}

@app.post("/generate-insights")
async def generate_insights(request: TouristData):
    """Generate insights and recommendations"""
    try:
        insights = []
        recommendations = []
        
        if request.safetyScore and request.safetyScore > 0.7:
            insights.append("High risk detected in recent activity")
            recommendations.append("Consider activating panic mode")
            recommendations.append("Share location with emergency contacts")
        
        if len(request.locations) > 20:
            insights.append("Frequent location changes detected")
            recommendations.append("Consider staying in one area for safety")
        
        return {
            "insights": insights,
            "recommendations": recommendations
        }
    except Exception as e:
        return {"insights": [], "recommendations": [], "error": str(e)}

@app.post("/process-emergency-signal")
async def process_emergency_signal(request: AnomalyRequest):
    """Process emergency signals and determine response priority"""
    try:
        data = request.data
        
        priority = "medium"
        response = "standard"
        
        # Determine priority based on signal data
        if data.get("signalType") == "panic_button":
            priority = "critical"
            response = "immediate"
        elif data.get("signalType") == "geo_fence_violation":
            priority = "high"
            response = "urgent"
        elif data.get("signalType") == "anomaly_detected":
            priority = "medium"
            response = "monitor"
        
        return {
            "priority": priority,
            "response": response,
            "estimatedResponseTime": "5 minutes" if priority == "critical" else "15 minutes"
        }
    except Exception as e:
        return {"priority": "high", "response": "immediate", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
