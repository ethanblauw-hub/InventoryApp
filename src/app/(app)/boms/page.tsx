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
import { Button } from '@/components/ui/button';
import { Eye, Upload } from 'lucide-react';
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
                  <TableHead>BOM Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Items</TableHead>
                  <TableHead className="hidden md:table-cell">Date Uploaded</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boms.map((bom) => (
                  <TableRow key={bom.id}>
                    <TableCell className="font-medium">{bom.name}</TableCell>
                    <TableCell>
                      <Badge variant={bom.type === 'Design BOM' ? 'default' : 'outline'}>
                        {bom.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{bom.items.length}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{bom.dateUploaded}</TableCell>
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
