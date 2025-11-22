import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { AccountDataPayload, CardLockingFunction } from '@ob/account-iso';

type VisaCardProps = {
  account: AccountDataPayload;
  handleLockingFeature: CardLockingFunction;
  isCardLocked: boolean | null;
};

const Visa = ({
  account,
  handleLockingFeature,
  isCardLocked,
}: VisaCardProps) => {
  const [cardDetailsVisible, setCardDetailsVisible] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation();

  const animatedValue = useRef(new Animated.Value(0)).current;

  const toggleDetails = () => setCardDetailsVisible((v) => !v);

  // Auto-hide card details after 10s
  useEffect(() => {
    if (isCardLocked) {
      setCardDetailsVisible(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    if (cardDetailsVisible) {
      timer = setTimeout(() => setCardDetailsVisible(false), 10000);
    }

    return () => clearTimeout(timer);
  }, [cardDetailsVisible, isCardLocked]);

  // Animate card details
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: cardDetailsVisible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [cardDetailsVisible]);

  const detailsStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  const rightNumberStyle = {
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <View>
      <LinearGradient
        colors={['#1E293B', '#1E40AF', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.brand}>VISA</Text>
          <Animated.Text style={[styles.lastFour, rightNumberStyle]}>
            •••• {account.card?.number.slice(-4)}
          </Animated.Text>
        </View>

        {/* Card details */}
        <Animated.View style={detailsStyle}>
          {cardDetailsVisible && (
            <View>
              <Text style={styles.fullNumber}>
                {account.card?.number.replace(/(\d{4})(?=\d)/g, '$1 ')}
              </Text>
              <View style={styles.detailsRow}>
                <Text style={styles.cardInfo}>CVV: {account.card?.cvv}</Text>
                <Text style={styles.cardInfo}>
                  EXP: {account.card?.expiration.month}/
                  {account.card?.expiration.year.slice(-2)}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Balance */}
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>${account.card?.balance}</Text>
          </View>

          {!isCardLocked && (
            <TouchableOpacity onPress={toggleDetails}>
              <Ionicons
                name={cardDetailsVisible ? 'eye-off-outline' : 'eye-outline'}
                size={26}
                color='white'
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Lock overlay */}
        {isCardLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name='lock-closed' size={50} color='white' />
          </View>
        )}
      </LinearGradient>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.lockBtn,
            isCardLocked && { backgroundColor: '#1D4ED8' },
          ]}
          onPress={() => handleLockingFeature(account.card?._id, isCardLocked!)}
        >
          <Ionicons
            name={isCardLocked ? 'lock-open' : 'lock-closed'}
            size={18}
            color='#fff'
          />
          <Text style={styles.lockText}>
            {isCardLocked ? 'Unlock' : 'Lock'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendBtn, isCardLocked && { opacity: 0.35 }]}
          disabled={isCardLocked!}
          //@ts-ignore
          onPress={() => navigation.navigate('Sendscreen')}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Visa;

const styles = StyleSheet.create({
  card: {
    marginTop: 30,
    height: 200,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { color: 'white', fontSize: 22, fontWeight: '700' },
  lastFour: { color: 'white', fontSize: 14, fontWeight: '600' },
  fullNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  detailsRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  cardInfo: { color: 'white', fontWeight: '600', fontSize: 14 },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { color: '#cbd5e1', fontSize: 13 },
  balanceAmount: { color: 'white', fontSize: 28, fontWeight: '700' },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  lockBtn: {
    flex: 1,
    backgroundColor: '#475569',
    height: 50,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    gap: 6,
  },
  lockText: { color: 'white', fontWeight: '600', fontSize: 16 },
  sendBtn: {
    flex: 1,
    backgroundColor: 'black',
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
