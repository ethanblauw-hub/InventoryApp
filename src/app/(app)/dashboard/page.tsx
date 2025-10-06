import { PageHeader } from '@/components/page-header';
import { items, locations } from '@/lib/data';
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

const getLocationName = (locationId: string) =>
  locations.find((l) => l.id === locationId)?.name || 'N/A';
  
const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

export default function DashboardPage() {
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
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const placeholder = getPlaceholderImage(item.imageId);
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
                      <TableCell className="hidden text-muted-foreground md:table-cell">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{getLocationName(item.locationId)}</TableCell>
                      <TableCell className="text-right font-mono">{item.quantity.toLocaleString()}</TableCell>
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
