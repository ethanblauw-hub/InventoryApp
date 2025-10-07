
import { PageHeader } from '@/components/page-header';
import { boms, locations } from '@/lib/data';
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const getPlaceholderImage = (imageId: string) => PlaceHolderImages.find(p => p.id === imageId);

export default function LocationsPage() {
  const allBomItems = boms.flatMap(bom => 
    bom.items.map(item => ({
      ...item,
      bomId: bom.id,
      jobNumber: bom.jobNumber,
      jobName: bom.jobName,
      projectManager: bom.projectManager,
      primaryFieldLeader: bom.primaryFieldLeader,
    }))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelf Locations"
        description="A detailed inventory list by location."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Item Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shelf Location</TableHead>
                  <TableHead>Job Number</TableHead>
                  <TableHead>Job Name</TableHead>
                  <TableHead>PM Name</TableHead>
                  <TableHead>Primary Field Leader</TableHead>
                  <TableHead>Item Description/Part Number</TableHead>
                  <TableHead className="text-right">On-Hand Qty</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBomItems.map(item => (
                  item.shelfLocations.map(location => (
                    <TableRow key={`${item.id}-${location}`}>
                      <TableCell>
                        <Badge variant="secondary">{location}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.jobNumber}</TableCell>
                      <TableCell>{item.jobName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.projectManager}</TableCell>
                      <TableCell className="text-muted-foreground">{item.primaryFieldLeader}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.onHandQuantity.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
