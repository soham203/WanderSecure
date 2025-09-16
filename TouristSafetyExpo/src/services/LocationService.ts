import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.log('Location error:', error);
      throw new Error('Unable to get current location');
    }
  }

  startTracking(callback: (location: LocationData) => void): void {
    if (this.isTracking) return;

    this.requestLocationPermission().then((hasPermission) => {
      if (!hasPermission) return;

      this.isTracking = true;
      this.watchSubscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          callback(locationData);
        }
      );
    });
  }

  stopTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
      this.isTracking = false;
    }
  }

  isLocationTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = new LocationService();

export const initLocationService = async (): Promise<boolean> => {
  return await locationService.requestLocationPermission();
};
