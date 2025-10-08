
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

type BomType = "order" | "design";

export function BomImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [bomType, setBomType] = useState<BomType>("order");
  const { toast } = useToast();

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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsed CSV Data:", results.data);
        toast({
          title: "Import Successful",
          description: `Parsed ${results.data.length} records. Check the console for details.`,
        });
        setFile(null);
        setOpen(false);
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
