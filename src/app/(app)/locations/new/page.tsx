
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCog, Upload } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Papa from 'papaparse';

/**
 * A page component for adding new shelf locations.
 * It provides two methods for creating locations: creating a single shelf
 * manually or importing a list of shelves from a CSV file. This page is
 * intended for administrative use.
 *
 * @returns {JSX.Element} The rendered new location page.
 */
export default function NewLocationPage() {
  const [shelfName, setShelfName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleCreateSingle = async () => {
    if (!shelfName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Shelf name cannot be empty.',
      });
      return;
    }
    if (!firestore) return;

    setIsCreating(true);
    try {
      const locationRef = doc(collection(firestore, 'shelfLocations'));
      // Using setDocumentNonBlocking as per project pattern
      setDocumentNonBlocking(locationRef, {
        id: locationRef.id,
        name: shelfName.trim(),
        items: [],
      }, { merge: false });

      toast({
        title: 'Shelf Creation Initiated',
        description: `Shelf "${shelfName.trim()}" is being created.`,
      });
      setShelfName('');
    } catch (error) {
      // This catch is for synchronous errors, async errors are handled in non-blocking-updates
      console.error('Error creating shelf:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not start shelf creation process.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportFile = () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'No file selected.' });
      return;
    }
    if (!firestore) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
        const csvData = event.target?.result as string;

        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const rows = results.data as { name?: string }[];
              if (!results.meta.fields?.includes('name')) {
                throw new Error("CSV must have a 'name' column header.");
              }
    
              const validLocations = rows
                .map((row) => row.name?.trim())
                .filter((name): name is string => !!name);
                
              if (validLocations.length === 0) {
                throw new Error("No valid shelf names found in the file.");
              }
    
              const batch = writeBatch(firestore);
              validLocations.forEach((locationName) => {
                const docRef = doc(collection(firestore, 'shelfLocations'));
                batch.set(docRef, { id: docRef.id, name: locationName, items: [] });
              });
    
              await batch.commit();
    
              toast({
                title: 'Import Successful',
                description: `Successfully imported ${validLocations.length} shelf locations.`,
              });
              setFile(null);
              // Reset file input
              const fileInput = document.getElementById('shelf-file') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
    
            } catch (error: any) {
              console.error('Error importing shelves:', error);
              toast({
                variant: 'destructive',
                title: 'Import Failed',
                description: error.message || 'Could not import shelves.',
              });
            } finally {
              setIsImporting(false);
            }
          },
          error: (error: any) => {
            toast({
              variant: 'destructive',
              title: 'Parsing Error',
              description: error.message,
            });
            setIsImporting(false);
          },
        });
    };

    reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "The selected file could not be read.",
        });
        setIsImporting(false);
    };

    reader.readAsText(file);
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Add/Import Shelves"
        description="Create new shelf locations individually or import a list."
      />

       <Alert>
        <UserCog className="h-4 w-4" />
        <AlertTitle>Admin Access</AlertTitle>
        <AlertDescription>
          Managing shelf locations is restricted to administrators.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Single Shelf</CardTitle>
            <CardDescription>
              Enter the details for a new shelf location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shelf-name">Shelf Name / Code</Label>
              <Input
                id="shelf-name"
                placeholder="e.g., A.00.A"
                value={shelfName}
                onChange={(e) => setShelfName(e.target.value)}
                disabled={isCreating}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateSingle} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Shelf'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Shelves from File</CardTitle>
            <CardDescription>
              Upload a .csv file with a list of shelf names. The file should
              contain a single column with the header "name".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="shelf-file">File</Label>
              <Input id="shelf-file" type="file" accept=".csv" onChange={handleFileChange} disabled={isImporting}/>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleImportFile} disabled={isImporting || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import File'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
