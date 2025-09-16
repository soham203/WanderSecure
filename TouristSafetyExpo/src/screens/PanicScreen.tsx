import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { Card, Title, Paragraph, Button, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { locationService, LocationData } from '../services/LocationService';
import { apiService } from '../services/ApiService';
import { socketService } from '../services/SocketService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = width < 375;
const isLandscape = width > height;

const PanicScreen: React.FC = () => {
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [touristId, setTouristId] = useState('demo-tourist-123');
  const [emergencyContacts, setEmergencyContacts] = useState([
    {name: 'Police', number: '100'},
    {name: 'Ambulance', number: '108'},
    {name: 'Emergency', number: '112'},
  ]);

  useEffect(() => {
    getCurrentLocation();
    setupSocketListeners();
  }, []);

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

  const setupSocketListeners = () => {
    socketService.on('alert:panic', (alert) => {
      Alert.alert(
        'Emergency Alert',
        `Emergency alert from tourist ${alert.touristId}`,
        [{text: 'OK'}]
      );
    });
  };

  const sendPanicAlert = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get your current location');
      return;
    }

    try {
      // Vibrate phone
      Vibration.vibrate([0, 500, 200, 500]);

      // Send panic alert to server
      await apiService.sendPanicAlert({
        touristId,
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      });

      setIsPanicActive(true);
      
      Alert.alert(
        'Panic Alert Sent',
        'Your emergency alert has been sent to authorities and emergency contacts.',
        [
          {
            text: 'Call Emergency',
            onPress: () => callEmergency('100'),
          },
          {
            text: 'OK',
            onPress: () => setIsPanicActive(false),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send panic alert. Please try again.');
    }
  };

  const callEmergency = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const shareLocation = () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const message = `Emergency! I need help at this location: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
    
    Alert.alert(
      'Share Location',
      message,
      [
        {text: 'Cancel'},
        {text: 'Share', onPress: () => {
          // Implement sharing functionality
          console.log('Sharing:', message);
        }},
      ]
    );
  };

  const getResponsiveIconSize = () => {
    if (isTablet) return 80;
    if (isSmallScreen) return 40;
    return 60;
  };

  const getResponsiveFontSize = (base: number) => {
    if (isTablet) return base + 4;
    if (isSmallScreen) return base - 2;
    return base;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[
        styles.content,
        isLandscape && styles.landscapeContent
      ]}>
        {/* Panic Button */}
        <View style={[
          styles.panicButtonContainer,
          isTablet && styles.tabletPanicButtonContainer,
          isSmallScreen && styles.smallPanicButtonContainer
        ]}>
          <TouchableOpacity
            style={[
              styles.panicButton,
              isPanicActive && styles.panicButtonActive,
              isTablet && styles.tabletPanicButton,
              isSmallScreen && styles.smallPanicButton
            ]}
            onPress={sendPanicAlert}
            disabled={isPanicActive}>
            <LinearGradient
              colors={isPanicActive ? ['#ef4444', '#dc2626'] : ['#ef4444', '#dc2626']}
              style={[
                styles.panicGradient,
                isTablet && styles.tabletPanicGradient,
                isSmallScreen && styles.smallPanicGradient
              ]}>
              <Ionicons 
                name="warning" 
                size={getResponsiveIconSize()} 
                color="white" 
              />
              <Text style={[
                styles.panicButtonText,
                { fontSize: getResponsiveFontSize(20) }
              ]}>
                {isPanicActive ? 'ALERT SENT' : 'PANIC ALERT'}
              </Text>
              <Text style={[
                styles.panicButtonSubtext,
                { fontSize: getResponsiveFontSize(14) }
              ]}>
                {isPanicActive ? 'Help is on the way' : 'Press in emergency'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
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
            
            <Button
              mode="outlined"
              onPress={getCurrentLocation}
              style={styles.button}
              icon="map-marker">
              Update Location
            </Button>
          </Card.Content>
        </Card>

        {/* Emergency Contacts */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Emergency Contacts</Title>
            {emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => callEmergency(contact.number)}>
                  <Ionicons name="call" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                onPress={shareLocation}
                style={styles.actionButton}
                icon="share">
                Share Location
              </Button>
              <Button
                mode="outlined"
                onPress={() => callEmergency('100')}
                style={styles.actionButton}
                icon="phone">
                Call Police
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Tourist ID Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Tourist ID</Title>
            <TextInput
              label="Enter your Tourist ID"
              value={touristId}
              onChangeText={setTouristId}
              style={styles.input}
              mode="outlined"
            />
            <Paragraph style={styles.helpText}>
              Enter your registered Tourist ID to send panic alerts
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  landscapeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  panicButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  tabletPanicButtonContainer: {
    marginVertical: 32,
  },
  smallPanicButtonContainer: {
    marginVertical: 16,
  },
  panicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabletPanicButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  smallPanicButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  panicButtonActive: {
    transform: [{scale: 1.05}],
  },
  panicGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tabletPanicGradient: {
    borderRadius: 140,
    padding: 32,
  },
  smallPanicGradient: {
    borderRadius: 80,
    padding: 16,
  },
  panicButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  panicButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    marginBottom: 8,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    color: '#374151',
  },
  button: {
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  contactNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  callButton: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
});

export default PanicScreen;
