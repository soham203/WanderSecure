import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { socketService } from '../services/SocketService';

interface AppSettings {
  language: string;
  locationTracking: boolean;
  notifications: boolean;
  darkMode: boolean;
  autoPanic: boolean;
}

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    locationTracking: true,
    notifications: true,
    darkMode: false,
    autoPanic: false,
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const checkConnection = () => {
    setIsConnected(socketService.isSocketConnected());
  };

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your saved data including profile and settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will export your profile and settings data.',
      [{ text: 'OK' }]
    );
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      en: 'English',
      hi: 'हिंदी',
      bn: 'বাংলা',
    };
    return languages[code] || 'English';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="settings" size={60} color="white" />
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your safety experience</Text>
        </View>
      </LinearGradient>

      {/* Language Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Language & Region</Title>
          <List.Item
            title="Language"
            description={getLanguageName(settings.language)}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Select Language',
                'Choose your preferred language',
                [
                  { text: 'English', onPress: () => handleSettingChange('language', 'en') },
                  { text: 'हिंदी', onPress: () => handleSettingChange('language', 'hi') },
                  { text: 'বাংলা', onPress: () => handleSettingChange('language', 'bn') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          />
        </Card.Content>
      </Card>

      {/* Privacy & Security */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Privacy & Security</Title>
          
          <List.Item
            title="Location Tracking"
            description="Allow continuous location tracking for safety"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={settings.locationTracking}
                onValueChange={(value) => handleSettingChange('locationTracking', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Push Notifications"
            description="Receive safety alerts and updates"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Auto Panic Detection"
            description="Automatically detect emergency situations"
            left={(props) => <List.Icon {...props} icon="shield" />}
            right={() => (
              <Switch
                value={settings.autoPanic}
                onValueChange={(value) => handleSettingChange('autoPanic', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Appearance */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Appearance</Title>
          
          <List.Item
            title="Dark Mode"
            description="Use dark theme for better visibility"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Connection Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Connection Status</Title>
          
          <List.Item
            title="Server Connection"
            description={isConnected ? 'Connected' : 'Disconnected'}
            left={(props) => (
              <List.Icon 
                {...props} 
                icon={isConnected ? "check-circle" : "alert-circle"} 
                color={isConnected ? "#10b981" : "#ef4444"}
              />
            )}
            right={() => (
              <Button
                mode="outlined"
                onPress={checkConnection}
                compact>
                Check
              </Button>
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Location Services"
            description="GPS and location services status"
            left={(props) => <List.Icon {...props} icon="crosshairs-gps" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Location', 'Location services are active')}
                compact>
                Status
              </Button>
            )}
          />
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Data Management</Title>
          
          <List.Item
            title="Export Data"
            description="Export your profile and settings"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={exportData}
          />
          
          <Divider />
          
          <List.Item
            title="Clear All Data"
            description="Remove all saved data and settings"
            left={(props) => <List.Icon {...props} icon="delete" color="#ef4444" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={clearData}
          />
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Information</Title>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="Tourist Safety Monitor - Hackathon Demo"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('About', 'Tourist Safety Monitor\nVersion 1.0.0\n\nA hackathon demo app for tourist safety monitoring.')}
          />
        </Card.Content>
      </Card>

      {/* Emergency Reset */}
      <Card style={[styles.card, styles.emergencyCard]}>
        <Card.Content>
          <Title style={styles.emergencyTitle}>Emergency Reset</Title>
          <Paragraph style={styles.emergencyDescription}>
            In case of emergency or if you need to quickly reset all settings
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => {
              Alert.alert(
                'Emergency Reset',
                'This will reset all settings to default. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                      const defaultSettings: AppSettings = {
                        language: 'en',
                        locationTracking: true,
                        notifications: true,
                        darkMode: false,
                        autoPanic: false,
                      };
                      saveSettings(defaultSettings);
                      Alert.alert('Success', 'Settings have been reset to default');
                    },
                  },
                ]
              );
            }}
            style={styles.emergencyButton}
            buttonColor="#ef4444">
            Reset to Default
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
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
  },
  emergencyCard: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  emergencyTitle: {
    color: '#ef4444',
  },
  emergencyDescription: {
    color: '#6b7280',
    marginBottom: 16,
  },
  emergencyButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;
