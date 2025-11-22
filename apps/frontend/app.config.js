import 'dotenv/config';

export default {
  expo: {
    name: 'online_banking',
    slug: 'online_banking',
    scheme: 'onlinebanking',
    version: '1.0.0',
    extra: {
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    ios: {
      // You can also add other iOS-specific config here
    },
    plugins: [
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.',
        },
      ],
      [
        'expo-secure-store',
        {
          configureAndroidBackup: true,
          faceIDPermission:
            'Allow SRFinical to access your Face ID biometric data.',
        },
      ],
    ],
  },
};
