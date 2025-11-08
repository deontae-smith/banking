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
    plugins: ['expo-secure-store'],
  },
};
