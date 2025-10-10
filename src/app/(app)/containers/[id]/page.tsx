
'use client';

import { use, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileText, PlusCircle, Ship, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, getDocs, runTransaction, DocumentData, collectionGroup, deleteDoc } from 'firebase/firestore';
import { Container, Category, Bom, Location as ShelfLocation } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { MoveContainerDialog } from '@/components/move-container-dialog';


/**
 * A page component that displays the detailed information for a single container.
 * It shows the container's metadata, its contents, its location in the shop,
 * and provides actions for managing the container.
 *
 * @returns {JSX.Element} The rendered container details page.
 */
export default function ContainerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const firestore = useFirestore();
  const [isShipping, setIsShipping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const containerRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'containers', id) : null),
    [firestore, id]
  );
  const { data: container, isLoading: isContainerLoading, error } = useDoc<Container>(containerRef);
  
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Category>(categoriesQuery);

  const locationsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shelfLocations') : null),
    [firestore]
  );
  const { data: shelfLocations, isLoading: areLocationsLoading } = useCollection<ShelfLocation>(locationsQuery);

  useEffect(() => {
    if (!isContainerLoading && !container && !isDeleting) {
      notFound();
    }
  }, [isContainerLoading, container, isDeleting]);
  
  const handleShipContainer = async () => {
    if (!firestore || !container?.jobNumber) {
      toast({
        variant: "destructive",
        title: "Cannot Ship Container",
        description: "Job number is missing, so the corresponding BOM cannot be found.",
      });
      return;
    }

    setIsShipping(true);

    try {
      await runTransaction(firestore, async (transaction) => {
        // 1. Find the BOM for the job.
        const bomsQuery = query(
          collectionGroup(firestore, 'boms'),
          where('jobNumber', '==', container.jobNumber)
        );
        
        // This read must happen before any writes.
        const bomsSnapshot = await getDocs(bomsQuery);

        if (bomsSnapshot.empty) {
          throw new Error(`No BOM found for job number: ${container.jobNumber}`);
        }

        const bomDoc = bomsSnapshot.docs[0];
        const bomData = bomDoc.data() as Bom;
        const bomRef = bomDoc.ref;
        
        // Prepare a map of quantities to ship from the container.
        const shippingQuantities = new Map<string, number>();
        for (const item of container.items) {
            shippingQuantities.set(item.description, (shippingQuantities.get(item.description) || 0) + item.quantity);
        }

        // 2. Prepare the updated items list for the BOM.
        const updatedBomItems = bomData.items.map(bomItem => {
          if (shippingQuantities.has(bomItem.description)) {
            const quantityToShip = shippingQuantities.get(bomItem.description)!;
            const newOnHand = (bomItem.onHandQuantity || 0) - quantityToShip;
            const newShipped = (bomItem.shippedQuantity || 0) + quantityToShip;

            return {
              ...bomItem,
              onHandQuantity: newOnHand < 0 ? 0 : newOnHand, // Prevent negative on-hand
              shippedQuantity: newShipped,
              lastUpdated: new Date().toISOString(),
            };
          }
          return bomItem;
        });

        // 3. Perform the write.
        transaction.update(bomRef, { items: updatedBomItems });
      });

      toast({
        title: "Container Marked for Shipping",
        description: "The BOM has been updated with new on-hand and shipped quantities.",
      });
      router.push('/boms');

    } catch (error: any) {
      console.error("Failed to ship container:", error);
      toast({
        variant: "destructive",
        title: "Shipping Failed",
        description: error.message || "An unexpected error occurred while updating the BOM.",
      });
    } finally {
      setIsShipping(false);
    }
  };

  const handleDelete = async () => {
    if (!containerRef) return;
    setIsDeleting(true);
    try {
      await deleteDoc(containerRef);
      toast({
        title: "Container Deleted",
        description: "The container has been permanently removed.",
      });
      router.push('/containers');
    } catch (error: any) {
      console.error("Error deleting container:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the container.",
      });
      setIsDeleting(false);
    }
  };


  if (isContainerLoading || areCategoriesLoading || areLocationsLoading || isDeleting) {
    return <div>Loading container details...</div>;
  }
  
  if (error) {
     return <div>Error loading container. It may have been deleted or you may not have access.</div>
  }

  if (!container) {
    return null; // or a not found component
  }

  const workCategory = categories?.find(cat => cat.id === container.workCategoryId);
  const sortedLocations = shelfLocations?.sort((a, b) => a.name.localeCompare(b.name)) || [];
  const isAdmin = true;


  return (
    <div className="space-y-6">
      <PageHeader
        title={`Container #${container.id.substring(0,7)}...`}
        description={container.jobName || "No Description"}
      >
        <div className="flex flex-wrap gap-2">
            {container.jobNumber && (
              <Button variant="outline" asChild>
                <Link href={`/boms?search=${container.jobNumber}`}>
                  <FileText className="mr-2 h-4 w-4" /> Open Related BOMs
                </Link>
              </Button>
            )}
            {container.jobNumber && (
               <Button asChild>
                <Link href={`/receive?job=${container.jobNumber}`}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item to Job
                </Link>
              </Button>
            )}
            <Button variant="secondary" onClick={handleShipContainer} disabled={isShipping}>
              <Ship className="mr-2 h-4 w-4" /> 
              {isShipping ? 'Shipping...' : 'Ship Container'}
            </Button>
            <Button variant="ghost"><History className="mr-2 h-4 w-4" /> View Change Log</Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Container
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this
                      container.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Container Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Job Number</p>
                            <p>{container.jobNumber || 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-muted-foreground">Original Receipt Date</p>
                            <p>{new Date(container.receiptDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Work Category</p>
                            <p>{workCategory ? <Badge variant="secondary">{workCategory.name}</Badge> : 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-muted-foreground">Container Type</p>
                            <p>{container.containerType}</p>
                        </div>
                     </div>
                     <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Shelf Location</p>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{container.shelfLocation || 'Not Shelved'}</p>
                            <div className="flex gap-2">
                                <MoveContainerDialog 
                                  container={container} 
                                  allLocations={sortedLocations} 
                                />
                                <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Clear</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Items in Container</CardTitle>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Item Description/Part Number</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {container.items.map((item, index) => (
                        <TableRow key={`${item.description}-${index}`}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Container Image</CardTitle>
                </CardHeader>
                <CardContent>
                    {container.imageUrl ? (
                        <Image
                            src={container.imageUrl}
                            alt="Container Image"
                            width={600}
                            height={400}
                            className="rounded-md object-cover"
                            data-ai-hint="container box"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-48 rounded-md border border-dashed bg-muted">
                            <p className="text-muted-foreground">No image uploaded</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
