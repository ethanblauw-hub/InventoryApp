import { PageHeader } from '@/components/page-header';
import { boms, items as allItems, locations } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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

const getLocationName = (locationId: string) =>
  locations.find((l) => l.id === locationId)?.name || 'N/A';

const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

export default function BomDetailPage({ params }: { params: { id: string } }) {
  const bom = boms.find((b) => b.id === `bom-${params.id}`);
  
  if (!bom) {
    notFound();
  }

  const bomItems = bom.items.map(bomItem => {
    const itemDetails = allItems.find(i => i.id === bomItem.itemId);
    return { ...itemDetails, requiredQuantity: bomItem.quantity, id: bomItem.itemId };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={bom.name}
        description={`Details for ${bom.type}. Uploaded on ${bom.dateUploaded}.`}
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
            This list shows the required items and quantities for this BOM compared to current inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Required</TableHead>
                  <TableHead className="text-right">In Stock</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bomItems.map((item) => {
                  if (!item.name) return null;
                  const placeholder = item.imageId ? getPlaceholderImage(item.imageId) : undefined;
                  const variance = (item.quantity ?? 0) - item.requiredQuantity;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {placeholder && (
                           <Image
                            src={placeholder.imageUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                            data-ai-hint={placeholder.imageHint}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      <TableCell className="text-right font-mono">{item.requiredQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{item.quantity?.toLocaleString() ?? 0}</TableCell>
                      <TableCell className={`text-right font-mono font-medium ${variance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {variance.toLocaleString()}
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
