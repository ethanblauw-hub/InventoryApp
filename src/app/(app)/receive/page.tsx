
'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from '@/components/ui/form';
import QRcode from 'qrcode';
import { useForm, useFieldArray, Control } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, Printer, Package, Box, ShoppingCart, MoreHorizontal, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, collectionGroup, query, runTransaction, doc, where, getDocs, writeBatch } from 'firebase/firestore';
import { Bom, Category, Location, BomItem, Container } from '@/lib/data';
import { useRouter } from 'next/navigation';


const itemSchema = z.object({
  description: z.string().min(1, "Item description is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const containerSchema = z.object({
  type: z.string().min(1, "Container type is required."),
  items: z.array(itemSchema).min(1, "At least one item is required per container."),
  shelfLocation: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

const formSchema = z.object({
  jobNumber: z.string().optional(),
  jobName: z.string().optional(),
  workCategory: z.string().optional(),
  containers: z.array(containerSchema).min(1, "At least one container is required."),
});

type ReceiveFormValues = z.infer<typeof formSchema>;


export default function ReceiveStorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  const bomsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'boms')) : null),
    [firestore]
  );
  const { data: boms, isLoading: areBomsLoading } = useCollection<Bom>(bomsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Category>(categoriesQuery);

  const locationsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shelfLocations') : null),
    [firestore]
  );
  const { data: locations, isLoading: areLocationsLoading } = useCollection<Location>(locationsQuery);


  const form = useForm<ReceiveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      containers: [{ type: '', items: [{description: '', quantity: 1}] }],
    },
  });

  const { fields: containerFields, append: appendContainer, remove: removeContainer } = useFieldArray({
    control: form.control,
    name: "containers",
  });
  
  const selectedJobNumber = form.watch('jobNumber');
  const itemsForSelectedJob = useMemo(() => {
    if (!selectedJobNumber || !boms) return [];
    const bom = boms.find(b => b.jobNumber === selectedJobNumber);
    return bom ? bom.items : [];
  }, [selectedJobNumber, boms]);


  async function onSubmit(values: ReceiveFormValues) {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }
    setIsSubmitting(true);
    
    try {
      await runTransaction(firestore, async (transaction) => {
        // First, create all the new container documents
        for (const container of values.containers) {
          const containerData: Omit<Container, 'id' | 'receiptDate'> = {
            jobNumber: values.jobNumber,
            jobName: values.jobName,
            workCategoryId: values.workCategory,
            containerType: container.type,
            items: container.items,
            shelfLocation: container.shelfLocation,
            notes: container.notes,
            imageUrl: container.imageUrl,
          };
          
          const newContainerRef = doc(collection(firestore, 'containers'));
          const newContainer: Container = {
              ...containerData,
              id: newContainerRef.id,
              receiptDate: new Date().toISOString(),
          };
          transaction.set(newContainerRef, newContainer);
        }

        // If a job is associated, update the BOM quantities
        if (values.jobNumber) {
          const bomsQuery = query(
            collectionGroup(firestore, 'boms'),
            where('jobNumber', '==', values.jobNumber)
          );
          
          const bomsSnapshot = await getDocs(bomsQuery);

          if (!bomsSnapshot.empty) {
            const bomDoc = bomsSnapshot.docs[0];
            const bomData = bomDoc.data() as Bom;
            const bomRef = bomDoc.ref;
            
            // Get the current state of the BOM within the transaction
            const transactionalBomDoc = await transaction.get(bomRef);
            if (!transactionalBomDoc.exists()) {
              throw new Error(`BOM for job ${values.jobNumber} not found!`);
            }
            const transactionalBomData = transactionalBomDoc.data() as Bom;

            const allReceivedItems = values.containers.flatMap(c => c.items);
            const itemQuantities: Record<string, number> = {};

            allReceivedItems.forEach(item => {
              itemQuantities[item.description] = (itemQuantities[item.description] || 0) + item.quantity;
            });
            
            const updatedItems = transactionalBomData.items.map(bomItem => {
              if (itemQuantities[bomItem.description]) {
                return {
                  ...bomItem,
                  onHandQuantity: (bomItem.onHandQuantity || 0) + itemQuantities[bomItem.description],
                  lastUpdated: new Date().toISOString(),
                };
              }
              return bomItem;
            });
            
            transaction.update(bomRef, { items: updatedItems });
          }
        }
      });

      toast({
        title: "Success",
        description: `Successfully received ${values.containers.length} container(s) and updated inventory.`,
      });
      
      router.push('/containers');

    } catch (error) {
        console.error("Failed to receive container:", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was an error processing your request. Please check permissions and try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function generateQRCode(data: string) {
    try {
      const url = await QRcode.toDataURL('https://eganco.com');
      setQrCodeUrl(url);
      setIsQrDialogOpen(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast({
        variant: 'destructive',
        title: 'QR Code Error',
        description: 'Failed to generate QR code.',
      });
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print QR Code</title></head>
          <body style="text-align: center; margin-top: 50px;">
            <img src="${qrCodeUrl}" alt="QR Code" />
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receive / Store"
        description="Log receipt of new materials or move existing inventory."
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Primary Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="jobNumber"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Job Number</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {areBomsLoading
                              ? "Loading jobs..."
                              : field.value
                              ? boms?.find(
                                  (bom) => bom.jobNumber === field.value
                                )?.jobName
                              : "Select job by name or number"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search job..." />
                          <CommandEmpty>No job found.</CommandEmpty>
                           <CommandList>
                            {boms?.map((bom) => (
                              <CommandItem
                                value={`${bom.jobName} ${bom.jobNumber}`}
                                key={bom.id}
                                onSelect={() => {
                                  form.setValue("jobNumber", bom.jobNumber);
                                  form.setValue("jobName", bom.jobName);
                                  form.setValue("workCategory", bom.workCategoryId);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    bom.jobNumber === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div>
                                    <p>{bom.jobName}</p>
                                    <p className="text-sm text-muted-foreground">{bom.jobNumber}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Search by job name or number. Selecting a job auto-fills the category and item list.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Category</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedJobNumber}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={areCategoriesLoading ? "Loading..." : "Select a category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Containers</h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendContainer({ type: '', items: [{description: '', quantity: 1}] })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Container
                </Button>
            </div>
            {form.formState.errors.containers && !form.formState.errors.containers.root && (
                 <p className="text-sm font-medium text-destructive">{form.formState.errors.containers.message}</p>
             )}

            {containerFields.map((container, containerIndex) => (
              <Card key={container.id} className="relative">
                 {containerFields.length > 1 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        onClick={() => removeContainer(containerIndex)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Container</span>
                    </Button>
                 )}
                <CardHeader>
                    <FormField
                        control={form.control}
                        name={`containers.${containerIndex}.type`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Container Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a container type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pallet"><Package className="mr-2 inline-block h-4 w-4"/> Pallet</SelectItem>
                                    <SelectItem value="box"><Box className="mr-2 inline-block h-4 w-4"/> Box</SelectItem>
                                    <SelectItem value="cart"><ShoppingCart className="mr-2 inline-block h-4 w-4"/> Cart</SelectItem>
                                    <SelectItem value="other"><MoreHorizontal className="mr-2 inline-block h-4 w-4"/> Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardHeader>
                <CardContent className="space-y-6">
                    <ItemArray 
                      control={form.control} 
                      containerIndex={containerIndex} 
                      jobItems={itemsForSelectedJob}
                    />

                    <Separator />
                    
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name={`containers.${containerIndex}.shelfLocation`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shelf Location</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder={areLocationsLoading ? "Loading..." : "Select a destination location"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {locations?.map(location => (
                                    <SelectItem key={`${containerIndex}-${location.id}`} value={location.name}>{location.name}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`containers.${containerIndex}.notes`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Add any relevant notes for this container..."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="flex flex-wrap gap-2">
                             <Button type="button" variant="outline">
                                <Camera className="mr-2 h-4 w-4" />
                                Upload Photo
                            </Button>
                            <Button type="button" onClick={() => generateQRCode("temp-data")} variant="secondary">
                                <Printer className="mr-2 h-4 w-4" />
                                Print Label
                            </Button>
                        </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button type="submit" disabled={containerFields.length === 0 || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Receive and Store"}
          </Button>
        </form>
      </Form>
      
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Container QR Code</DialogTitle>
            <DialogDescription>
              Scan, download, or print the QR code for the container label.
            </DialogDescription>
          </DialogHeader>
          {qrCodeUrl && (
            <div className="flex items-center justify-center p-4">
              <Image src={qrCodeUrl} alt="Generated QR Code" width={256} height={256} />
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" size="icon" asChild>
                <a href={qrCodeUrl} download="container-qr.png">
                    <Download />
                    <span className="sr-only">Download QR Code</span>
                </a>
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer />
                <span className="sr-only">Print QR Code</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ItemArrayProps = {
  containerIndex: number;
  control: Control<ReceiveFormValues>;
  jobItems: BomItem[];
};

function ItemArray({ containerIndex, control, jobItems }: ItemArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `containers.${containerIndex}.items`
  });
  
  const { register, formState: { errors } } = useFormContext<ReceiveFormValues>();
  const containerErrors = errors.containers?.[containerIndex] as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Items</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ description: '', quantity: 1 })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      {containerErrors?.items && !containerErrors.items.root && (
        <p className="text-sm font-medium text-destructive">{containerErrors.items.message}</p>
      )}

      {fields.map((item, itemIndex) => (
        <div key={item.id} className="grid grid-cols-1 gap-4 items-start sm:grid-cols-[1fr_auto_auto] sm:gap-2">
          <FormField
            control={control}
            name={`containers.${containerIndex}.items.${itemIndex}.description`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className={cn(itemIndex !== 0 && "sr-only")}>Description/Part Number</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value || "Select or type an item"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={true} filter={(value, search) => {
                      if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                      return 0;
                    }}>
                      <CommandInput 
                        placeholder="Search or type new item..." 
                        {...register(`containers.${containerIndex}.items.${itemIndex}.description`)}
                        onValueChange={(search) => field.onChange(search)}
                      />
                      <CommandList>
                        <CommandEmpty>
                            <div className="p-4 text-sm">No items match. You can add this as a new item.</div>
                        </CommandEmpty>
                        <CommandGroup>
                          {jobItems.map((jobItem) => (
                            <CommandItem
                              key={jobItem.id}
                              value={jobItem.description}
                              onSelect={(currentValue) => {
                                field.onChange(currentValue === field.value ? "" : currentValue);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === jobItem.description ? "opacity-100" : "opacity-0")}
                              />
                              {jobItem.description}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`containers.${containerIndex}.items.${itemIndex}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={cn(itemIndex !== 0 && "sr-only")}>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} className="w-24 text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={cn("flex items-end h-full", itemIndex !== 0 && "sm:pt-8")}>
             {fields.length > 1 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(itemIndex)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Item</span>
                </Button>
             )}
          </div>
        </div>
      ))}
    </div>
  );
}
