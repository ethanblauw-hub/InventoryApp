
/**
 * @file This file serves as the main entry point for Firebase services.
 *
 * It initializes Firebase and exports the necessary service instances and hooks
 * for use throughout the application. This centralized approach simplifies management
 * and ensures a single Firebase instance is used.
 */

'use client';

import { FirebaseProvider, useUser, useAuth, useFirestore, useFirebaseApp, useMemoFirebase } from './provider';
import { firebaseConfig } from './config';
import { FirebaseClientProvider } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';


export {
  FirebaseProvider,
  FirebaseClientProvider,
  firebaseConfig,
  useUser,
  useAuth,
  useFirestore,
  useFirebaseApp,
  useMemoFirebase,
  useCollection,
  useDoc
};
