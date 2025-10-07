/**
 * @file This file provides a client-side component to ensure Firebase is initialized only once.
 *
 * In Next.js, components can be rendered multiple times. This provider uses a
 * state variable (`firebaseApp`) to track if Firebase has already been
 * initialized. The actual initialization is done here, and the initialized
 * app instance is passed to the `FirebaseProvider` from `./provider.tsx`.
 *
 * This prevents re-initialization errors and ensures a single, stable
 * Firebase app instance throughout the application's lifecycle on the client.
 */
'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A client-side component that initializes Firebase and provides it to its children.
 * It ensures that Firebase is only initialized once.
 *
 * @param {FirebaseClientProviderProps} props - The props for the component.
 * @returns {JSX.Element | null} The provider with the Firebase context, or null if not yet initialized.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<{
    app: FirebaseApp;
    auth: ReturnType<typeof getAuth>;
    firestore: ReturnType<typeof getFirestore>;
  } | null>(null);

  useEffect(() => {
    if (!services) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setServices({ app, auth, firestore });
    }
  }, [services]);

  if (!services) {
    // Render a loading state or nothing while Firebase is initializing
    return null; 
  }

  return (
    <FirebaseProvider firebaseApp={services.app} auth={services.auth} firestore={services.firestore}>
      {children}
    </FirebaseProvider>
  );
}
