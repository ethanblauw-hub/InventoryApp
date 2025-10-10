
'use client';

import { use, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileText, PlusCircle, Ship, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Container, Category, Bom } from '@/lib/data';


/**
 * A page component that displays the detailed information for a single container.
 * It shows the container's metadata, its contents, its location in the shop,
 * and provides actions for managing the container.
 *
 * @returns {JSX.Element} The rendered container details page.
 */
export default function ContainerDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

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

  useEffect(() => {
    if (!isContainerLoading && !container) {
      notFound();
    }
  }, [isContainerLoading, container]);

  if (isContainerLoading || areCategoriesLoading) {
    return <div>Loading container details...</div>;
  }
  
  if (error) {
     return <div>Error loading container. It may have been deleted or you may not have access.</div>
  }

  if (!container) {
    return null; // or a not found component
  }

  const workCategory = categories?.find(cat => cat.id === container.workCategoryId);

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
            <Button variant="secondary"><Ship className="mr-2 h-4 w-4" /> Ship Container</Button>
            <Button variant="ghost"><History className="mr-2 h-4 w-4" /> View Change Log</Button>
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
                            <p className="text-sm font-medium text.muted.foreground">Container Type</p>
                            <p>{container.containerType}</p>
                        </div>
                     </div>
                     <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Shelf Location</p>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{container.shelfLocation || 'Not Shelved'}</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Move</Button>
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
