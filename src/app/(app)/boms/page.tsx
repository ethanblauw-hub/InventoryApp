
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
import { BomImportDialog } from '@/components/bom-import-dialog';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, collectionGroup, query } from 'firebase/firestore';
import { Bom, Category } from '@/lib/data';

/**
 * A page component that displays a list of all uploaded Bills of Materials (BOMs).
 * It allows users to view high-level information about each BOM and click on a row
 * to navigate to the detailed view of that BOM. It also provides an option to import new BOMs.
 *
 * @returns {JSX.Element} The rendered BOMs list page.
 */
export default function BomsPage() {
  const router = useRouter();
  const firestore = useFirestore();

  const bomsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'boms')) : null),
    [firestore]
  );
  const { data: boms, isLoading: areBomsLoading } = useCollection<Bom>(bomsQuery);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Category>(categoriesQuery);

  /**
   * Handles the click event on a table row.
   * Navigates the user to the detail page for the selected BOM.
   * @param {Bom} bom - The BOM object.
   */
  const handleRowClick = (bom: Bom) => {
    router.push(`/boms/${bom.jobNumber}/${bom.id}`);
  };

  const isLoading = areBomsLoading || areCategoriesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills of Materials (BOMs)"
        description="Manage Order (estimate) and Design (actual) BOMs for all jobs."
      >
        <BomImportDialog />
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded BOMs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Number</TableHead>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Work Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Project Manager</TableHead>
                  <TableHead className="hidden md:table-cell">Field Leader</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading BOMs...</TableCell>
                  </TableRow>
                )}
                {!isLoading && boms?.map((bom) => {
                  const category = categories?.find(c => c.id === bom.workCategoryId);
                  return (
                    <TableRow 
                      key={bom.id} 
                      onClick={() => handleRowClick(bom)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{bom.jobNumber}</TableCell>
                      <TableCell>{bom.jobName}</TableCell>
                      <TableCell>
                        {category && <Badge variant="secondary">{category.name}</Badge>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{bom.projectManager}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{bom.primaryFieldLeader}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right">{bom.items?.length || 0}</TableCell>
                    </TableRow>
                  );
                })}
                 {!isLoading && (!boms || boms.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No BOMs found. Try importing one.</TableCell>
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
