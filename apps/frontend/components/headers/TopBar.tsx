import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { getGreeting } from '@/utils';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useAuth } from '@clerk/clerk-expo';

export function GreetingHeader({ navigation }: any) {
  const { user, isLoading } = useClerkUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace('LoginScreen');
    } catch (err) {
      throw new Error('Error signing out, please try again');
    }
  };
  return (
    <>
      <Text style={styles.greeting}>{getGreeting()}</Text>

      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.userName}>{user?.fullName}</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
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
});
