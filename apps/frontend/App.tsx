import { ClerkProvider, useUser } from '@clerk/clerk-expo';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { ActivityIndicator, Text, View } from 'react-native';
import {
  Homescreen,
  LoginScreen,
  SendScreen,
  SendConfirmation,
  ContactList,
  PortfolioOverviewScreen,
} from './screens';
import { tokenCache } from './tokenCache';
import * as LocalAuthentication from 'expo-local-authentication';

// import { ScreenProvider, useScreenState } from '@ob/screens';

const Stack = createNativeStackNavigator();

export function NavigationController() {
  const { isLoaded, user } = useUser();
  const [initialRoute, setInitialRoute] = useState<Screen | null>(null);

  // // Wait until Clerk finishes loading before deciding which screen to show
  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      setInitialRoute('Homescreen');
    } else {
      setInitialRoute('LoginScreen');
    }
  }, [isLoaded, user]);

  // Show a loader while Clerk is restoring the session
  if (!initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size='large' color='#000' />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name='LoginScreen' component={LoginScreen} />
      <Stack.Screen name='Homescreen' component={Homescreen} />
      <Stack.Screen name='Sendscreen' component={SendScreen} />
      <Stack.Screen name='SendConfirmation' component={SendConfirmation} />
      <Stack.Screen name='ContactList' component={ContactList} />
      <Stack.Screen
        name='PortfolioScreen'
        component={PortfolioOverviewScreen}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const publishableKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error(
      'Missing Clerk publishable key! Check your .env or app.config.js'
    );
    return <Text>Configuration error</Text>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {/* <ScreenProvider> */}
      <NavigationContainer>
        <NavigationController />
      </NavigationContainer>
      {/* </ScreenProvider> */}
    </ClerkProvider>
  );
}
