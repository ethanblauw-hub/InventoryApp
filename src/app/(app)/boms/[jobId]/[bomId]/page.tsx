
'use client';

import { use, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound, useRouter } from 'next/navigation';
import { EditBOMDialog } from '@/components/edit-bom-dialog';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { Bom } from '@/lib/data';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
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
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

/**
 * Props for the BomDetailPage component.
 * @property {object} params - The route parameters.
 * @property {string} params.jobId - The ID of the Job.
 * @property {string} params.bomId - The ID of the Bill of Materials to display.
 */
type BomDetailPageProps = {
  params: { jobId: string; bomId: string };
};

/**
 * A page component that displays the detailed contents of a single Bill of Materials (BOM).
 * It shows item descriptions, quantities, and other relevant information for a specific job BOM.
 * If the BOM is not found, it will render a 404 page.
 *
 * @param {BomDetailPageProps} props - The props for the component.
 * @returns {JSX.Element} The rendered BOM detail page.
 */
export default function BomDetailPage(props: BomDetailPageProps) {
  const router = useRouter();
  const { jobId, bomId } = props.params;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const bomRef = useMemoFirebase(
    () => (firestore && jobId && bomId ? doc(firestore, 'jobs', jobId, 'boms', bomId) : null),
    [firestore, jobId, bomId]
  );
  
  const { data: bom, isLoading: isBomLoading, error } = useDoc<Bom>(bomRef);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Bom>(categoriesQuery);
  
  // This effect will watch for the bom to disappear after deletion
  // and redirect if it's no longer loading but gone.
  useEffect(() => {
    if (!isBomLoading && !bom && !error && !isDeleting) {
      // If loading is done, there's no bom, and no error,
      // it means it was likely deleted.
      router.push('/boms');
    }
  }, [isBomLoading, bom, router, error, isDeleting]);
  
  if (error) {
    // If there's an error (e.g. permissions), it's handled by the global error boundary
    // but we can also show a message here if needed.
    return <div>Error loading BOM. It may have been deleted or you may not have access.</div>
  }

  // Placeholder for admin check. Replace with actual authentication logic.
  const isAdmin = true;

  const handleRowClick = (shelfLocation: string) => {
    // Navigate to the locations page with the shelf location as a search query
    router.push(`/locations?search=${encodeURIComponent(shelfLocation)}`);
  }
  
  const handleDelete = () => {
    if (!bomRef) return;
    
    setIsDeleting(true); // Set deleting state to true
    
    deleteDocumentNonBlocking(bomRef);
    
    toast({
      title: 'Deletion Started',
      description: `The BOM "${bom?.jobName}" is being deleted.`,
    });
    
    // Immediately navigate away to prevent 404/rendering issues
    router.push('/boms');
  };

  if (isBomLoading || areCategoriesLoading || isDeleting) {
    return <div>Loading BOM details...</div>;
  }
  
  if (!bom) {
    // This will now only be hit if the BOM was invalid to begin with,
    // not during deletion.
    notFound();
    return null; // notFound() throws an error so this is for type safety
  }
  
  const workCategory = categories?.find(c => c.id === bom.workCategoryId);
  const bomItems = bom.items || [];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={`${bom.jobName} (${bom.jobNumber})`}
        description={`PM: ${bom.projectManager} | Field Leader: ${bom.primaryFieldLeader}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/boms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All BOMs
            </Link>
          </Button>
          <EditBOMDialog bom={bom} />
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete BOM
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the BOM
                    for "{bom.jobName}" and all of its associated items.
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

      <div className="mb-4">
        {workCategory && (
          <Badge variant="default" className="text-sm">
            {workCategory.name}
          </Badge>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Items in BOM</CardTitle>
          <CardDescription>
            This list shows the required items and quantities for this BOM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
                  <TableHead>Description/Part Number</TableHead>
                  <TableHead className="text-right">Order Qty</TableHead>
                  <TableHead className="text-right">Design Qty</TableHead>
                  <TableHead className="text-right">On-Hand</TableHead>
                  <TableHead className="text-right">Shipped</TableHead>
                  <TableHead>Shelf Location(s)</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bomItems.map((item) => {
                  const placeholder = item.imageId ? getPlaceholderImage(item.imageId) : undefined;
                  // Handle cases where an item might have multiple locations. We'll make each one clickable.
                  const locations = item.shelfLocations.join(', ');
                  const lastUpdatedDate = item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A';
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {placeholder && (
                           <Image
                            src={placeholder.imageUrl}
                            alt={item.description}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                            data-ai-hint={placeholder.imageHint}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.orderBomQuantity?.toLocaleString() ?? 0}</TableCell>
                      <TableCell className="text-right font-mono">{item.designBomQuantity?.toLocaleString() ?? 0}</TableCell>
                      <TableCell className="text-right font-mono">{item.onHandQuantity?.toLocaleString() ?? 0}</TableCell>
                      <TableCell className="text-right font-mono">{item.shippedQuantity?.toLocaleString() ?? 0}</TableCell>
                       <TableCell 
                        className="text-muted-foreground cursor-pointer hover:underline" 
                        onClick={() => handleRowClick(locations)}
                       >
                          {locations}
                       </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{lastUpdatedDate}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
