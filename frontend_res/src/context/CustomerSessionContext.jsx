import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getCustomerSession } from '../api/customerSession';

const CustomerSessionContext = createContext(null);

function getStoredSession() {
  try {
    const stored = localStorage.getItem('customer_session');

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(
      'Invalid customer session in localStorage:',
      error
    );

    localStorage.removeItem('customer_session');

    return null;
  }
}

export function CustomerSessionProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);
  const [checkingSession, setCheckingSession] = useState(true);

  /*
   * IMPORTANT:
   * Validate the session stored in localStorage
   * against the backend/database.
   */
  useEffect(() => {
    const validateStoredSession = async () => {
      const storedSession = getStoredSession();

      // Nothing stored in browser.
      if (!storedSession?.id) {
        setSession(null);
        setCheckingSession(false);
        return;
      }

      try {
        const response = await getCustomerSession(
          storedSession.id
        );

        const serverSession = response.data;

        /*
         * Database says session is ACTIVE.
         * Keep it.
         */
        if (serverSession?.status === 'ACTIVE') {
          setSession(serverSession);

          localStorage.setItem(
            'customer_session',
            JSON.stringify(serverSession)
          );
        } else {
          /*
           * Database says COMPLETED.
           * Remove stale browser session.
           */
          setSession(null);
          localStorage.removeItem('customer_session');
        }
      } catch (error) {
        /*
         * Session doesn't exist anymore,
         * or backend rejected it.
         */
        console.error(
          'Unable to validate customer session:',
          error
        );

        setSession(null);
        localStorage.removeItem('customer_session');
      } finally {
        setCheckingSession(false);
      }
    };

    validateStoredSession();
  }, []);

  /*
   * Save only ACTIVE sessions.
   */
  const saveSession = (nextSession) => {
    if (nextSession?.status === 'ACTIVE') {
      setSession(nextSession);

      localStorage.setItem(
        'customer_session',
        JSON.stringify(nextSession)
      );

      return;
    }

    setSession(null);
    localStorage.removeItem('customer_session');
  };

  /*
   * Clear the customer's session.
   */
  const clearSession = () => {
    setSession(null);
    localStorage.removeItem('customer_session');
  };

  const value = useMemo(
    () => ({
      session,
      saveSession,
      clearSession,
      checkingSession,
    }),
    [session, checkingSession]
  );

  return (
    <CustomerSessionContext.Provider value={value}>
      {children}
    </CustomerSessionContext.Provider>
  );
}

export function useCustomerSession() {
  const context = useContext(CustomerSessionContext);

  if (!context) {
    throw new Error(
      'useCustomerSession must be used inside CustomerSessionProvider'
    );
  }

  return context;
}