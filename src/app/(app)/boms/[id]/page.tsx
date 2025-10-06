import { PageHeader } from '@/components/page-header';
import { boms } from '@/lib/data';
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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

export default function BomDetailPage({ params }: { params: { id: string } }) {
  const bom = boms.find((b) => b.id === `bom-${params.id}`);
  
  if (!bom) {
    notFound();
  }

  const bomItems = bom.items;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${bom.jobName} (${bom.jobNumber})`}
        description={`PM: ${bom.projectManager} | Field Leader: ${bom.primaryFieldLeader}`}
      >
        <Button variant="outline" asChild>
          <Link href="/boms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All BOMs
          </Link>
        </Button>
      </PageHeader>
      
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
                  <TableHead>Category</TableHead>
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
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{item.orderBomQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.designBomQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.onHandQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.shippedQuantity.toLocaleString()}</TableCell>
                       <TableCell className="text-muted-foreground">{item.shelfLocations.join(', ')}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{item.lastUpdated}</TableCell>
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
