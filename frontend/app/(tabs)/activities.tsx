import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { activitiesAPI, dashboardAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { Activity } from '../../types';

const DRIVER_ACTIVITY_TYPES = ['Route', 'Delivery', 'Vehicle Check', 'Site Visit', 'Other'];
const PROMOTER_ACTIVITY_TYPES = ['Store Visit', 'Promotion', 'Branding', 'Demo', 'Other'];

export default function ActivitiesScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activityTypes = user?.role === 'vendor' ? DRIVER_ACTIVITY_TYPES : PROMOTER_ACTIVITY_TYPES;

  // Fetch today's activities
  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['todayActivities'],
    queryFn: activitiesAPI.getToday,
  });

  // Fetch dashboard stats for day status
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getMobileStats,
  });

  const createMutation = useMutation({
    mutationFn: activitiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayActivities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setCapturedPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleSubmit = async () => {
    if (!capturedPhoto) {
      Alert.alert('Error', 'Please capture a photo');
      return;
    }

    setSubmitting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await createMutation.mutateAsync({
        description: description || undefined,
        photo: capturedPhoto,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        activity_type: activityType || undefined,
      });

      setModalVisible(false);
      setCapturedPhoto(null);
      setDescription('');
      setActivityType('');
      Alert.alert('Success', 'Activity submitted successfully!');
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to submit activity'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = stats?.day_status === 'in_progress';

  const renderActivity = ({ item }: { item: Activity }) => (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityTypeContainer}>
          <Ionicons name="camera" size={16} color="#4F46E5" />
          <Text style={styles.activityType}>
            {item.activity_type || 'Activity'}
          </Text>
        </View>
        <Text style={styles.activityTime}>
          {format(new Date(item.created_at), 'h:mm a')}
        </Text>
      </View>
      
      {item.photo && (
        <Image
          source={{ uri: item.photo }}
          style={styles.activityImage}
          resizeMode="cover"
        />
      )}
      
      {item.description && (
        <Text style={styles.activityDescription}>{item.description}</Text>
      )}
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
        <Text style={styles.locationText}>
          {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activities</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'EEEE, MMM d')}</Text>
      </View>

      {!canSubmit && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            {stats?.day_status === 'completed'
              ? 'Day has ended. Cannot submit activities.'
              : 'Start your day to submit activities.'}
          </Text>
        </View>
      )}

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No activities yet today</Text>
            <Text style={styles.emptySubtext}>
              Capture photos to document your work
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, !canSubmit && styles.fabDisabled]}
        onPress={takePhoto}
        disabled={!canSubmit}
      >
        <Ionicons name="camera" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Activity Submission Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Activity</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {capturedPhoto && (
              <Image
                source={{ uri: capturedPhoto }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.inputLabel}>Activity Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
            >
              {activityTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    activityType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setActivityType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      activityType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a note about this activity..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Button
              title="Submit Activity"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 20,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#4F46E5',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  submitButton: {
    marginBottom: 40,
  },
});
