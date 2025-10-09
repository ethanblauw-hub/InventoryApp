
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AddItemDialog } from '@/components/add-item-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collectionGroup, query } from 'firebase/firestore';
import { Bom } from '@/lib/data';

const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);


/**
 * The main dashboard page of the application, which serves as the primary inventory overview.
 * It displays a comprehensive list of all items from all Bills of Materials (BOMs).
 * It includes functionality for searching and filtering items, such as viewing only items
 * related to the current user's jobs.
 *
 * @returns {JSX.Element} The rendered dashboard page.
 */
export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [showMyJobsOnly, setShowMyJobsOnly] = useState(false);
  const router = useRouter();
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  
  const bomsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'boms')) : null),
    [firestore]
  );
  const { data: boms, isLoading: areBomsLoading } = useCollection<Bom>(bomsQuery);

  const allBomItems = boms?.flatMap(bom => 
    bom.items.map(item => ({
      ...item,
      bomId: bom.id,
      jobId: bom.jobNumber, 
      jobNumber: bom.jobNumber,
      jobName: bom.jobName,
      projectManager: bom.projectManager,
      primaryFieldLeader: bom.primaryFieldLeader,
    }))
  ) || [];

  const filteredItems = allBomItems.filter(item => {
    if (showMyJobsOnly && currentUser?.displayName) {
      if (item.projectManager !== currentUser.displayName && item.primaryFieldLeader !== currentUser.displayName) {
        return false;
      }
    }
    
    const searchTerm = search.toLowerCase();
    if (searchTerm === '') return true;

    return (
      (item.jobNumber?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.jobName?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.projectManager?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.primaryFieldLeader?.toLowerCase() ?? '').includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.shelfLocations.join(', ').toLowerCase().includes(searchTerm) ||
      (item.lastUpdated?.toString() ?? '').toLowerCase().includes(searchTerm)
    );
  });
  
  /**
   * Navigates to the detail page for a specific BOM.
   * @param {string} jobNumber - The job number of the BOM to view.
   * @param {string} bomId - The ID of the BOM to view.
   */
  const handleBomRedirect = (jobNumber: string, bomId: string) => {
    router.push(`/boms/${jobNumber}/${bomId}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="A complete list of all parts in the shop from all BOMs."
      >
        <AddItemDialog />
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input 
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2">
              <Checkbox id="my-jobs-filter" checked={showMyJobsOnly} onCheckedChange={(checked) => setShowMyJobsOnly(!!checked)} />
              <Label htmlFor="my-jobs-filter" className="cursor-pointer">
                Only show materials for my jobs
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
                  <TableHead>Job Number</TableHead>
                  <TableHead className="hidden lg:table-cell">Job Name</TableHead>
                  <TableHead className="hidden xl:table-cell">PM</TableHead>
                  <TableHead className="hidden xl:table-cell">Field Leader</TableHead>
                  <TableHead>Item Description/Part Number</TableHead>
                  <TableHead className="text-right">Order BOM Qty</TableHead>
                  <TableHead className="text-right">Design BOM Qty</TableHead>
                  <TableHead className="text-right">On-Hand</TableHead>
                  <TableHead className="text-right">Shipped</TableHead>
                  <TableHead>Shelf Location(s)</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areBomsLoading && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center">Loading inventory items...</TableCell>
                  </TableRow>
                )}
                {!areBomsLoading && filteredItems.map((item) => {
                  const placeholder = item.imageId ? getPlaceholderImage(item.imageId) : undefined;
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
                      <TableCell className="font-medium">{item.jobNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell">{item.jobName}</TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">{item.projectManager}</TableCell>
                       <TableCell className="hidden xl:table-cell text-muted-foreground">{item.primaryFieldLeader}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.orderBomQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.designBomQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.onHandQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.shippedQuantity.toLocaleString()}</TableCell>
                       <TableCell className="text-muted-foreground">{item.shelfLocations.join(', ')}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{lastUpdatedDate}</TableCell>
                      <TableCell className="text-right">
                        {item.bomId && item.jobId && (
                           <Button variant="outline" size="sm" onClick={() => handleBomRedirect(item.jobId, item.bomId)}>
                             View BOM
                             <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                 {!areBomsLoading && filteredItems.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={13} className="text-center">No items match your search.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
