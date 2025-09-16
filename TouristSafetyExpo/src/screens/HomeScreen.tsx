import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Card, Title, Paragraph, Button, Badge, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { locationService, LocationData } from '../services/LocationService';
import { apiService, TouristData } from '../services/ApiService';
import { socketService } from '../services/SocketService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = width < 375;
const isLandscape = width > height;

interface TouristInfo {
  touristId: string;
  name: string;
  safetyScore: number;
  isRegistered: boolean;
}

const HomeScreen: React.FC = () => {
  const [touristInfo, setTouristInfo] = useState<TouristInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [nearbyZones, setNearbyZones] = useState<any[]>([]);

  useEffect(() => {
    loadTouristInfo();
    getCurrentLocation();
    loadZones();
    setupSocketListeners();
  }, []);

  const loadTouristInfo = async () => {
    // In a real app, this would load from local storage or API
    const savedInfo = {
      touristId: 'demo-tourist-123',
      name: 'John Doe',
      safetyScore: 85,
      isRegistered: true,
    };
    setTouristInfo(savedInfo);
  };

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location');
    }
  };

  const loadZones = async () => {
    try {
      const zones = await apiService.getZones();
      setNearbyZones(zones.slice(0, 3)); // Show first 3 zones
    } catch (error) {
      console.log('Error loading zones:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('geo:alert', (alert) => {
      Alert.alert(
        'Zone Alert',
        `You have entered ${alert.zoneName} (${alert.riskLevel} risk)`,
        [{text: 'OK'}]
      );
    });

    socketService.on('alert:panic', (alert) => {
      Alert.alert(
        'Emergency Alert',
        `Emergency alert from tourist ${alert.touristId}`,
        [{text: 'OK'}]
      );
    });
  };

  const toggleTracking = () => {
    if (isTracking) {
      locationService.stopTracking();
      setIsTracking(false);
    } else {
      if (!touristInfo?.touristId) {
        Alert.alert('Error', 'Please register first to enable tracking');
        return;
      }

      locationService.startTracking((location) => {
        setCurrentLocation(location);
        // Send location update to server
        apiService.sendLocationUpdate(touristInfo.touristId, location);
      });
      setIsTracking(true);
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSafetyScoreText = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const getResponsiveIconSize = () => {
    if (isTablet) return 60;
    if (isSmallScreen) return 30;
    return 40;
  };

  const getResponsiveFontSize = (base: number) => {
    if (isTablet) return base + 4;
    if (isSmallScreen) return base - 2;
    return base;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.landscapeContent
        ]}
        showsVerticalScrollIndicator={false}>
        
        {/* Header Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[
            styles.headerCard,
            isTablet && styles.tabletHeaderCard,
            isSmallScreen && styles.smallHeaderCard
          ]}>
          <View style={[
            styles.headerContent,
            isTablet && styles.tabletHeaderContent,
            isSmallScreen && styles.smallHeaderContent
          ]}>
            <Ionicons 
              name="shield" 
              size={getResponsiveIconSize()} 
              color="white" 
            />
            <Text style={[
              styles.headerTitle,
              { fontSize: getResponsiveFontSize(24) }
            ]}>
              WanderSecure
            </Text>
            <Text style={[
              styles.headerSubtitle,
              { fontSize: getResponsiveFontSize(16) }
            ]}>
              Stay safe during your travels
            </Text>
          </View>
        </LinearGradient>

        {/* Tourist Status Card */}
        <Card style={[
          styles.card,
          isTablet && styles.tabletCard,
          isSmallScreen && styles.smallCard
        ]}>
          <Card.Content style={[
            styles.cardContent,
            isTablet && styles.tabletCardContent
          ]}>
            <View style={[
              styles.statusHeader,
              isTablet && styles.tabletStatusHeader
            ]}>
              <Title style={{ fontSize: getResponsiveFontSize(18) }}>
                Your Status
              </Title>
              {touristInfo?.isRegistered && (
                <Badge style={[
                  styles.badge, 
                  {backgroundColor: '#10b981'},
                  isTablet && styles.tabletBadge
                ]}>
                  Registered
                </Badge>
              )}
            </View>
          
          {touristInfo ? (
            <View>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Name:</Text> {touristInfo.name}
              </Paragraph>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>ID:</Text> {touristInfo.touristId}
              </Paragraph>
              <View style={styles.safetyScoreContainer}>
                <Text style={styles.label}>Safety Score:</Text>
                <View style={[
                  styles.safetyScore,
                  {backgroundColor: getSafetyScoreColor(touristInfo.safetyScore)}
                ]}>
                  <Text style={styles.safetyScoreText}>
                    {getSafetyScoreText(touristInfo.safetyScore)} ({touristInfo.safetyScore})
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Paragraph>Not registered. Please register to use safety features.</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Location Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Current Location</Title>
          {currentLocation ? (
            <View>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Latitude:</Text> {currentLocation.latitude.toFixed(6)}
              </Paragraph>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Longitude:</Text> {currentLocation.longitude.toFixed(6)}
              </Paragraph>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Accuracy:</Text> {currentLocation.accuracy?.toFixed(0)}m
              </Paragraph>
            </View>
          ) : (
            <Paragraph>Location not available</Paragraph>
          )}
          
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={getCurrentLocation}
              style={styles.button}
              icon="map-marker">
              Update Location
            </Button>
            <Button
              mode={isTracking ? "contained" : "outlined"}
              onPress={toggleTracking}
              style={styles.button}
              icon={isTracking ? "stop" : "play"}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Nearby Zones Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Nearby Safety Zones</Title>
          {nearbyZones.length > 0 ? (
            nearbyZones.map((zone, index) => (
              <View key={index} style={styles.zoneItem}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneType}>{zone.type}</Text>
                </View>
                <Badge style={[
                  styles.zoneBadge,
                  {
                    backgroundColor: zone.riskLevel === 'high' ? '#ef4444' :
                                   zone.riskLevel === 'medium' ? '#f59e0b' : '#10b981'
                  }
                ]}>
                  {zone.riskLevel}
                </Badge>
              </View>
            ))
          ) : (
            <Paragraph>No zones found nearby</Paragraph>
          )}
        </Card.Content>
      </Card>

        {/* Quick Actions */}
        <Card style={[
          styles.card,
          isTablet && styles.tabletCard,
          isSmallScreen && styles.smallCard
        ]}>
          <Card.Content style={[
            styles.cardContent,
            isTablet && styles.tabletCardContent
          ]}>
            <Title style={{ fontSize: getResponsiveFontSize(18) }}>
              Quick Actions
            </Title>
            <View style={[
              styles.quickActions,
              isTablet && styles.tabletQuickActions,
              isLandscape && styles.landscapeQuickActions
            ]}>
              <TouchableOpacity style={[
                styles.actionButton,
                isTablet && styles.tabletActionButton,
                isSmallScreen && styles.smallActionButton
              ]}>
                <Ionicons 
                  name="warning" 
                  size={isTablet ? 32 : isSmallScreen ? 20 : 24} 
                  color="#ef4444" 
                />
                <Text style={[
                  styles.actionText,
                  { fontSize: getResponsiveFontSize(12) }
                ]}>
                  Panic Alert
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.actionButton,
                isTablet && styles.tabletActionButton,
                isSmallScreen && styles.smallActionButton
              ]}>
                <Ionicons 
                  name="location" 
                  size={isTablet ? 32 : isSmallScreen ? 20 : 24} 
                  color="#667eea" 
                />
                <Text style={[
                  styles.actionText,
                  { fontSize: getResponsiveFontSize(12) }
                ]}>
                  Share Location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.actionButton,
                isTablet && styles.tabletActionButton,
                isSmallScreen && styles.smallActionButton
              ]}>
                <Ionicons 
                  name="call" 
                  size={isTablet ? 32 : isSmallScreen ? 20 : 24} 
                  color="#10b981" 
                />
                <Text style={[
                  styles.actionText,
                  { fontSize: getResponsiveFontSize(12) }
                ]}>
                  Emergency Call
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  landscapeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  headerCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabletHeaderCard: {
    margin: 24,
    borderRadius: 16,
  },
  smallHeaderCard: {
    margin: 12,
    borderRadius: 8,
  },
  headerContent: {
    padding: 24,
    alignItems: 'center',
  },
  tabletHeaderContent: {
    padding: 32,
  },
  smallHeaderContent: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabletCard: {
    margin: 24,
    marginTop: 0,
    borderRadius: 16,
  },
  smallCard: {
    margin: 12,
    marginTop: 0,
    borderRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  tabletCardContent: {
    padding: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabletStatusHeader: {
    marginBottom: 24,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tabletBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoText: {
    marginBottom: 8,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
  },
  safetyScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  safetyScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  safetyScoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  zoneType: {
    fontSize: 14,
    color: '#6b7280',
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  tabletQuickActions: {
    justifyContent: 'space-between',
    marginTop: 24,
  },
  landscapeQuickActions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabletActionButton: {
    padding: 24,
    borderRadius: 16,
    minWidth: 120,
  },
  smallActionButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 70,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});

export default HomeScreen;
