
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Container, Category } from '@/lib/data';

/**
 * A page component that displays a list of all containers in the shop.
 * It provides a high-level overview of each container, including its associated job,
 * category, type, and location. Users can click on a container to navigate to its
 * detailed view or receive a new container.
 *
 * @returns {JSX.Element} The rendered containers list page.
 */
export default function ContainersPage() {
  const router = useRouter();
  const firestore = useFirestore();

  const containersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'containers')) : null),
    [firestore]
  );
  const { data: containers, isLoading: areContainersLoading } = useCollection<Container>(containersQuery);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Category>(categoriesQuery);

  /**
   * Handles the click event on a table row.
   * Navigates the user to the detail page for the selected container.
   * @param {string} containerId - The unique identifier of the container.
   */
  const handleRowClick = (containerId: string) => {
    router.push(`/containers/${containerId}`);
  };

  const isLoading = areContainersLoading || areCategoriesLoading;

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
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading containers...</TableCell>
                  </TableRow>
                )}
                {!isLoading && containers?.map((container) => {
                  const category = categories?.find(c => c.id === container.workCategoryId);
                  return (
                    <TableRow 
                      key={container.id} 
                      onClick={() => handleRowClick(container.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono">{container.id}</TableCell>
                      <TableCell className="font-medium">{container.jobName} ({container.jobNumber})</TableCell>
                      <TableCell>
                        {category && <Badge variant="secondary">{category.name}</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{container.containerType}</TableCell>
                      <TableCell className="text-muted-foreground">{container.shelfLocation}</TableCell>
                      <TableCell className="text-right font-mono">{container.items?.length || 0}</TableCell>
                    </TableRow>
                  )
                })}
                {!isLoading && (!containers || containers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No containers found.</TableCell>
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
