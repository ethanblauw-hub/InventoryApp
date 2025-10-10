
'use server';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const firestore = getFirestore(app);

export async function deleteBom(jobId: string, bomId: string) {
  if (!jobId || !bomId) {
    throw new Error('Job ID and BOM ID are required.');
  }

  try {
    const bomRef = doc(firestore, 'jobs', jobId, 'boms', bomId);
    await deleteDoc(bomRef);
    
    // Revalidate the boms list page to ensure the deleted item is gone
    revalidatePath('/boms');
  } catch (error) {
    console.error('Error deleting BOM:', error);
    // Optionally return an error message to display in the UI
    return { error: 'Failed to delete BOM.' };
  }
  
  // Redirect back to the main BOMs page after successful deletion
  redirect('/boms');
}
