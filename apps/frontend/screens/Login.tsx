import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { InputField } from '@/components';

export function LoginScreen({ navigation }: any) {
  const { signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Shake animation
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');

    try {
      if (isSignedIn) {
        navigation.navigate('Homescreen');
        return;
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigation.navigate('Homescreen');
      } else {
        // Example: requires email verification or 2FA
        setError('Check your email for verification steps.');
        triggerShake();
        console.log('Sign-in incomplete', result);
      }
    } catch (err: any) {
      console.error('Login failed', err);
      setError('Invalid email or password');
      triggerShake();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[{ transform: [{ translateX: shakeAnim }] }]}>
        <InputField
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          icon='mail-outline'
          style={[styles.input, error ? styles.inputError : null]}
        />
        <InputField
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          icon='lock-closed-outline'
          secure
          style={[styles.input, error ? styles.inputError : null]}
        />
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.footerText}>
          Don’t have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  input: {
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
  },
  error: { color: 'red', textAlign: 'center', marginBottom: 8 },
  button: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#3b82f6', textAlign: 'center', marginTop: 12 },
  footerText: { textAlign: 'center', marginTop: 8, color: '#6b7280' },
});
