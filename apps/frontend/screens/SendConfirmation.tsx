import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSendMoney } from '@/hooks/useSendMoneyProcess';
import { useUser } from '@clerk/clerk-expo';
import { ReturnedUserContact } from '@ob/account-iso';

export function SendConfirmation({ route, navigation }: any) {
  const {
    receiver,
    amount,
  }: { receiver: ReturnedUserContact; amount: number } = route.params;
  // used as a buffer to allow users to cancel the transaction
  const [hasBufferTime, setHasBufferTime] = useState(true);
  const [transactionComplete, setTransactionComplete] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const { sendMoney } = useSendMoney();
  const { user } = useUser();

  if (!user) return;

  const clerkUserId = user.id;

  useEffect(() => {
    // Animate the bar from 0 to 1 over 5 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      setHasBufferTime(false);
    });
  }, []);

  useEffect(() => {
    if (!hasBufferTime) {
      // Call the sendMoney function here
      const runTransaction = async () => {
        try {
          await sendMoney({
            senderclerkId: clerkUserId,
            recipient: {
              id: receiver.clerk_id,
              phoneNumber: receiver.phoneNumber,
            },
            amount,
          });

          setTransactionComplete(true);
        } catch (err) {
          console.error('Transaction failed', err);
          // Optionally show an error to the user
        }
      };
      runTransaction();
    }
  }, [hasBufferTime]);

  // Interpolate width for the progress bar
  const widthAnim = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {hasBufferTime || !transactionComplete ? (
        <>
          <View
            style={{
              marginTop: 200,
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 45 }}>
              Sending ${amount} to {receiver.firstName}
            </Text>

            {/* Progress bar */}

            {hasBufferTime && (
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[styles.progressBar, { width: widthAnim }]}
                />
              </View>
            )}

            {hasBufferTime && (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#6b7280',
                    textDecorationLine: 'underline',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}

            {!hasBufferTime && (
              <ActivityIndicator
                size='small' // you can use "large" if you want it bigger
                color='#6b7280' // matches your text color
              />
            )}
          </View>
        </>
      ) : (
        <View style={{ marginTop: 180, alignItems: 'center', gap: 40 }}>
          {/* Checkmark circle */}
          <View style={styles.checkContainer}>
            <Ionicons name='checkmark' size={35} color='white' />
          </View>

          <Text style={{ fontSize: 28, textAlign: 'center', color: '#111827' }}>
            ${amount} sent to {receiver.firstName}!
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Homescreen')}
          >
            <Text style={styles.homeButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      )}
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
  progressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    marginTop: 60,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
  },
  checkContainer: {
    width: 50,
    height: 50,
    borderRadius: 60,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '600',
  },
});
