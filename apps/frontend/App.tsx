import { ClerkProvider, useUser } from '@clerk/clerk-expo';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { Homescreen, Login } from './screens';
// import { ScreenProvider, useScreenState } from '@ob/screens';

const Stack = createNativeStackNavigator();

function NavigationController() {
  const navigation = useNavigation();
  const { user } = useUser();
  // const { current: screen } = useScreenState();
  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    }
  }, [user]);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name='Homescreen' component={Homescreen} />
        <Stack.Screen name='Login' component={Login} />
      </Stack.Navigator>
      {/* Pass in User Id to navbar to handle customer actions */}
    </>
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
    <ClerkProvider>
      {/* <ScreenProvider> */}
      <NavigationContainer>
        <NavigationController />
      </NavigationContainer>
      {/* </ScreenProvider> */}
    </ClerkProvider>
  );
}
