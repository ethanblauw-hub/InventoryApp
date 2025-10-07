
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { boms } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, PlusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type SortableColumn = 
  | 'location' 
  | 'jobNumber' 
  | 'jobName' 
  | 'projectManager' 
  | 'primaryFieldLeader' 
  | 'description' 
  | 'onHandQuantity' 
  | 'lastUpdated';

type SortDirection = 'asc' | 'desc';

// Mock current user - this would be replaced with actual user data from an auth system
const currentUser = {
  name: 'Alice Johnson',
  isAdmin: true, // This would come from your auth system
};


export default function LocationsPage() {
  const [search, setSearch] = useState('');
  const [showMyJobsOnly, setShowMyJobsOnly] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortableColumn>('location');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const allBomItems = boms.flatMap(bom =>
    bom.items.map(item => ({
      ...item,
      bomId: bom.id,
      jobNumber: bom.jobNumber,
      jobName: bom.jobName,
      projectManager: bom.projectManager,
      primaryFieldLeader: bom.primaryFieldLeader,
    }))
  );

  const locationItems = allBomItems.flatMap(item =>
    item.shelfLocations.map(location => ({
      location,
      ...item
    }))
  );
  
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredItems = locationItems.filter(item => {
    if (showMyJobsOnly) {
       if (item.projectManager !== currentUser.name && item.primaryFieldLeader !== currentUser.name) {
        return false;
      }
    }

    const searchTerm = search.toLowerCase();
    if (!searchTerm) return true;

    return (
      item.location.toLowerCase().includes(searchTerm) ||
      item.jobNumber.toLowerCase().includes(searchTerm) ||
      item.jobName.toLowerCase().includes(searchTerm) ||
      item.projectManager.toLowerCase().includes(searchTerm) ||
      item.primaryFieldLeader.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.lastUpdated.toLowerCase().includes(searchTerm)
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    // Secondary sort: if primary is equal, sort by location, then job number
    if (comparison === 0) {
      if (a.location < b.location) comparison = -1;
      else if (a.location > b.location) comparison = 1;
      else if (a.jobNumber < b.jobNumber) comparison = -1;
      else if (a.jobNumber > b.jobNumber) comparison = 1;
    }

    return sortDirection === 'asc' ? comparison : comparison * -1;
  });


  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelf Locations"
        description="A detailed inventory list by location."
      >
        {currentUser.isAdmin && (
          <Button asChild>
            <Link href="/locations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add/Import Shelves
            </Link>
          </Button>
        )}
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Item Locations</CardTitle>
           <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input 
              placeholder="Search locations, jobs, items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2">
              <Checkbox id="my-jobs-filter" checked={showMyJobsOnly} onCheckedChange={(checked) => setShowMyJobsOnly(!!checked)} />
              <Label htmlFor="my-jobs-filter" className="cursor-pointer">
                Only show materials for my jobs
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('location')} className="px-1">
                      Shelf Location
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('jobNumber')} className="px-1">
                      Job Number
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('jobName')} className="px-1">
                      Job Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('projectManager')} className="px-1">
                      PM Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('primaryFieldLeader')} className="px-1">
                      Field Leader
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('description')} className="px-1">
                      Item Description
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('onHandQuantity')} className="px-1">
                      On-Hand Qty
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('lastUpdated')} className="px-1">
                      Last Updated
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map(item => (
                  <TableRow key={`${item.id}-${item.location}`}>
                    <TableCell>
                      <Badge variant="secondary">{item.location}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.jobNumber}</TableCell>
                    <TableCell>{item.jobName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.projectManager}</TableCell>
                    <TableCell className="text-muted-foreground">{item.primaryFieldLeader}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right font-mono">{item.onHandQuantity.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
