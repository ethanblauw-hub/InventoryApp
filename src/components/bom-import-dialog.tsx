"use client"
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

export function BomImportDialog() {
  return (
    <Dialog>
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
            <Input id="bom-file" type="file" />
          </div>
          <div className="space-y-2">
            <Label>BOM Type</Label>
            <RadioGroup defaultValue="order" className="flex gap-4">
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
          <Button type="submit">Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
