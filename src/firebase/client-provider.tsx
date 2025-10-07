
'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseClientProviderProps = {
  children: React.ReactNode;
};

/**
 * A client-side component responsible for initializing Firebase services
 * and providing them to the rest of the application. This ensures that
 * Firebase is initialized only once.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    // Initialize Firebase only on the client side and only once.
    if (!firebaseServices) {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setFirebaseServices({ app, auth, firestore });
    }
  }, [firebaseServices]);

  if (!firebaseServices) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.app}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
