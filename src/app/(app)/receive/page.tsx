
"use client";

import { useState } from 'react';
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
import { useForm, useFieldArray, Controller, Control } from 'react-hook-form';
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
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, collectionGroup, query } from 'firebase/firestore';
import { Bom, Category, Location } from '@/lib/data';

/**
 * Zod schema for validating a single item within a container.
 */
const itemSchema = z.object({
  description: z.string().min(1, "Item description is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

/**
 * Zod schema for validating a single container.
 */
const containerSchema = z.object({
  type: z.string().min(1, "Container type is required."),
  items: z.array(itemSchema).min(1, "At least one item is required per container."),
  shelfLocation: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Zod schema for the main receiving form.
 */
const formSchema = z.object({
  jobNumber: z.string().optional(),
  workCategory: z.string().optional(),
  containers: z.array(containerSchema).min(1, "At least one container is required."),
});

/**
 * Type definition for the form values, inferred from the Zod schema.
 */
type ReceiveFormValues = z.infer<typeof formSchema>;

/**
 * A page component for receiving new materials and storing them.
 * It features a dynamic form that allows users to log one or more containers,
 * add multiple items to each container, associate them with a job, and assign them
 * to a shelf location.
 *
 * @returns {JSX.Element} The rendered receive/store page.
 */
export default function ReceiveStorePage() {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
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
      containers: [],
    },
  });

  const { fields: containerFields, append: appendContainer, remove: removeContainer } = useFieldArray({
    control: form.control,
    name: "containers",
  });

  /**
   * Handles the form submission. Logs the form data and displays a success toast.
   * @param {ReceiveFormValues} values - The validated form data.
   */
  function onSubmit(values: ReceiveFormValues) {
    console.log(values);
    toast({
      title: "Submission Successful",
      description: `Logged ${values.containers.length} container(s).`,
    });
    form.reset();
  }

  /**
   * Generates a QR code and displays it in a dialog.
   * @param {string} data - The data to encode in the QR code.
   */
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
                      Search by job name or number. Selecting a job will auto-fill the work category.
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
                     <Select onValueChange={field.onChange} value={field.value}>
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
                    <ItemArray control={form.control} containerIndex={containerIndex} />

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
                                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
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
          
          <Button type="submit" disabled={containerFields.length === 0}>Submit</Button>
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

/**
 * Props for the ItemArray component.
 * @property {number} containerIndex - The index of the parent container in the form.
 * @property {Control<ReceiveFormValues>} control - The React Hook Form control object.
 */
type ItemArrayProps = {
  containerIndex: number;
  control: Control<ReceiveFormValues>;
};

/**
 * A component that manages a dynamic array of item input fields for a single container.
 * It allows users to add or remove items from the container they are logging.
 *
 * @param {ItemArrayProps} props - The props for the component.
 * @returns {JSX.Element} The rendered item array section.
 */
function ItemArray({ containerIndex, control }: ItemArrayProps) {
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
                <FormItem>
                    <FormLabel className={cn(itemIndex !== 0 && "sr-only")}>Description/Part Number</FormLabel>
                    <FormControl>
                        <Input placeholder="Item description or part number" {...field} />
                    </FormControl>
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
                        <Input type="number" placeholder="1" {...field} className="w-24"/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className={cn("flex items-end h-full", itemIndex !== 0 && "sm:pt-8")}>
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(itemIndex)}
                    disabled={fields.length <= 1}
                >
                    <Trash2 className="h-4 w-4" />
                     <span className="sr-only">Remove Item</span>
                </Button>
            </div>
        </div>
      ))}
    </div>
  )
}
