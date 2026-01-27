import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { dashboardAPI, attendanceAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getMobileStats,
  });

  // Attendance mutation
  const attendanceMutation = useMutation({
    mutationFn: attendanceAPI.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
      return null;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        return `data:image/jpeg;base64,${result.assets[0].base64}`;
      }
      return null;
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
      return null;
    }
  };

  const handleStartDay = async () => {
    setLocationLoading(true);
    try {
      const location = await getLocation();
      if (!location) return;

      // Optional: Take start photo
      const photo = await takePhoto();

      await attendanceMutation.mutateAsync({
        action: 'start',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        photo: photo || undefined,
      });

      Alert.alert('Success', 'Day started successfully!');
    } catch (error: any) {
      console.error('Start day error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to start day'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleEndDay = async () => {
    Alert.alert(
      'End Day',
      'Are you sure you want to end your day? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Day',
          style: 'destructive',
          onPress: async () => {
            setLocationLoading(true);
            try {
              const location = await getLocation();
              if (!location) return;

              const photo = await takePhoto();
              if (!photo) {
                Alert.alert('Required', 'End day photo is required');
                return;
              }

              await attendanceMutation.mutateAsync({
                action: 'end',
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || undefined,
                photo,
              });

              Alert.alert('Success', 'Day ended successfully!');
            } catch (error: any) {
              console.error('End day error:', error);
              Alert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to end day'
              );
            } finally {
              setLocationLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return '#22C55E';
      case 'completed':
        return '#6B7280';
      default:
        return '#EF4444';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'Day In Progress';
      case 'completed':
        return 'Day Completed';
      default:
        return 'Not Started';
    }
  };

  const getRoleLabel = () => {
    return user?.role === 'vendor' ? 'Driver' : 'Promoter';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={user?.role === 'vendor' ? 'car' : 'megaphone'}
                size={14}
                color="#4F46E5"
              />
              <Text style={styles.roleText}>{getRoleLabel()}</Text>
            </View>
          </View>
          <Text style={styles.date}>{format(new Date(), 'EEE, MMM d')}</Text>
        </View>

        {/* Day Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(stats?.day_status || 'not_started') },
              ]}
            />
            <Text style={styles.statusText}>
              {getStatusText(stats?.day_status || 'not_started')}
            </Text>
          </View>

          {stats?.start_time && (
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Started:</Text>
              <Text style={styles.timeValue}>
                {format(new Date(stats.start_time), 'h:mm a')}
              </Text>
            </View>
          )}

          {stats?.end_time && (
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Ended:</Text>
              <Text style={styles.timeValue}>
                {format(new Date(stats.end_time), 'h:mm a')}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {stats?.day_status === 'not_started' && (
              <Button
                title="Start Day"
                onPress={handleStartDay}
                loading={locationLoading || attendanceMutation.isPending}
                style={styles.startButton}
              />
            )}

            {stats?.day_status === 'in_progress' && (
              <Button
                title="End Day"
                onPress={handleEndDay}
                loading={locationLoading || attendanceMutation.isPending}
                variant="danger"
                style={styles.endButton}
              />
            )}
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="camera-outline" size={28} color="#4F46E5" />
            <Text style={styles.statValue}>{stats?.activities_count || 0}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </Card>

          <Card style={styles.statCard}>
            <Ionicons name="wallet-outline" size={28} color="#22C55E" />
            <Text style={styles.statValue}>
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(stats?.total_expenses || 0)}
            </Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </Card>
        </View>

        {/* Last Activity */}
        {stats?.last_activity && (
          <Card title="Last Activity" style={styles.lastActivityCard}>
            <Text style={styles.activityType}>
              {stats.last_activity.activity_type || 'Activity'}
            </Text>
            {stats.last_activity.description && (
              <Text style={styles.activityDescription}>
                {stats.last_activity.description}
              </Text>
            )}
            <Text style={styles.activityTime}>
              {format(new Date(stats.last_activity.created_at), 'h:mm a')}
            </Text>
          </Card>
        )}

        {/* Location Info */}
        {stats?.last_location && (
          <Card title="Last Location" style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color="#4F46E5" />
              <Text style={styles.locationText}>
                {stats.last_location.latitude.toFixed(6)},{' '}
                {stats.last_location.longitude.toFixed(6)}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  actionButtons: {
    marginTop: 16,
  },
  startButton: {
    backgroundColor: '#22C55E',
  },
  endButton: {},
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  lastActivityCard: {
    marginBottom: 16,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  locationCard: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
  },
});
