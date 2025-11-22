import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { getGreeting } from '@/utils';
import Visa from '@/components/card/visa';
import { useUserAccount } from '@/hooks/useAccountData';
import { GreetingHeader } from '@/components/headers/TopBar';
export function Homescreen({ navigation }: any) {
  const { user } = useUser();
  const {
    account,
    loading,
    handleLockingFeature: lockController,
    isCardLocked,
    transactions,
  } = useUserAccount(user?.id);

  if (!user || !account || loading) return;

  return (
    <View style={styles.container}>
      <GreetingHeader />
      {/* <Text style={styles.greeting}>{getGreeting()}</Text>;
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.userName}>{user?.firstName}</Text>
      </TouchableOpacity> */}
      {/* Visa Card */}
      <Visa
        account={account}
        handleLockingFeature={lockController}
        isCardLocked={isCardLocked}
      />
      {/* Expense Cards */}
      <View style={styles.expenseRow}>
        <TouchableOpacity
          style={styles.expenseCard}
          onPress={() => navigation.navigate('PortfolioScreen')}
        >
          <Ionicons name='wallet-outline' size={22} color='#000' />
          <Text style={styles.expenseTitle}>Profolio Balance</Text>
          <Text style={styles.expenseAmount}>$12,044.21</Text>
          {/* <Text style={styles.expenseSub}>Total Expense of all time</Text> */}
        </TouchableOpacity>

        <View style={styles.expenseCard}>
          <Ionicons name='journal-outline' size={22} color='#000' />
          <Text style={styles.expenseTitle}>Spending Limit</Text>
          {/* <Text style={styles.expenseAmount}>12k/100k</Text> */}
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
        {transactions.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Pending</Text>
            {transactions.map((item) => (
              <View style={styles.transactionRow}>
                <View style={styles.leftSection}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconLetter}>{item.title[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.transactionName}>{item.title}</Text>
                    <Text style={styles.transactionTime}>
                      {item.type.toLocaleUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        item.type === 'WITHDRAWAL'
                          ? '#dc2626' // soft red
                          : '#16a34a', // soft green
                    },
                  ]}
                >
                  {item.type === 'WITHDRAWAL' ? '-' : '+'}$
                  {item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
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
    fontWeight: '500',
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
