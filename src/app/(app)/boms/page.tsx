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
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { BomImportDialog } from '@/components/bom-import-dialog';

export default function BomsPage() {
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
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boms.map((bom) => (
                  <TableRow key={bom.id}>
                    <TableCell className="font-medium">{bom.jobNumber}</TableCell>
                    <TableCell>{bom.jobName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{bom.projectManager}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{bom.primaryFieldLeader}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right">{bom.items.length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/boms/${bom.id.replace('bom-', '')}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Link>
                      </Button>
                    </TableCell>
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
