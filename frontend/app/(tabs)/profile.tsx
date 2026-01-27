import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { attendanceAPI } from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Fetch attendance history
  const { data: history = [] } = useQuery({
    queryKey: ['attendanceHistory'],
    queryFn: attendanceAPI.getHistory,
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const getRoleLabel = () => {
    return user?.role === 'vendor' ? 'Driver' : 'Promoter';
  };

  const getRoleIcon = () => {
    return user?.role === 'vendor' ? 'car' : 'megaphone';
  };

  const getStatusStats = () => {
    const completed = history.filter((a) => a.status === 'completed').length;
    const inProgress = history.filter((a) => a.status === 'in_progress').length;
    return { completed, inProgress, total: history.length };
  };

  const stats = getStatusStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={getRoleIcon()} size={16} color="#4F46E5" />
            <Text style={styles.roleText}>{getRoleLabel()}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Days Worked</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* User Info */}
        <Card title="Account Information" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          {user?.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          )}

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{getRoleLabel()}</Text>
            </View>
          </View>
        </Card>

        {/* Recent Attendance */}
        <Card title="Recent Attendance" style={styles.attendanceCard}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No attendance history</Text>
          ) : (
            history.slice(0, 5).map((attendance, index) => (
              <View
                key={attendance.id}
                style={[
                  styles.attendanceRow,
                  index === Math.min(4, history.length - 1) && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceDate}>{attendance.date}</Text>
                  <Text style={styles.attendanceTime}>
                    {attendance.start_time
                      ? new Date(attendance.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                    {' - '}
                    {attendance.end_time
                      ? new Date(attendance.end_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.attendanceStatus,
                    {
                      backgroundColor:
                        attendance.status === 'completed'
                          ? '#DCFCE7'
                          : attendance.status === 'in_progress'
                          ? '#FEF3C7'
                          : '#FEE2E2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.attendanceStatusText,
                      {
                        color:
                          attendance.status === 'completed'
                            ? '#166534'
                            : attendance.status === 'in_progress'
                            ? '#92400E'
                            : '#991B1B',
                      },
                    ]}
                  >
                    {attendance.status === 'completed'
                      ? 'Done'
                      : attendance.status === 'in_progress'
                      ? 'Active'
                      : 'Missed'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* App Info */}
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
            <Text style={styles.appInfoText}>Ops360 Mobile v1.0.0</Text>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    marginTop: 2,
  },
  attendanceCard: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  attendanceTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  attendanceStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendanceStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appInfoCard: {
    marginBottom: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    marginBottom: 32,
  },
});
