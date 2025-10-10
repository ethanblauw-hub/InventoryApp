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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from "firebase/firestore";
import { Category } from "@/lib/data";
import { BomForm, BomFormValues } from "./bom-form";

type BomType = "order" | "design";

export function BomImportDialog() {
  const [open, setOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bomType, setBomType] = useState<BomType>("order");
  const [parsedBom, setParsedBom] = useState<Partial<BomFormValues> | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'workCategories') : null),
    [firestore]
  );
  const { data: categories, isLoading: areCategoriesLoading } = useCollection<Category>(categoriesQuery);

  const processAndShowConfirm = (data: (string | number)[][]) => {
    if (!data || data.length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid File Format",
        description: "The file must contain a job info header, an item list header, and at least one item, separated by a blank line.",
      });
      return;
    }

    try {
      const blankRowIndex = data.findIndex(row => row.every(cell => cell === null || cell === '' || cell === undefined));
      
      if (blankRowIndex === -1) {
        throw new Error("Could not find a blank line separator between job info and item list.");
      }

      // --- PARSE JOB INFO ---
      const jobInfoRows = data.slice(0, blankRowIndex);
      if(jobInfoRows.length < 2) throw new Error("Job info section is incomplete.");
      const jobInfoHeader = jobInfoRows[0].map(h => h.toString());
      const jobInfoData = jobInfoRows[1];
      
      const getColumnValue = (colName: string) => {
        const index = jobInfoHeader.indexOf(colName);
        return index !== -1 ? jobInfoData[index]?.toString() : undefined;
      };

      const jobInfo: Partial<BomFormValues> = {
        jobNumber: getColumnValue("Job Number"),
        jobName: getColumnValue("Job Name"),
        projectManager: getColumnValue("PM"),
        primaryFieldLeader: getColumnValue("Primary Field Leader"),
        workCategoryId: getColumnValue("Category"),
      };

      // --- PARSE ITEM LIST ---
      const itemRows = data.slice(blankRowIndex + 1);
      if(itemRows.length < 2) throw new Error("Item list section is incomplete or missing.");
      const itemHeader = itemRows[0].map(h => h.toString());
      const itemDataRows = itemRows.slice(1);
      
      const partNumberIndex = itemHeader.indexOf("Part Number");
      const quantityIndex = itemHeader.indexOf("Quantity");

      if (partNumberIndex === -1 || quantityIndex === -1) {
        throw new Error("Item list must contain 'Part Number' and 'Quantity' headers.");
      }
      
      const bomItems = itemDataRows.map(row => {
        const description = row[partNumberIndex]?.toString() || "";
        const quantity = parseInt(row[quantityIndex]?.toString() || '0', 10);
        return { description, quantity };
      }).filter(item => item.description && item.quantity > 0);

      if (bomItems.length === 0) {
        throw new Error("No valid items found in the item list section of the file.");
      }

      setParsedBom({ ...jobInfo, items: bomItems });
      setIsConfirmOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Parsing Error",
        description: error.message || "Could not parse the file. Please check the format.",
      });
    }
  };

  const handleFinalSubmit = async (values: BomFormValues) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }

    const now = new Date().toISOString();

    try {
      const batch = writeBatch(firestore);
      const jobDocRef = doc(firestore, 'jobs', values.jobNumber);
      batch.set(jobDocRef, { id: values.jobNumber, name: values.jobName, description: `Job ${values.jobName}` }, { merge: true });

      const bomColRef = collection(jobDocRef, 'boms');
      const bomDocRef = doc(bomColRef);

      const newBomDocument = {
        ...values,
        id: bomDocRef.id,
        items: values.items.map(item => ({
          ...item,
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          onHandQuantity: 0,
          shippedQuantity: 0,
          shelfLocations: [],
          lastUpdated: now,
          imageId: '',
        })),
        type: bomType,
        uploadDate: now,
      };

      batch.set(bomDocRef, newBomDocument);
      await batch.commit();
      
      toast({
        title: "BOM Imported Successfully",
        description: `BOM for job ${values.jobName} has been created.`,
      });
      resetState();
    } catch (error: any) {
       console.error("Error writing document batch: ", error);
       toast({
         variant: "destructive",
         title: "Firestore Error",
         description: `Failed to save the BOM: ${error.message}`,
       });
    } finally {
        setIsConfirmOpen(false);
        setOpen(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedBom(null);
    setIsConfirmOpen(false);
    setOpen(false);
    const fileInput = document.getElementById("bom-file") as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }

  const handleImport = () => {
    if (!file) {
      toast({ variant: "destructive", title: "No file selected" });
      return;
    }

    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (e) => {
      const data = e.target?.result;
      try {
        let sheetData: (string | number)[][] = [];
        if (fileExtension === 'csv' && typeof data === 'string') {
          const parsed = Papa.parse<(string | number)[]>(data, { skipEmptyLines: false });
          sheetData = parsed.data;
        } else if ((fileExtension === 'xlsx' || fileExtension === 'xls') && data instanceof ArrayBuffer) {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: true });
        } else {
           throw new Error("Unsupported file type. Please use .csv, .xls, or .xlsx.");
        }
        processAndShowConfirm(sheetData);
      } catch (error: any) {
        console.error("Error parsing file:", error);
        toast({ variant: "destructive", title: "Parsing Failed", description: error.message });
      }
    };
    
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
    };
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'csv') {
        reader.readAsText(file);
    } else {
        toast({ variant: "destructive", title: "Unsupported File", description: "Please select a .csv, .xls, or .xlsx file." });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetState(); else setOpen(true); }}>
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
              <Input id="bom-file" type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
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
            <Button onClick={handleImport} disabled={!file || areCategoriesLoading}>
              {areCategoriesLoading ? "Loading..." : "Review & Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Review and Edit BOM Import</DialogTitle>
                <DialogDescription>
                    Review and edit the parsed data below before saving the new <strong>{bomType.toUpperCase()} BOM</strong>.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-auto pr-6">
              {parsedBom && !areCategoriesLoading && (
                  <BomForm 
                    onSubmit={handleFinalSubmit}
                    categories={categories || []}
                    defaultValues={parsedBom}
                    bomType={bomType}
                  />
              )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
