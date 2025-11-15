import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { AccountDataPayload, CardLockingFunction } from '@ob/account-iso';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';

type VisaCardProps = {
  account: AccountDataPayload;
  handleLockingFeature: CardLockingFunction;
};

const Visa = ({ account, handleLockingFeature }: VisaCardProps) => {
  const [cardDetailsVisible, setCardDetailsVisible] = useState(false);
  const [locked, setLocked] = useState(false);

  const { user } = useUser();
  const navigation = useNavigation();

  const openModal = () => {
    setCardDetailsVisible(!cardDetailsVisible);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (cardDetailsVisible) {
      timer = setTimeout(() => {
        setCardDetailsVisible(false);
      }, 10000);
    }

    return () => clearTimeout(timer);
  }, [cardDetailsVisible]);

  return (
    <View>
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

        {cardDetailsVisible && (
          <>
            <Text style={styles.cardNumber}>
              {account.card?.number.replace(/(\d{4})(?=\d)/g, '$1 ')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: -10 }}>
              <Text style={styles.cardInfo}>CVV: {account.card?.cvv}</Text>
              <Text style={styles.cardInfo}>
                EXP: {account.card?.expiration.month}/
                {account.card?.expiration.year.slice(-2)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.balanceRow}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.label}>Available Balance</Text>
            <Text style={styles.balanceAmount}>${account?.card?.balance}</Text>
          </View>

          <TouchableOpacity onPress={openModal}>
            <Ionicons
              name={cardDetailsVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color='white'
            />
          </TouchableOpacity>
        </View>
        {locked && (
          <View style={styles.lockOverlay}>
            <Ionicons name='lock-closed' size={50} color='white' />
          </View>
        )}
      </LinearGradient>
      {/* Send/Receive Buttons */}
      <View style={styles.transferContainer}>
        <TouchableOpacity
          style={[
            styles.receiveBtn,
            { backgroundColor: locked ? '#1D4ED8' : '#d2d2d25f' },
          ]}
          onPress={() => handleLockingFeature(account.card?._id, locked)}
        >
          {locked && <Ionicons name='lock-closed' size={18} color='#fff' />}
          <Text
            style={[styles.receiveText, { color: locked ? '#fff' : '#000' }]}
          >
            {locked ? 'Unlock' : 'Lock'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendBtn}
          //   @ts-ignore
          onPress={() => navigation.navigate('Sendscreen')}
        >
          {/* <Ionicons name="arrow-down" size={20} color="#fff" /> */}
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Visa;

const styles = StyleSheet.create({
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
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', // semi-transparent tint
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
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
});
