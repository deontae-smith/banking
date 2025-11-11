import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export function Homescreen({ navigation }: any) {
  const { signOut } = useAuth();

  const transactions = [
    { id: '1', name: 'Uber', amount: 34.0, time: 'Today • 08:48 PM' },
    { id: '2', name: 'Airbnb', amount: 128.0, time: 'Yesterday • 10:12 AM' },
  ];

  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace('LoginScreen'); // replace to avoid going back
    } catch (err) {
      console.log('Error signing out:', err);
    }
  };

  const openModal = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    let timer;

    // If details are visible, start 30-second timer
    if (visible) {
      timer = setTimeout(() => {
        setVisible(false);
      }, 10000); // 30 seconds
    }

    // Cleanup when component unmounts or when user toggles early
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>;
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.userName}>{user?.firstName}</Text>
      </TouchableOpacity>
      {/* Visa Card */}
      <LinearGradient
        colors={['#1E293B', '#1E40AF', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{user?.fullName}</Text>
          <Text style={styles.cardBrand}>VISA</Text>
        </View>

        {visible && (
          <>
            <Text style={styles.cardNumber}>8729 9128 7643 0274</Text>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: -10 }}>
              <Text style={styles.cardInfo}>CVV: 671</Text>
              <Text style={styles.cardInfo}>EXP: 12/27</Text>
            </View>
          </>
        )}

        <View style={styles.balanceRow}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.label}>Available Balance</Text>
            <Text style={styles.balanceAmount}>$12,890.81</Text>
          </View>

          <TouchableOpacity onPress={openModal}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color='white'
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* Send/Receive Buttons */}
      <View style={styles.transferContainer}>
        <TouchableOpacity style={styles.receiveBtn}>
          {/* <Ionicons name="arrow-up" size={20} color="#000" /> */}
          <Text style={styles.receiveText}>Lock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => navigation.navigate('Sendscreen')}
        >
          {/* <Ionicons name="arrow-down" size={20} color="#fff" /> */}
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
      {/* Expense Cards */}
      <View style={styles.expenseRow}>
        <View style={styles.expenseCard}>
          <Ionicons name='wallet-outline' size={22} color='#000' />
          <Text style={styles.expenseTitle}>Total Expenses</Text>
          <Text style={styles.expenseAmount}>$36,172.19</Text>
          {/* <Text style={styles.expenseSub}>Total Expense of all time</Text> */}
        </View>

        <View style={styles.expenseCard}>
          <Ionicons name='calendar-outline' size={22} color='#000' />
          <Text style={styles.expenseTitle}>Monthly Subscriptions</Text>
          <Text style={styles.expenseAmount}>$972.74</Text>
          {/* <Text style={styles.expenseSub}>Total Expense this month</Text> */}
        </View>
      </View>
      {/* Transactions */}
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Transaction History</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
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
        )}
      />
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cardBrand: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    color: 'white',
    fontWeight: '700',
    fontSize: 22,
  },
  cardInfo: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  balanceAmount: {
    color: 'white',
    fontWeight: '700',
    fontSize: 32,
  },
  transferContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  receiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d2d2d25f',
    height: 55,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    height: 55,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
  },
  receiveText: {
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    fontSize: 16,
  },
  sendText: {
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
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
});
