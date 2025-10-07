
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileText, PlusCircle, Ship, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data for a single container - this would be fetched based on the [id] param
const containerDetails = {
  id: 'cont-123',
  jobNumber: 'J1234',
  jobName: 'Job 1234 - Phase 1',
  departmentName: null,
  receiptDate: '2023-11-20',
  workCategory: 'Lighting',
  containerType: 'Pallet',
  shelfLocation: 'Aisle A, Shelf 1',
  imageUrl: 'https://picsum.photos/seed/cont-123/600/400',
  hasBOM: true,
  items: [
    { id: 'item-1', description: 'STL-BM-24', quantity: 10 },
    { id: 'item-2', description: 'GUS-PLT-LG', quantity: 25 },
  ],
  changeLog: [
    { date: '2023-11-20', event: 'Container received and stored at Aisle A, Shelf 1 by Alice.' },
    { date: '2023-11-21', event: 'Item GUS-PLT-LG (10 units) added by Bob.' },
  ],
};

/**
 * Props for the ContainerDetailsPage component.
 * @property {object} params - The route parameters.
 * @property {string} params.id - The ID of the container to display.
 */
type ContainerDetailsPageProps = {
  params: {
    id: string;
  };
};

/**
 * A page component that displays the detailed information for a single container.
 * It shows the container's metadata, its contents, its location in the shop,
 * and provides actions for managing the container.
 *
 * Note: This component currently uses mock data. In a real application,
 * it would fetch data based on the `params.id`.
 *
 * @param {ContainerDetailsPageProps} props - The props for the component.
 * @returns {JSX.Element} The rendered container details page.
 */
export default function ContainerDetailsPage({ params }: ContainerDetailsPageProps) {
  // In a real app, you'd use params.id to fetch container data
  const container = containerDetails;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Container #${params.id}`}
        description={container.jobName || container.departmentName}
      >
        <div className="flex flex-wrap gap-2">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Open BOM</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            <Button variant="secondary"><Ship className="mr-2 h-4 w-4" /> Ship Container</Button>
            <Button variant="ghost"><History className="mr-2 h-4 w-4" /> View Change Log</Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Container Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Job Number</p>
                            <p>{container.jobNumber || 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-muted-foreground">Original Receipt Date</p>
                            <p>{container.receiptDate}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Work Category</p>
                            <p><Badge variant="secondary">{container.workCategory}</Badge></p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text.muted.foreground">Container Type</p>
                            <p>{container.containerType}</p>
                        </div>
                     </div>
                     <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Shelf Location</p>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{container.shelfLocation}</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Move</Button>
                                <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Clear</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Items in Container</CardTitle>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Item Description/Part Number</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {container.items.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Container Image</CardTitle>
                </CardHeader>
                <CardContent>
                    {container.imageUrl ? (
                        <Image
                            src={container.imageUrl}
                            alt="Container Image"
                            width={600}
                            height={400}
                            className="rounded-md object-cover"
                            data-ai-hint="container box"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-48 rounded-md border border-dashed bg-muted">
                            <p className="text-muted-foreground">No image uploaded</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
