
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirestore } from "@/firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required."),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (!firestore) return;
    try {
      const categoriesRef = collection(firestore, "workCategories");
      const newDocRef = doc(categoriesRef);
      setDocumentNonBlocking(newDocRef, { ...values, id: newDocRef.id }, {});
      
      toast({
        title: "Category Created",
        description: `Successfully created the "${values.name}" category.`,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create category. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize items.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="A brief description of the category."
                      className="col-span-3"
                    />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Category</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
