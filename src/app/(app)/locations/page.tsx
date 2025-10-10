
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, PlusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import { Bom, Location, BomItem } from '@/lib/data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

/**
 * Defines the columns that can be used for sorting the locations table.
 */
type SortableColumn = 
  | 'location' 
  | 'location_section'
  | 'location_bay'
  | 'location_shelf'
  | 'jobNumber' 
  | 'jobName' 
  | 'projectManager' 
  | 'primaryFieldLeader' 
  | 'description' 
  | 'onHandQuantity' 
  | 'lastUpdated';

/**
 * Defines the possible sort directions.
 */
type SortDirection = 'asc' | 'desc';

type DisplayItem = {
  location: string;
} & Partial<BomItem & {
    bomId: string;
    jobNumber: string;
    jobName: string;
    projectManager: string;
    primaryFieldLeader: string;
}>;


/**
 * A page component that displays a detailed inventory list organized by shelf location.
 * It allows users to see which items are on which shelves, search the inventory, filter by their jobs,
 * and sort the data. Administrators can also see shelf occupancy statistics and navigate to add new shelves.
 *
 * @returns {JSX.Element} The rendered locations page.
 */
export default function LocationsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [showMyJobsOnly, setShowMyJobsOnly] = useState(false);
  const [showEmptyShelves, setShowEmptyShelves] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortableColumn>('location');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    // If the search param changes, update the state
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const locationsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shelfLocations') : null),
    [firestore]
  );
  const { data: shelfLocations, isLoading: areLocationsLoading } = useCollection<Location>(locationsQuery);

  const bomsQuery = useMemoFirebase(
    () => (firestore ? query(collectionGroup(firestore, 'boms')) : null),
    [firestore]
  );
  const { data: boms, isLoading: areBomsLoading } = useCollection<Bom>(bomsQuery);


  const allBomItems = boms?.flatMap(bom =>
    bom.items.map(item => ({
      ...item,
      bomId: bom.id,
      jobNumber: bom.jobNumber,
      jobName: bom.jobName,
      projectManager: bom.projectManager,
      primaryFieldLeader: bom.primaryFieldLeader,
    }))
  ) || [];
  
  const allShelfLocationNames = useMemo(() => {
    return shelfLocations?.map(l => l.name).sort((a, b) => a.localeCompare(b)) || [];
  }, [shelfLocations]);

  const occupiedShelfLocations = useMemo(() => {
    const occupied = new Set<string>();
    allBomItems.forEach(item => {
        // A shelf is considered occupied if there is any item with a positive on-hand quantity.
        if (item.onHandQuantity > 0) {
            item.shelfLocations.forEach(loc => occupied.add(loc));
        }
    });
    return occupied;
  }, [allBomItems]);

  const occupancyPercentage = allShelfLocationNames.length > 0 
    ? (occupiedShelfLocations.size / allShelfLocationNames.length) * 100 
    : 0;

  const locationItems: DisplayItem[] = allBomItems.flatMap(item =>
    item.shelfLocations.map(location => ({
      location,
      ...item
    }))
  );

  const allDisplayItems = useMemo(() => {
    const items = new Map<string, DisplayItem[]>();
    for (const item of locationItems) {
      if (!items.has(item.location)) {
        items.set(item.location, []);
      }
      items.get(item.location)!.push(item);
    }
    
    const result: DisplayItem[] = [];
    if (showEmptyShelves) {
      allShelfLocationNames.forEach(name => {
        const shelfItems = items.get(name);
        if (shelfItems) {
          result.push(...shelfItems);
        } else {
          result.push({ location: name });
        }
      });
    } else {
      result.push(...locationItems);
    }
    return result;
  }, [locationItems, showEmptyShelves, allShelfLocationNames]);
  
  
  /**
   * Handles sorting of the table columns. Toggles direction if the same column is clicked,
   * otherwise sets the new column and defaults to ascending order.
   * @param {SortableColumn} column - The column to sort by.
   */
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredItems = allDisplayItems.filter(item => {
    if (showMyJobsOnly && currentUser?.displayName && item.jobNumber) {
       if (item.projectManager !== currentUser.displayName && item.primaryFieldLeader !== currentUser.displayName) {
        return false;
      }
    }

    const searchTerm = search.toLowerCase();
    if (!searchTerm) return true;

    return (
      item.location.toLowerCase().includes(searchTerm) ||
      (item.jobNumber && item.jobNumber.toLowerCase().includes(searchTerm)) ||
      (item.jobName && item.jobName.toLowerCase().includes(searchTerm)) ||
      (item.projectManager && item.projectManager.toLowerCase().includes(searchTerm)) ||
      (item.primaryFieldLeader && item.primaryFieldLeader.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.lastUpdated && item.lastUpdated.toString().toLowerCase().includes(searchTerm))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const getPart = (location: string, part: 'section' | 'bay' | 'shelf') => {
      const parts = location.split('.');
      if (parts.length !== 3) return '';
      if (part === 'section') return parts[0];
      if (part === 'bay') return parts[1];
      if (part === 'shelf') return parts[2];
      return '';
    };

    let aValue, bValue;

    switch (sortColumn) {
      case 'location_section':
        aValue = getPart(a.location, 'section');
        bValue = getPart(b.location, 'section');
        break;
      case 'location_bay':
        aValue = getPart(a.location, 'bay');
        bValue = getPart(b.location, 'bay');
        break;
      case 'location_shelf':
        aValue = getPart(a.location, 'shelf');
        bValue = getPart(b.location, 'shelf');
        break;
      default:
        aValue = a[sortColumn] || '';
        bValue = b[sortColumn] || '';
    }
    
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
    } else if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    // Secondary sort: if primary is equal, sort by location, then job number
    if (comparison === 0) {
      comparison = a.location.localeCompare(b.location);
      if (comparison === 0 && a.jobNumber && b.jobNumber) {
        comparison = a.jobNumber.localeCompare(b.jobNumber);
      }
    }

    return sortDirection === 'asc' ? comparison : comparison * -1;
  });

  const isLoading = areBomsLoading || areLocationsLoading;
  const isAdmin = true; // Replace with actual admin check logic

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelf Locations"
        description="A detailed inventory list by location."
      >
        {isAdmin && (
          <Button asChild>
            <Link href="/locations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add/Import Shelves
            </Link>
          </Button>
        )}
      </PageHeader>

      {isAdmin && (
         <Card>
           <CardHeader>
             <CardTitle>Shelf Occupancy</CardTitle>
           </CardHeader>
           <CardContent>
            {isLoading ? <p>Calculating occupancy...</p> : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-2">
                      <Progress value={occupancyPercentage} />
                      <p className="text-sm text-muted-foreground">
                        {occupiedShelfLocations.size} of {allShelfLocationNames.length} shelf locations are occupied.
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{occupancyPercentage.toFixed(1)}% Occupied</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
           </CardContent>
         </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Item Locations</CardTitle>
           <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
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
            <div className="flex items-center space-x-2">
              <Checkbox id="empty-shelves-filter" checked={showEmptyShelves} onCheckedChange={(checked) => setShowEmptyShelves(!!checked)} />
              <Label htmlFor="empty-shelves-filter" className="cursor-pointer">
                Show empty shelves
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="px-1">
                          Shelf Location
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('location')}>
                          Sort A-Z
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSortColumn('location');
                          setSortDirection('desc');
                        }}>
                          Sort Z-A
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSort('location_section')}>
                          Sort by Section (Aisle)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('location_bay')}>
                          Sort by Bay (Number)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('location_shelf')}>
                          Sort by Shelf (Letter)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">Loading item locations...</TableCell>
                  </TableRow>
                )}
                {!isLoading && sortedItems.map((item, index) => (
                  <TableRow key={`${item.id || 'empty'}-${item.location}-${index}`}>
                    <TableCell>
                      <Badge variant="secondary">{item.location}</Badge>
                    </TableCell>
                    {item.id ? (
                      <>
                        <TableCell className="font-medium">{item.jobNumber}</TableCell>
                        <TableCell>{item.jobName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.projectManager}</TableCell>
                        <TableCell className="text-muted-foreground">{item.primaryFieldLeader}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right font-mono">{item.onHandQuantity?.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(item.lastUpdated!).toLocaleDateString()}</TableCell>
                      </>
                    ) : (
                       <TableCell colSpan={7} className="text-center text-muted-foreground">
                         Shelf is empty
                       </TableCell>
                    )}
                  </TableRow>
                ))}
                 {!isLoading && sortedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No items found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
