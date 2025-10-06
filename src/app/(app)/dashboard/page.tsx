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

const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

export default function DashboardPage() {
  const allBomItems = boms.flatMap(bom => 
    bom.items.map(item => ({
      ...item,
      jobNumber: bom.jobNumber,
      jobName: bom.jobName,
      projectManager: bom.projectManager,
      primaryFieldLeader: bom.primaryFieldLeader,
    }))
  );

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBomItems.map((item) => {
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
