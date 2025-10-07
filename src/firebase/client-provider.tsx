'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

/**
 * Props for the FirebaseClientProvider component.
 * @property {ReactNode} children - The child components that need access to the Firebase context.
 */
interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A client-side provider that ensures Firebase is initialized only once.
 * It wraps the main `FirebaseProvider` and uses `useMemo` to guarantee that
 * the `initializeFirebase` function is called only on the initial client-side render.
 *
 * @param {FirebaseClientProviderProps} props - The props for the component.
 * @returns {JSX.Element} The `FirebaseProvider` with the initialized Firebase services.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
