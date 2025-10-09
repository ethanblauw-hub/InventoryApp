
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

type BomType = "order" | "design";
type ParsedBomItem = {
  description: string;
  quantity: number;
};
type ParsedBom = {
  jobInfo: {
    jobNumber: string;
    jobName: string;
    projectManager: string;
    primaryFieldLeader: string;
    workCategoryId: string;
  };
  items: ParsedBomItem[];
};

export function BomImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bomType, setBomType] = useState<BomType>("order");
  const [parsedBom, setParsedBom] = useState<ParsedBom | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setParsedBom(null); // Reset parsed data when file changes
    }
  };

  const processAndShowConfirm = (parsedRows: any[]) => {
    if (!parsedRows || parsedRows.length === 0) {
      toast({
        variant: "destructive",
        title: "Parsing Error",
        description: "The file is empty or could not be read.",
      });
      return;
    }
    
    // Assuming the first row has all the necessary job info
    const firstRow = parsedRows[0];
    const jobInfo = {
      jobNumber: firstRow["Job Number"] || "N/A",
      jobName: firstRow["Job Name"] || "N/A",
      projectManager: firstRow["PM"] || "N/A",
      primaryFieldLeader: firstRow["Primary Field Leader"] || "N/A",
      // Default to a general category if not specified in the file
      workCategoryId: firstRow["Category"] || "cat-3",
    };

    const bomItems: ParsedBomItem[] = parsedRows.map(row => ({
      // Adjust key to "Description/Part Number" or a more generic key
      description: row["Description/Part Number"] || row["Part Number"] || "Unknown Item",
      quantity: parseInt(row["Quantity"], 10) || 0,
    })).filter(item => item.quantity > 0);

    if (bomItems.length === 0) {
        toast({
            variant: "destructive",
            title: "No Items Found",
            description: "No items with valid quantities were found in the file."
        });
        return;
    }

    setParsedBom({ jobInfo, items: bomItems });
    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!parsedBom || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "No BOM data to submit." });
      return;
    }

    const { jobInfo, items } = parsedBom;
    const now = new Date().toISOString(); // Generate a client-side timestamp as an ISO string

    const bomItemsForFirestore = items.map(item => ({
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      description: item.description,
      orderBomQuantity: bomType === 'order' ? item.quantity : 0,
      designBomQuantity: bomType === 'design' ? item.quantity : 0,
      onHandQuantity: 0,
      shippedQuantity: 0,
      shelfLocations: [],
      lastUpdated: now, // Use the client-side timestamp string
      imageId: '',
    }));

    try {
      const jobDocRef = doc(firestore, 'jobs', jobInfo.jobNumber);
      const bomColRef = collection(jobDocRef, 'boms');
      const bomDocRef = doc(bomColRef); // Creates a ref with a new auto-generated ID

      const newBomDocument = {
        id: bomDocRef.id,
        ...jobInfo,
        items: bomItemsForFirestore,
        type: bomType,
        uploadDate: now,
      };

      await setDoc(bomDocRef, newBomDocument);
      
      toast({
        title: "BOM Imported Successfully",
        description: `BOM for job ${jobInfo.jobName} has been created.`,
      });
    } catch (error) {
       console.error("Error writing document: ", error);
       toast({
         variant: "destructive",
         title: "Firestore Error",
         description: "Failed to save the BOM. See console for details.",
       });
    } finally {
        // Reset state after submission
        setIsConfirmOpen(false);
        setParsedBom(null);
        setFile(null);
        setOpen(false);
    }
  };

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
        let parsedRows: any[] = [];
        if (fileExtension === 'csv' && typeof data === 'string') {
          Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              processAndShowConfirm(results.data);
            },
            error: (error: any) => {
              toast({ variant: "destructive", title: "CSV Parsing Failed", description: error.message });
            },
          });
          return; // PapaParse is async, so we return here
        } else if (fileExtension === 'xlsx' && data instanceof ArrayBuffer) {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedRows = XLSX.utils.sheet_to_json(worksheet);
        } else {
           throw new Error("Unsupported file type. Please use .csv or .xlsx.");
        }
        processAndShowConfirm(parsedRows);
      } catch (error: any) {
        console.error("Error parsing file:", error);
        toast({
            variant: "destructive",
            title: "Parsing Failed",
            description: error.message,
        });
      }
    };
    
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
    };
    
    if (fileExtension === 'xlsx') {
        reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'csv') {
        reader.readAsText(file);
    } else {
        toast({ variant: "destructive", title: "Unsupported File", description: "Please select a .csv or .xlsx file." });
    }
  };

  return (
    <>
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
              <Input id="bom-file" type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
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
            <Button onClick={handleImport} disabled={!file}>Review &amp; Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {parsedBom && (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent className="max-w-3xl">
                 <AlertDialogHeader>
                    <AlertDialogTitle>Confirm BOM Import</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review the details for the new <strong>{bomType.toUpperCase()} BOM</strong> for job <strong>{parsedBom.jobInfo.jobName} ({parsedBom.jobInfo.jobNumber})</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4 max-h-80 overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Description</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parsedBom.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right font-mono">{item.quantity.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

    