
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { Container, Location } from "@/lib/data";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";

type MoveContainerDialogProps = {
  container: Container;
  allLocations: Location[];
};

export function MoveContainerDialog({ container, allLocations }: MoveContainerDialogProps) {
  const [open, setOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleMove = async () => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      return;
    }
    if (!newLocation) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select a new location." });
      return;
    }
    
    setIsMoving(true);
    try {
      const containerRef = doc(firestore, 'containers', container.id);
      await updateDoc(containerRef, {
        shelfLocation: newLocation,
      });

      toast({
        title: "Container Moved",
        description: `Container has been moved to ${newLocation}.`,
      });
      setOpen(false);

    } catch (error: any) {
      console.error("Error moving container:", error);
      toast({
        variant: "destructive",
        title: "Move Failed",
        description: `Failed to move container: ${error.message}`,
      });
    } finally {
        setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Move</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Container</DialogTitle>
          <DialogDescription>
            Select a new shelf location for this container.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from-location" className="text-right">
              From Shelf
            </Label>
            <Input
              id="from-location"
              value={container.shelfLocation || "Not Shelved"}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to-location" className="text-right">
              To Shelf
            </Label>
            <Select onValueChange={setNewLocation}>
              <SelectTrigger id="to-location" className="col-span-3">
                <SelectValue placeholder="Select a new location" />
              </SelectTrigger>
              <SelectContent>
                {allLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.name}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? 'Moving...' : 'Move Container'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
