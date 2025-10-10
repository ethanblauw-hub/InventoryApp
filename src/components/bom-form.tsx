"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";

const bomItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number."),
  // Keep other BomItem fields for editing
  orderBomQuantity: z.number().optional(),
  designBomQuantity: z.number().optional(),
  onHandQuantity: z.number().optional(),
  shippedQuantity: z.number().optional(),
  shelfLocations: z.array(z.string()).optional(),
  lastUpdated: z.string().optional(),
  imageId: z.string().optional(),
});

const bomFormSchema = z.object({
  jobNumber: z.string().min(1, "Job Number is required."),
  jobName: z.string().min(1, "Job Name is required."),
  projectManager: z.string().min(1, "Project Manager is required."),
  primaryFieldLeader: z.string().min(1, "Field Leader is required."),
  workCategoryId: z.string().min(1, "Work Category is required."),
  items: z.array(bomItemSchema).min(1, "At least one item is required."),
});

export type BomFormValues = z.infer<typeof bomFormSchema>;

type BomFormProps = {
  onSubmit: (values: BomFormValues) => void;
  categories: Category[];
  defaultValues?: Partial<BomFormValues>;
  bomType: "order" | "design";
};

export function BomForm({
  onSubmit,
  categories,
  defaultValues,
  bomType,
}: BomFormProps) {
  const form = useForm<BomFormValues>({
    resolver: zodResolver(bomFormSchema),
    defaultValues: defaultValues || { items: [{ description: "", quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleFormSubmit = (values: BomFormValues) => {
    // Before submitting, map the general 'quantity' back to the correct BOM type quantity
    const processedValues = {
        ...values,
        items: values.items.map(item => ({
            ...item,
            orderBomQuantity: bomType === 'order' ? item.quantity : (item.orderBomQuantity || 0),
            designBomQuantity: bomType === 'design' ? item.quantity : (item.designBomQuantity || 0),
        }))
    };
    onSubmit(processedValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jobNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectManager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Manager</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="primaryFieldLeader"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Field Leader</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: 1 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          {form.formState.errors.items && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.items.message}
            </p>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_100px_auto] gap-2 font-medium text-sm text-muted-foreground px-2">
                <div>Description/Part Number</div>
                <div className="text-right">Quantity</div>
                <div></div>
            </div>
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_100px_auto] gap-2 items-start"
              >
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" {...field} className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit">Save BOM</Button>
        </div>
      </form>
    </Form>
  );
}
