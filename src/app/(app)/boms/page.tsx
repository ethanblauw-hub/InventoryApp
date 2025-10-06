"use client";

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
import { BomImportDialog } from '@/components/bom-import-dialog';
import { useRouter } from 'next/navigation';

export default function BomsPage() {
  const router = useRouter();

  const handleRowClick = (bomId: string) => {
    router.push(`/boms/${bomId.replace('bom-', '')}`);
  };

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
                  <TableHead className="hidden sm:table-cell">Project Manager</TableHead>
                  <TableHead className="hidden md:table-cell">Field Leader</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boms.map((bom) => (
                  <TableRow 
                    key={bom.id} 
                    onClick={() => handleRowClick(bom.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{bom.jobNumber}</TableCell>
                    <TableCell>{bom.jobName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{bom.projectManager}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{bom.primaryFieldLeader}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right">{bom.items.length}</TableCell>
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
