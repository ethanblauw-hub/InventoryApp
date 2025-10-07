
/**
 * @file This file serves as the main entry point for Firebase services.
 *
 * It initializes Firebase and exports the necessary service instances and hooks
 * for use throughout the application. This centralized approach simplifies management
 * and ensures a single Firebase instance is used.
 */

'use client';

import { FirebaseProvider, useUser, useAuth, useFirestore, useFirebaseApp } from './provider';
import { firebaseConfig } from './config';
import { FirebaseClientProvider } from './client-provider';


export {
  FirebaseProvider,
  FirebaseClientProvider,
  firebaseConfig,
  useUser,
  useAuth,
  useFirestore,
  useFirebaseApp
};
