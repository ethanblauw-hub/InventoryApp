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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { locations } from "@/lib/data"

export function AddItemDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Standalone Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Standalone Item</DialogTitle>
          <DialogDescription>
            Enter the details for a new inventory item that is not associated with a BOM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" placeholder="e.g., Welding Rods E7018" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU / Part Number</Label>
            <Input id="sku" placeholder="e.g., WELD-ROD-7018" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Initial Quantity</Label>
            <Input id="quantity" type="number" placeholder="100" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="location">Initial Location</Label>
            <Select>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
