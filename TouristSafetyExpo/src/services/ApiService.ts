import { LocationData } from './LocationService';

const API_BASE_URL = 'http://localhost:3000/api';

export interface TouristData {
  name: string;
  docType: string;
  docNumber: string;
  itinerary: {
    days: number;
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
  }>;
  tripStart: string;
  tripEnd: string;
}

export interface TouristResponse {
  touristId: string;
  receiptId: string;
  safetyScore: number;
}

export interface PanicAlertData {
  touristId: string;
  lat: number;
  lng: number;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, {...defaultOptions, ...options});
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async registerTourist(touristData: TouristData): Promise<TouristResponse> {
    return this.makeRequest<TouristResponse>('/id', {
      method: 'POST',
      body: JSON.stringify(touristData),
    });
  }

  async sendPanicAlert(panicData: PanicAlertData): Promise<{ok: boolean}> {
    return this.makeRequest<{ok: boolean}>('/alert/panic', {
      method: 'POST',
      body: JSON.stringify(panicData),
    });
  }

  async sendLocationUpdate(touristId: string, location: LocationData): Promise<{ok: boolean}> {
    return this.makeRequest<{ok: boolean}>('/tracking', {
      method: 'POST',
      body: JSON.stringify({
        touristId,
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
      }),
    });
  }

  async sendGeoEvent(
    touristId: string,
    event: string,
    zoneId: string,
    location: LocationData,
  ): Promise<{ok: boolean}> {
    return this.makeRequest<{ok: boolean}>('/geo/event', {
      method: 'POST',
      body: JSON.stringify({
        touristId,
        event,
        zoneId,
        lat: location.latitude,
        lng: location.longitude,
      }),
    });
  }

  async getTouristInfo(touristId: string): Promise<any> {
    return this.makeRequest(`/tourists/${touristId}`);
  }

  async getZones(): Promise<any[]> {
    return this.makeRequest<any[]>('/zones');
  }
}

export const apiService = new ApiService();
