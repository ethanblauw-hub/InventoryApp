
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
import { Upload } from "lucide-react"
import { Bom } from "@/lib/data"

type UpdateBOMDialogProps = {
  bom: Bom;
}

export function UpdateBOMDialog({ bom }: UpdateBOMDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2" />
          Update BOM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Bill of Materials</DialogTitle>
          <DialogDescription>
            Select a new .csv or .xlsx file to update the BOM for {bom.jobName} ({bom.jobNumber}).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bom-file">File</Label>
            <Input id="bom-file" type="file" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
