"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { boms } from '@/lib/data';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AddItemDialog } from '@/components/add-item-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const allBomItems = boms.flatMap(bom => 
    bom.items.map(item => ({
      ...item,
      bomId: bom.id,
      jobNumber: bom.jobNumber,
      jobName: bom.jobName,
      projectManager: bom.projectManager,
      primaryFieldLeader: bom.primaryFieldLeader,
    }))
  );

  const filteredItems = allBomItems.filter(item => {
    const searchTerm = search.toLowerCase();
    return (
      item.jobNumber.toLowerCase().includes(searchTerm) ||
      item.jobName.toLowerCase().includes(searchTerm) ||
      item.projectManager.toLowerCase().includes(searchTerm) ||
      item.primaryFieldLeader.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.shelfLocations.join(', ').toLowerCase().includes(searchTerm) ||
      item.lastUpdated.toLowerCase().includes(searchTerm)
    );
  });
  
  const handleBomRedirect = (bomId: string) => {
    router.push(`/boms/${bomId.replace('bom-', '')}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="A complete list of all parts in the shop."
      >
        <AddItemDialog />
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
          <div className="mt-4">
            <Input 
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
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
                  <TableHead>Item Category</TableHead>
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
                {filteredItems.map((item) => {
                  const placeholder = item.imageId ? getPlaceholderImage(item.imageId) : undefined;
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
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.orderBomQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.designBomQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.onHandQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.shippedQuantity.toLocaleString()}</TableCell>
                       <TableCell className="text-muted-foreground">{item.shelfLocations.join(', ')}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        {item.bomId && (
                           <Button variant="outline" size="sm" onClick={() => handleBomRedirect(item.bomId)}>
                             View BOM
                             <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        )}
                      </TableCell>
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
