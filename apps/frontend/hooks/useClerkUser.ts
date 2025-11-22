// useClerkUser.ts
import { useUser } from '@clerk/clerk-expo';

export function useClerkUser() {
  const { user, isLoaded } = useUser();

  return {
    user: isLoaded ? user : null,
    isLoading: !isLoaded,
  };
}
