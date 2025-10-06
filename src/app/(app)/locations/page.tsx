import { PageHeader } from '@/components/page-header';
import { locations, items } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  const locationsWithItems = locations.map(location => ({
    ...location,
    containedItems: items.filter(item => item.locationId === location.id)
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelf Locations"
        description="A list of all physical storage locations and their contents."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {locationsWithItems.map(location => (
              <AccordionItem value={location.id} key={location.id}>
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                  <div className="flex items-center gap-4">
                    <span>{location.name}</span>
                    <Badge variant="secondary">{location.containedItems.length} item types</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {location.containedItems.length > 0 ? (
                    <div className="relative w-full overflow-auto border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {location.containedItems.map(item => {
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
                                <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                                <TableCell className="text-right font-mono">{item.quantity.toLocaleString()}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="p-4 text-center text-muted-foreground">This location is empty.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
