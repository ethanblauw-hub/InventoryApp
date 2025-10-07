
"use client";

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
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data for a list of containers
const containers = [
  {
    id: 'cont-123',
    jobNumber: 'J1234',
    jobName: 'Job 1234 - Phase 1',
    itemCategory: 'Structural Steel',
    containerType: 'Pallet',
    shelfLocation: 'Aisle A, Shelf 1',
    itemCount: 2,
  },
  {
    id: 'cont-456',
    jobNumber: 'J5678',
    jobName: 'Job 5678 - Initial',
    itemCategory: 'Gear',
    containerType: 'Cart',
    shelfLocation: 'Receiving Dock',
    itemCount: 5,
  },
];

export default function ContainersPage() {
  const router = useRouter();

  const handleRowClick = (containerId: string) => {
    router.push(`/containers/${containerId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Containers"
        description="A list of all containers in the shop."
      >
        <Button asChild>
            <Link href="/receive">
              <PlusCircle className="mr-2 h-4 w-4" />
              Receive New Container
            </Link>
          </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>All Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container ID</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow 
                    key={container.id} 
                    onClick={() => handleRowClick(container.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono">{container.id}</TableCell>
                    <TableCell className="font-medium">{container.jobName} ({container.jobNumber})</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{container.itemCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{container.containerType}</TableCell>
                    <TableCell className="text-muted-foreground">{container.shelfLocation}</TableCell>
                    <TableCell className="text-right font-mono">{container.itemCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
