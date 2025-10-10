
'use client';

import { useState, useMemo, ChangeEvent, KeyboardEvent } from 'react';
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
import { useForm, useFieldArray, Control, UseFieldArrayRemove } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, Printer, Package, Box, ShoppingCart, MoreHorizontal, Download, FileImage } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import { useFirestore, useMemoFirebase, useCollection, useFirebaseApp } from '@/firebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, collectionGroup, query, runTransaction, doc, where, getDocs, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Bom, Category, Location, BomItem, Container } from '@/lib/data';
import { useRouter } from 'next/navigation';
import React from 'react';


const itemSchema = z.object({
  description: z.string().min(1, "Item description is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const containerSchema = z.object({
  type: z.string().min(1, "Container type is required."),
  items: z.array(itemSchema).min(1, "At least one item is required per container."),
  shelfLocation: z.string().optional(),
  notes: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
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
  const firebaseApp = useFirebaseApp();

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
  const { data: allLocations, isLoading: areLocationsLoading } = useCollection<Location>(locationsQuery);

  const form = useForm<ReceiveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      containers: [{ type: '', items: [{description: '', quantity: 1}] }],
    },
  });
  
  const watchedContainers = form.watch('containers');
  const selectedJobNumber = form.watch('jobNumber');

  const itemsForSelectedJob = useMemo(() => {
    if (!selectedJobNumber || !boms) return [];
    const bom = boms.find(b => b.jobNumber === selectedJobNumber);
    return bom ? bom.items : [];
  }, [selectedJobNumber, boms]);

  const { fields: containerFields, append: appendContainer, remove: removeContainer } = useFieldArray({
    control: form.control,
    name: "containers",
  });

  async function onSubmit(values: ReceiveFormValues) {
    if (!firestore || !firebaseApp) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const storage = getStorage(firebaseApp);
      const imageUrls = await Promise.all(
        values.containers.map(async (container) => {
          if (container.imageFile) {
            const file = container.imageFile;
            const filePath = `images/containers/${Date.now()}-${file.name}`;
            const imageStorageRef = storageRef(storage, filePath);
            await uploadBytes(imageStorageRef, file);
            return getDownloadURL(imageStorageRef);
          }
          return null;
        })
      );

      await runTransaction(firestore, async (transaction) => {
        let bomDocRef;
        let transactionalBomDoc: DocumentSnapshot<DocumentData> | null = null;
        const bomsCollectionQuery = query(
          collectionGroup(firestore, 'boms'),
          where('jobNumber', '==', values.jobNumber)
        );
        const bomsSnapshot = await getDocs(bomsCollectionQuery);

        if (!bomsSnapshot.empty) {
          bomDocRef = bomsSnapshot.docs[0].ref;
          transactionalBomDoc = await transaction.get(bomDocRef);
          if (!transactionalBomDoc.exists()) {
            throw new Error(`BOM for job ${values.jobNumber} not found inside transaction!`);
          }
        }

        values.containers.forEach((container, index) => {
          const containerData: Omit<Container, 'id' | 'receiptDate'> = {
            jobNumber: values.jobNumber,
            jobName: values.jobName,
            workCategoryId: values.workCategory,
            containerType: container.type,
            items: container.items,
            shelfLocation: container.shelfLocation ?? null,
            notes: container.notes ?? null,
            imageUrl: imageUrls[index] ?? null,
          };
          
          const newContainerRef = doc(collection(firestore, 'containers'));
          const newContainer: Container = {
              ...containerData,
              id: newContainerRef.id,
              receiptDate: new Date().toISOString(),
          };
          transaction.set(newContainerRef, newContainer);
        });

        if (bomDocRef && transactionalBomDoc && transactionalBomDoc.exists()) {
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
          
          transaction.update(bomDocRef, { items: updatedItems });
        }
      });

      toast({
        title: "Success",
        description: `Successfully received ${values.containers.length} container(s) and updated inventory.`,
      });
      
      router.push('/containers');

    } catch (error: any) {
        console.error("Failed to receive container:", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "There was an error processing your request. Please check permissions and try again.",
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receive / Store"
        description="Log receipt of new materials or move existing inventory."
      />
      
      <Form {...form}>
        <form onKeyDown={handleKeyDown} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Primary Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="jobNumber"
                  render={({ field }) => (
                    <FormItem>
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
              </div>
              <FormDescription className="mt-4">
                  Selecting a job auto-fills the category and makes job-specific items available in the dropdown.
              </FormDescription>
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
                        <ShelfLocationSelector
                          control={form.control}
                          containerIndex={containerIndex}
                          allLocations={allLocations || []}
                          watchedContainers={watchedContainers}
                          isLoading={areLocationsLoading}
                          boms={boms || []}
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
                        <ImageUploadField control={form.control} containerIndex={containerIndex} />
                        <div className="flex flex-wrap gap-2">
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
  
  const { formState: { errors } } = useFormContext<ReceiveFormValues>();
  const containerErrors = errors.containers?.[containerIndex] as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Items</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ description: '', quantity: 1 }, { shouldFocus: false })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      {containerErrors?.items && !containerErrors.items.root && (
        <p className="text-sm font-medium text-destructive">{containerErrors.items.message}</p>
      )}

      {/* Item Header Row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] sm:gap-2">
          <Label>Description/Part Number</Label>
          <Label className="text-right">Quantity</Label>
          <div className="flex justify-end">
            <span className="sr-only">Remove</span>
          </div>
      </div>

      <div className="space-y-2">
        {fields.map((item, itemIndex) => (
            <ItemRow
            key={item.id}
            containerIndex={containerIndex}
            itemIndex={itemIndex}
            control={control}
            jobItems={jobItems}
            onRemove={remove}
            showRemoveButton={fields.length > 1}
            />
        ))}
      </div>
    </div>
  );
}

type ItemRowProps = {
  containerIndex: number;
  itemIndex: number;
  control: Control<ReceiveFormValues>;
  jobItems: BomItem[];
  onRemove: UseFieldArrayRemove;
  showRemoveButton: boolean;
};

function ItemRow({ containerIndex, itemIndex, control, jobItems, onRemove, showRemoveButton }: ItemRowProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { register, setValue } = useFormContext<ReceiveFormValues>();
  
  return (
    <div className="grid grid-cols-1 gap-4 items-start sm:grid-cols-[1fr_auto_auto] sm:gap-2">
      <FormField
        control={control}
        name={`containers.${containerIndex}.items.${itemIndex}.description`}
        render={({ field }) => (
          <FormItem>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                    onValueChange={(search) => {
                      setValue(`containers.${containerIndex}.items.${itemIndex}.description`, search);
                    }}
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
                            setValue(`containers.${containerIndex}.items.${itemIndex}.description`, currentValue === field.value ? "" : currentValue);
                            setPopoverOpen(false);
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
            <FormControl>
              <Input type="number" placeholder="1" {...field} className="w-24 text-right" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-center h-full">
         {showRemoveButton && (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(itemIndex)}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove Item</span>
            </Button>
         )}
      </div>
    </div>
  );
}

function ImageUploadField({ control, containerIndex }: { control: Control<ReceiveFormValues>, containerIndex: number}) {
  const { watch, setValue } = useFormContext<ReceiveFormValues>();
  const file = watch(`containers.${containerIndex}.imageFile`);
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  return (
    <FormField
      control={control}
      name={`containers.${containerIndex}.imageFile`}
      render={({ field: { onChange, ...fieldProps } }) => (
        <FormItem>
          <FormLabel>Container Image</FormLabel>
          <div className="flex items-center gap-4">
            <FormControl>
                <Button asChild variant="outline" className="relative">
                    <div>
                        <Camera className="mr-2 h-4 w-4" />
                        <span>{file ? "Change" : "Upload"} Photo</span>
                        <Input
                            {...fieldProps}
                            value={''}
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(event) => {
                                onChange(event.target.files && event.target.files[0]);
                            }}
                        />
                    </div>
                </Button>
            </FormControl>
            {preview ? (
              <div className="relative w-20 h-20">
                <Image src={preview} alt="Container preview" layout="fill" objectFit="cover" className="rounded-md" />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setValue(`containers.${containerIndex}.imageFile`, undefined)}>
                    <Trash2 className="h-3 w-3"/>
                </Button>
              </div>
            ) : (
                <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-muted-foreground"/>
                </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type ShelfLocationSelectorProps = {
  control: Control<ReceiveFormValues>;
  containerIndex: number;
  allLocations: Location[];
  watchedContainers: Partial<ReceiveFormValues['containers']>;
  isLoading: boolean;
  boms: Bom[];
};

function ShelfLocationSelector({ control, containerIndex, allLocations, watchedContainers, isLoading, boms }: ShelfLocationSelectorProps) {
  const { getValues } = useFormContext<ReceiveFormValues>();

  const selectableShelves = useMemo(() => {
    // 1. Find all shelves occupied in the database
    const occupiedInDB = new Set<string>();
    boms.forEach(bom => {
      bom.items.forEach(item => {
        if (item.onHandQuantity > 0) {
          item.shelfLocations.forEach(loc => occupiedInDB.add(loc));
        }
      });
    });

    // 2. Find all shelves selected by OTHER containers in this form
    const selectedByOthers = new Set<string>(
      watchedContainers
        .filter((_, index) => index !== containerIndex)
        .map(c => c.shelfLocation)
        .filter((loc): loc is string => !!loc)
    );

    // 3. Create a Map to ensure uniqueness. Start with all locations.
    const locationMap = new Map<string, Location>();
    allLocations.forEach(loc => locationMap.set(loc.name, loc));

    // 4. Get the current selection for THIS dropdown
    const currentSelection = getValues(`containers.${containerIndex}.shelfLocation`);

    // 5. Build the final list of options
    const options: Location[] = [];
    for (const location of allLocations) {
      const isOccupied = occupiedInDB.has(location.name);
      const isSelectedByOther = selectedByOthers.has(location.name);

      // Add the location if it's the one currently selected for this dropdown,
      // OR if it's completely free.
      if (location.name === currentSelection || (!isOccupied && !isSelectedByOther)) {
        options.push(location);
      }
    }
    
    // 6. Sort and return
    return options.sort((a, b) => a.name.localeCompare(b.name));

  }, [allLocations, watchedContainers, containerIndex, boms, getValues]);

  return (
    <FormField
      control={control}
      name={`containers.${containerIndex}.shelfLocation`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Shelf Location</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Select an empty shelf"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {selectableShelves.map(location => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
              {selectableShelves.length === 0 && !field.value && (
                <div className="p-4 text-sm text-muted-foreground">No available shelves.</div>
              )}
            </SelectContent>
          </Select>
          <FormDescription>
            Only empty shelves that have not been chosen by another container are shown.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
