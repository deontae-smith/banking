import { useEffect, useState, useRef } from 'react';
import EventSource from 'react-native-sse';
import { getBackendUrl } from '@/libs/getAPIUrl';

export interface UserContact {
  clerk_id: string;
  firstName: string;
  phoneNumber: string;
}

interface UseUserContactsResult {
  contacts: UserContact[] | null;
  loading: boolean;
  error: string | null;
}

const RECONNECT_INTERVAL_MS = 5000;

export function useUserContacts(clerkId?: string): UseUserContactsResult {
  const [contacts, setContacts] = useState<UserContact[] | null>(null);
  const [loading, setLoading] = useState<boolean>(!!clerkId);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = getBackendUrl();
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch the fully resolved contacts from backend
  const fetchResolvedContacts = async () => {
    if (!clerkId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${backendUrl}/api/account/get-contacts/${clerkId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setContacts(data.contacts || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError('Failed to fetch contacts');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clerkId) return;

    // Initial fetch
    fetchResolvedContacts();

    // Set up SSE
    const connect = () => {
      const es = new EventSource(
        `${backendUrl}/api/account/stream-contacts/${clerkId}`
      );
      eventSourceRef.current = es;

      es.addEventListener('message', async () => {
        // On SSE message, re-fetch the resolved contacts
        await fetchResolvedContacts();
      });

      es.addEventListener('error', (err) => {
        console.warn('SSE connection lost, retrying...', err);
        es.close();
        setTimeout(connect, RECONNECT_INTERVAL_MS);
      });
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [clerkId]);

  return { contacts, loading, error };
}
