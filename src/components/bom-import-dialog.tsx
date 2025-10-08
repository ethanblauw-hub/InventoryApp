
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Bom, BomItem } from "@/lib/data";

type BomType = "order" | "design";

// This is a simplified assumption. In a real app, you'd have a more robust way
// of getting job details, likely from another form or a selection.
type CsvRow = {
  'Part Number': string;
  'Order BOM Quantity': string;
  'Job Number': string;
  'Job Name': 'string';
  'Project Manager': string;
  'Field Leader': string;
  'Work Category ID': string;
}


export function BomImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bomType, setBomType] = useState<BomType>("order");
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({ variant: "destructive", title: "No file selected" });
      return;
    }
    if (!firestore) {
      toast({ variant: "destructive", title: "Database not available" });
      return;
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.data.length === 0) {
            toast({ variant: "destructive", title: "Empty File", description: "The selected CSV file is empty." });
            return;
          }

          const firstRow = results.data[0];
          
          // Assume the job info is the same for all rows in a single file upload
          const jobId = firstRow['Job Number']; 
          if (!jobId) {
             toast({ variant: "destructive", title: "Missing Job Info", description: "CSV must contain a 'Job Number' column." });
            return;
          }

          // Create a reference for a new BOM document in a 'boms' subcollection under the job
          const jobDocRef = doc(firestore, 'jobs', jobId);
          const bomsCollectionRef = collection(jobDocRef, 'boms');
          const newBomDocRef = doc(bomsCollectionRef);
          
          const bomItems: BomItem[] = results.data.map(row => ({
            id: doc(collection(firestore, 'temp')).id, // Temporary unique ID for the item
            description: row['Part Number'],
            orderBomQuantity: bomType === 'order' ? parseInt(row['Order BOM Quantity'], 10) || 0 : 0,
            designBomQuantity: bomType === 'design' ? parseInt(row['Order BOM Quantity'], 10) || 0 : 0,
            onHandQuantity: 0, // This would be looked up from inventory later
            shippedQuantity: 0,
            shelfLocations: [], // This would be looked up from inventory later
            lastUpdated: new Date().toISOString().split('T')[0], // Set current date
            imageId: '', // Default or lookup
          }));

          const newBomData: Partial<Bom> = {
            id: newBomDocRef.id,
            jobNumber: jobId,
            jobName: firstRow['Job Name'],
            projectManager: firstRow['Project Manager'],
            primaryFieldLeader: firstRow['Field Leader'],
            workCategoryId: firstRow['Work Category ID'],
            items: bomItems,
          };
          
          await setDoc(newBomDocRef, newBomData);

          console.log("New BOM Document:", newBomData);

          toast({
            title: "Import Successful",
            description: `Created BOM ${newBomDocRef.id} with ${results.data.length} items.`,
          });
          
          setFile(null);
          setOpen(false);

        } catch (error: any) {
           console.error("Error processing BOM:", error);
           toast({
             variant: "destructive",
             title: "Import Failed",
             description: error.message || "An unknown error occurred.",
           });
        }
      },
      error: (error: any) => {
        console.error("Error parsing CSV:", error);
        toast({
          variant: "destructive",
          title: "Parsing Failed",
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2" />
          Import BOM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Bill of Materials</DialogTitle>
          <DialogDescription>
            Select a .csv or .xlsx file to import. Specify if it's an Order BOM or Design BOM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bom-file">File</Label>
            <Input id="bom-file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label>BOM Type</Label>
            <RadioGroup defaultValue={bomType} onValueChange={(value: BomType) => setBomType(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="order" id="r1" />
                <Label htmlFor="r1">Order BOM (Estimate)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="design" id="r2" />
                <Label htmlFor="r2">Design BOM (Actual)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
