/**
 * @file This file serves as the central entry point for Firebase-related functionality.
 *
 * It provides a standardized way to initialize Firebase services and exports key modules
 * and hooks for use throughout the application. This ensures a consistent and singleton
 * pattern for Firebase service instances.
 *
 * Exports:
 * - `initializeFirebase`: A function to initialize the Firebase app and associated services (Auth, Firestore).
 * - `getSdks`: A helper function to get initialized SDKs from a FirebaseApp instance.
 * - All exports from `./provider`: Context providers and hooks for accessing Firebase services.
 * - All exports from `./client-provider`: A client-side provider to ensure Firebase initializes only in the browser.
 * - `useCollection` and `useDoc` hooks for real-time Firestore data.
 * - All non-blocking update functions for Firestore.
 * - All non-blocking login functions for Firebase Auth.
 * - Custom error types and the global error emitter.
 */
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

/**
 * Initializes the Firebase application, ensuring it's only done once.
 *
 * This function handles both server-side and client-side execution contexts.
 * In a Firebase App Hosting environment, it attempts to initialize automatically
 * from environment variables. Otherwise, it falls back to the provided firebaseConfig object.
 * This is the primary function to call to get access to Firebase services.
 * IMPORTANT: DO NOT MODIFY THIS FUNCTION.
 *
 * @returns {{firebaseApp: FirebaseApp, auth: Auth, firestore: Firestore}} An object containing the initialized Firebase App, Auth, and Firestore service instances.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

/**
 * Retrieves the initialized Firebase SDK instances from a FirebaseApp object.
 *
 * @param {FirebaseApp} firebaseApp - The initialized Firebase App instance.
 * @returns {{firebaseApp: FirebaseApp, auth: Auth, firestore: Firestore}} An object containing the initialized services.
 */
export function getSdks(firebaseApp: FirebaseApp): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
