import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { expensesAPI, dashboardAPI } from '../../services/api';
import type { Expense } from '../../types';

export default function ExpensesScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: expensesAPI.getCategories,
  });

  // Fetch today's expenses
  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['todayExpenses'],
    queryFn: expensesAPI.getToday,
  });

  // Fetch today's total
  const { data: totalData } = useQuery({
    queryKey: ['todayExpenseTotal'],
    queryFn: expensesAPI.getTodayTotal,
  });

  // Fetch dashboard stats for day status
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getMobileStats,
  });

  const createMutation = useMutation({
    mutationFn: expensesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['todayExpenseTotal'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const pickImage = async () => {
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
        setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        category,
        amount: parseFloat(amount),
        description: description || undefined,
        receipt_image: receiptImage || undefined,
      });

      setModalVisible(false);
      setCategory('');
      setAmount('');
      setDescription('');
      setReceiptImage(null);
      Alert.alert('Success', 'Expense added successfully!');
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to add expense'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = stats?.day_status === 'in_progress';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#22C55E';
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <Card style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.categoryContainer}>
          <Ionicons name="pricetag" size={16} color="#4F46E5" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.amountText}>
        {new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(item.amount)}
      </Text>

      {item.description && (
        <Text style={styles.descriptionText}>{item.description}</Text>
      )}

      {item.receipt_image && (
        <Image
          source={{ uri: item.receipt_image }}
          style={styles.receiptImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.timeText}>
        {format(new Date(item.created_at), 'h:mm a')}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'EEEE, MMM d')}</Text>
      </View>

      {/* Total Card */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Today's Total</Text>
        <Text style={styles.totalAmount}>
          {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(totalData?.total || 0)}
        </Text>
        <Text style={styles.countText}>
          {totalData?.count || 0} expense{(totalData?.count || 0) !== 1 ? 's' : ''}
        </Text>
      </Card>

      {!canSubmit && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            {stats?.day_status === 'completed'
              ? 'Day has ended. Cannot add expenses.'
              : 'Start your day to add expenses.'}
          </Text>
        </View>
      )}

      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No expenses yet today</Text>
            <Text style={styles.emptySubtext}>
              Add your expenses to track spending
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, !canSubmit && styles.fabDisabled]}
        onPress={() => setModalVisible(true)}
        disabled={!canSubmit}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
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
            <Text style={styles.modalTitle}>Add Expense</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Amount (INR) *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a note about this expense..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Receipt Photo (Optional)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              {receiptImage ? (
                <Image
                  source={{ uri: receiptImage }}
                  style={styles.receiptPreview}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.photoButtonText}>Capture Receipt</Text>
                </>
              )}
            </TouchableOpacity>

            <Button
              title="Add Expense"
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
  totalCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  countText: {
    fontSize: 14,
    color: '#9CA3AF',
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
  expenseCard: {
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  receiptImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeText: {
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
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4F46E5',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    paddingLeft: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    paddingLeft: 8,
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
    color: '#111827',
  },
  photoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  receiptPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  submitButton: {
    marginBottom: 40,
  },
});
