import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Alert, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import PanicScreen from './src/screens/PanicScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import { initLocationService } from './src/services/LocationService';
import { initSocketConnection } from './src/services/SocketService';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = width < 375;

export default function App() {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  useEffect(() => {
    // Initialize location services
    initLocationService().then(setIsLocationEnabled);
    
    // Initialize socket connection
    initSocketConnection();
  }, []);

  const getTabBarIconSize = () => {
    if (isTablet) return 28;
    if (isSmallScreen) return 20;
    return 24;
  };

  const getTabBarLabelSize = () => {
    if (isTablet) return 14;
    if (isSmallScreen) return 10;
    return 12;
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#667eea" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;

                if (route.name === 'Home') {
                  iconName = 'home';
                } else if (route.name === 'Panic') {
                  iconName = 'warning';
                } else if (route.name === 'Profile') {
                  iconName = 'person';
                } else if (route.name === 'Settings') {
                  iconName = 'settings';
                } else {
                  iconName = 'help';
                }

                return <Ionicons name={iconName} size={getTabBarIconSize()} color={color} />;
              },
              tabBarActiveTintColor: '#667eea',
              tabBarInactiveTintColor: 'gray',
              tabBarLabelStyle: {
                fontSize: getTabBarLabelSize(),
                fontWeight: '600',
                marginTop: 2,
              },
              tabBarStyle: {
                height: isTablet ? 80 : isSmallScreen ? 60 : 70,
                paddingBottom: Platform.OS === 'ios' ? (isTablet ? 20 : 15) : 8,
                paddingTop: 8,
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 8,
              },
              headerStyle: {
                backgroundColor: '#667eea',
                height: isTablet ? 100 : 80,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: isTablet ? 20 : 18,
              },
            })}>
            <Tab.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Safety Monitor' }}
            />
            <Tab.Screen 
              name="Panic" 
              component={PanicScreen}
              options={{ title: 'Emergency' }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Tab.Navigator>
          
          {!isLocationEnabled && (
            <View style={[styles.locationWarning, { paddingHorizontal: isTablet ? 24 : 16 }]}>
              <Text style={[styles.warningText, { fontSize: isTablet ? 16 : 14 }]}>
                ⚠️ Location services are required for safety features
              </Text>
            </View>
          )}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  locationWarning: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f59e0b',
  },
  warningText: {
    color: '#92400e',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});