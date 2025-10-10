"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Bom, Category } from "@/lib/data";
import { Edit } from "lucide-react";
import { BomForm } from "./bom-form";
import { collection, doc, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { BomFormValues } from "./bom-form";

type EditBOMDialogProps = {
  bom: Bom;
};

export function EditBOMDialog({ bom }: EditBOMDialogProps) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Category>(categoriesQuery);

  const handleUpdate = async (values: BomFormValues) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }

    try {
      const batch = writeBatch(firestore);
      const jobDocRef = doc(firestore, 'jobs', values.jobNumber);
      const bomDocRef = doc(jobDocRef, 'boms', bom.id);
      
      const now = new Date().toISOString();
      const updatedBom = {
        ...bom, // retain original id, uploadDate etc.
        ...values, // apply form values
        items: values.items.map(item => ({
          ...item,
          // If it's a new item, generate an ID and other fields
          id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
          lastUpdated: now,
          onHandQuantity: item.onHandQuantity || 0,
          shippedQuantity: item.shippedQuantity || 0,
          shelfLocations: item.shelfLocations || [],
          imageId: item.imageId || ''
        })),
      };
      
      batch.set(bomDocRef, updatedBom, { merge: true });
      await batch.commit();

      toast({
        title: "BOM Updated",
        description: `BOM for job ${values.jobName} has been successfully updated.`,
      });
      setOpen(false);

    } catch (error: any) {
      console.error("Error updating BOM:", error);
      toast({
        variant: "destructive",
        title: "Update Error",
        description: `Failed to update BOM: ${error.message}`,
      });
    }
  };

  const defaultValues: Partial<BomFormValues> = {
    jobNumber: bom.jobNumber,
    jobName: bom.jobName,
    projectManager: bom.projectManager,
    primaryFieldLeader: bom.primaryFieldLeader,
    workCategoryId: bom.workCategoryId,
    items: bom.items.map(item => ({
      ...item,
      quantity: bom.type === 'design' ? item.designBomQuantity : item.orderBomQuantity,
    }))
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Edit className="mr-2" />
          Edit BOM
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Bill of Materials</DialogTitle>
          <DialogDescription>
            Modify the details for {bom.jobName} ({bom.jobNumber}).
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-auto pr-6">
          {areCategoriesLoading ? (
            <p>Loading form...</p>
          ) : (
            <BomForm
              onSubmit={handleUpdate}
              categories={categories || []}
              defaultValues={defaultValues}
              bomType={bom.type}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
