'use server';

import { firebaseConfig } from '@/firebase/config';
import { Bom, Container } from '@/lib/data';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  runTransaction,
  query,
  where,
  getDocs,
  collectionGroup,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const firestore = getFirestore(app);

export async function receiveContainer(containerData: Omit<Container, 'id' | 'receiptDate'>) {
    try {
        await runTransaction(firestore, async (transaction) => {
            // 1. Create the new container document
            const containersRef = collection(firestore, 'containers');
            const newContainerRef = doc(containersRef);
            
            const newContainer: Container = {
                ...containerData,
                id: newContainerRef.id,
                receiptDate: new Date().toISOString(),
            };
            transaction.set(newContainerRef, newContainer);

            // 2. If a job is associated, update the BOM on-hand quantities
            if (containerData.jobNumber) {
                const bomsQuery = query(
                    collectionGroup(firestore, 'boms'),
                    where('jobNumber', '==', containerData.jobNumber)
                );
                
                const bomsSnapshot = await getDocs(bomsQuery);

                if (!bomsSnapshot.empty) {
                    // Assuming one job number has one BOM for simplicity, or we act on the first one found.
                    const bomDoc = bomsSnapshot.docs[0];
                    const bomData = bomDoc.data() as Bom;
                    const bomRef = bomDoc.ref;

                    const updatedItems = bomData.items.map(bomItem => {
                        const receivedItem = containerData.items.find(ci => ci.description === bomItem.description);
                        if (receivedItem) {
                            // Increment the on-hand quantity
                            return {
                                ...bomItem,
                                onHandQuantity: (bomItem.onHandQuantity || 0) + receivedItem.quantity,
                                lastUpdated: new Date().toISOString(),
                            };
                        }
                        return bomItem;
                    });
                    
                    transaction.update(bomRef, { items: updatedItems });
                }
                 // If no BOM is found for the job, we just create the container and don't update any BOM.
            }
        });
    } catch (e: any) {
        console.error('Transaction failed: ', e);
        throw new Error('Failed to receive container and update inventory.');
    }

    revalidatePath('/containers');
    revalidatePath('/dashboard');
    revalidatePath('/locations');
    redirect('/containers');
}
