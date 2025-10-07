
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
import Link from 'next/link';

export default function NewLocationPage() {
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
                placeholder="e.g., Aisle A, Shelf 1 or C-03-B"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Create Shelf</Button>
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
              <Input id="shelf-file" type="file" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import File
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
