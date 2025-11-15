import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { getGreeting } from '@/utils';
import Visa from '@/components/card/visa';
import { useUserAccount } from '@/hooks/useAccountData';

export function Homescreen({ navigation }: any) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const {
    account,
    loading,
    handleLockingFeature: lockController,
  } = useUserAccount(user?.id);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace('LoginScreen');
    } catch (err) {
      throw new Error('Error signing out, please try again');
    }
  };

  if (!user || !account || loading) return;

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>;
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.userName}>{user?.firstName}</Text>
      </TouchableOpacity>
      {/* Visa Card */}
      <Visa account={account} handleLockingFeature={lockController} />
      {/* Expense Cards */}
      <View style={styles.expenseRow}>
        <View style={styles.expenseCard}>
          <Ionicons name='wallet-outline' size={22} color='#000' />
          <Text style={styles.expenseTitle}>Total Expenses</Text>
          <Text style={styles.expenseAmount}>--</Text>
          {/* <Text style={styles.expenseSub}>Total Expense of all time</Text> */}
        </View>

        <View style={styles.expenseCard}>
          <Ionicons name='calendar-outline' size={22} color='#000' />
          <Text style={styles.expenseTitle}>Monthly Subscriptions</Text>
          <Text style={styles.expenseAmount}>--</Text>
          {/* <Text style={styles.expenseSub}>Total Expense this month</Text> */}
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        {/* Only show Pending section if there are any pending transactions */}
        {/* {pendingTransactions.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Pending</Text>
            {pendingTransactions.map((item) => (
              <View key={item.id} style={styles.transactionRow}>
                <View style={styles.leftSection}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconLetter}>{item.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.transactionName}>{item.name}</Text>
                    <Text style={styles.transactionTime}>{item.time}</Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </>
        )} */}

        {/* Only show Completed section if there are any completed transactions */}
        {/* {completedTransactions.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Completed</Text>
            {completedTransactions.map((item) => (
              <View key={item.id} style={styles.transactionRow}>
                <View style={styles.leftSection}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconLetter}>{item.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.transactionName}>{item.name}</Text>
                    <Text style={styles.transactionTime}>{item.time}</Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </>
        )} */}
      </View>
      {/* Card Info Modal */}
      {/* <Modal transparent visible={visible} animationType="none">
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContainer,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
          >
            <Text style={styles.modalTitle}>Card Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Card Number</Text>
              <Text style={styles.infoValue}>8729 9128 7643 0274</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expiry Date</Text>
              <Text style={styles.infoValue}>12/27</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CVV</Text>
              <Text style={styles.infoValue}>***</Text>
            </View>
          </Animated.View>
        </Pressable>
      </Modal> */}
      <View style={styles.fdicContainer}>
        <Text style={styles.fdicText}>Member FDIC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: '#f8fafc',
  },
  greeting: {
    fontSize: 16,
    color: '#475569',
  },
  userName: {
    fontWeight: '700',
    fontSize: 20,
    marginTop: 2,
  },
  balanceCard: {
    marginTop: 30,
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  transactionHeader: {
    color: 'grey',
    fontSize: 12,
    marginTop: 50,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  expenseSub: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#000',
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconLetter: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  infoValue: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },
  // FDIC footer
  fdicContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  fdicText: {
    color: '#9ca3af',
    fontWeight: '400',
    fontSize: 8,
    letterSpacing: 0.5,
    // fontFamily: 'System',
  },
});
