import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { apiService, TouristData } from '../services/ApiService';

interface TouristProfile {
  touristId: string;
  name: string;
  docType: string;
  docNumber: string;
  safetyScore: number;
  tripStart: string;
  tripEnd: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
  }>;
  isRegistered: boolean;
}

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<TouristProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TouristData>({
    name: '',
    docType: 'passport',
    docNumber: '',
    itinerary: {days: 3},
    emergencyContacts: [{name: '', phone: ''}],
    tripStart: '',
    tripEnd: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    // In a real app, this would load from local storage or API
    const mockProfile: TouristProfile = {
      touristId: 'demo-tourist-123',
      name: 'John Doe',
      docType: 'passport',
      docNumber: 'A1234567',
      safetyScore: 85,
      tripStart: '2024-01-15',
      tripEnd: '2024-01-20',
      emergencyContacts: [
        {name: 'Jane Doe', phone: '+91-9876543210'},
        {name: 'Emergency Contact', phone: '+91-9876543211'},
      ],
      isRegistered: true,
    };
    setProfile(mockProfile);
    setFormData({
      name: mockProfile.name,
      docType: mockProfile.docType,
      docNumber: mockProfile.docNumber,
      itinerary: {days: 3},
      emergencyContacts: mockProfile.emergencyContacts,
      tripStart: mockProfile.tripStart,
      tripEnd: mockProfile.tripEnd,
    });
  };

  const handleRegister = async () => {
    try {
      const response = await apiService.registerTourist(formData);
      
      Alert.alert(
        'Registration Successful',
        `Your Tourist ID: ${response.touristId}\nSafety Score: ${response.safetyScore}`,
        [{text: 'OK'}]
      );

      setProfile({
        touristId: response.touristId,
        name: formData.name,
        docType: formData.docType,
        docNumber: formData.docNumber,
        safetyScore: response.safetyScore,
        tripStart: formData.tripStart,
        tripEnd: formData.tripEnd,
        emergencyContacts: formData.emergencyContacts,
        isRegistered: true,
      });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Registration Failed', 'Please check your information and try again.');
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

  const addEmergencyContact = () => {
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, {name: '', phone: ''}],
    });
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      emergencyContacts: newContacts,
    });
  };

  const updateEmergencyContact = (index: number, field: 'name' | 'phone', value: string) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index][field] = value;
    setFormData({
      ...formData,
      emergencyContacts: newContacts,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="person" size={60} color="white" />
          <Text style={styles.headerTitle}>
            {profile?.isRegistered ? 'Profile' : 'Register'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {profile?.isRegistered ? 'Your tourist information' : 'Register for safety monitoring'}
          </Text>
        </View>
      </LinearGradient>

      {profile?.isRegistered && !isEditing ? (
        // Display Profile
        <View>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Personal Information</Title>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Name:</Text> {profile.name}
              </Paragraph>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Tourist ID:</Text> {profile.touristId}
              </Paragraph>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Document:</Text> {profile.docType.toUpperCase()} - {profile.docNumber}
              </Paragraph>
              <Paragraph style={styles.infoText}>
                <Text style={styles.label}>Trip Period:</Text> {profile.tripStart} to {profile.tripEnd}
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Safety Information</Title>
              <View style={styles.safetyScoreContainer}>
                <Text style={styles.label}>Safety Score:</Text>
                <View style={[
                  styles.safetyScore,
                  {backgroundColor: getSafetyScoreColor(profile.safetyScore)}
                ]}>
                  <Text style={styles.safetyScoreText}>
                    {getSafetyScoreText(profile.safetyScore)} ({profile.safetyScore})
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Emergency Contacts</Title>
              {profile.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Button
            mode="outlined"
            onPress={() => setIsEditing(true)}
            style={styles.button}
            icon="edit">
            Edit Profile
          </Button>
        </View>
      ) : (
        // Registration/Edit Form
        <View>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Personal Information</Title>
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Document Type"
                value={formData.docType}
                onChangeText={(text) => setFormData({...formData, docType: text})}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Document Number"
                value={formData.docNumber}
                onChangeText={(text) => setFormData({...formData, docNumber: text})}
                style={styles.input}
                mode="outlined"
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Trip Information</Title>
              <TextInput
                label="Trip Start Date (YYYY-MM-DD)"
                value={formData.tripStart}
                onChangeText={(text) => setFormData({...formData, tripStart: text})}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Trip End Date (YYYY-MM-DD)"
                value={formData.tripEnd}
                onChangeText={(text) => setFormData({...formData, tripEnd: text})}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Trip Duration (Days)"
                value={formData.itinerary.days.toString()}
                onChangeText={(text) => setFormData({
                  ...formData,
                  itinerary: {days: parseInt(text) || 0}
                })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.emergencyHeader}>
                <Title>Emergency Contacts</Title>
                <TouchableOpacity onPress={addEmergencyContact}>
                  <Ionicons name="add" size={24} color="#667eea" />
                </TouchableOpacity>
              </View>
              
              {formData.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.emergencyContact}>
                  <TextInput
                    label="Contact Name"
                    value={contact.name}
                    onChangeText={(text) => updateEmergencyContact(index, 'name', text)}
                    style={styles.input}
                    mode="outlined"
                  />
                  <TextInput
                    label="Phone Number"
                    value={contact.phone}
                    onChangeText={(text) => updateEmergencyContact(index, 'phone', text)}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                  />
                  {formData.emergencyContacts.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeEmergencyContact(index)}
                      style={styles.removeButton}>
                      <Ionicons name="remove" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              icon="check">
              {profile?.isRegistered ? 'Update Profile' : 'Register'}
            </Button>
            {isEditing && (
              <Button
                mode="outlined"
                onPress={() => setIsEditing(false)}
                style={styles.button}>
                Cancel
              </Button>
            )}
          </View>
        </View>
      )}
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
  contactItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    marginBottom: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyContact: {
    marginBottom: 16,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
});

export default ProfileScreen;
