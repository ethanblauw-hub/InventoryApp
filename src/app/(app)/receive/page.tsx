
"use client";

import { PageHeader } from '@/components/page-header';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { boms, items, locations, categories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, Printer, Package, Box, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const itemSchema = z.object({
  description: z.string().min(1, "Item description is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const containerSchema = z.object({
  type: z.string().min(1, "Container type is required."),
  items: z.array(itemSchema).min(1, "At least one item is required per container."),
  shelfLocation: z.string().optional(),
  notes: z.string().optional(),
});

const formSchema = z.object({
  jobNumber: z.string().optional(),
  itemCategory: z.string().optional(),
  containers: z.array(containerSchema).min(1, "At least one container is required."),
});

type ReceiveFormValues = z.infer<typeof formSchema>;

export default function ReceiveStorePage() {
  const { toast } = useToast();
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

  function onSubmit(values: ReceiveFormValues) {
    console.log(values);
    toast({
      title: "Submission Successful",
      description: `Logged ${values.containers.length} container(s).`,
    });
    form.reset();
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
                            {field.value
                              ? boms.find(
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
                            {boms.map((bom) => (
                              <CommandItem
                                value={`${bom.jobName} ${bom.jobNumber}`}
                                key={bom.id}
                                onSelect={() => {
                                  form.setValue("jobNumber", bom.jobNumber);
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
                      Search by job name or number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Category</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
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
                                    <SelectValue placeholder="Select a destination location" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {locations.map(location => (
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
                            <Button type="button" variant="secondary">
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
    </div>
  );
}


function ItemArray({ containerIndex, control }: { containerIndex: number, control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `containers.${containerIndex}.items`
  });
  
  const { formState: { errors } } = useForm({control});
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

    