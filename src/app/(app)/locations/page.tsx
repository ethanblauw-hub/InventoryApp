"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { boms } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type FilterState = {
  location: string;
  jobNumber: string;
  jobName: string;
  pmName: string;
  fieldLeader: string;
  description: string;
  quantity: string;
  lastUpdated: string;
};

export default function LocationsPage() {
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    jobNumber: '',
    jobName: '',
    pmName: '',
    fieldLeader: '',
    description: '',
    quantity: '',
    lastUpdated: '',
  });

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
  ).sort((a, b) => {
    if (a.location < b.location) return -1;
    if (a.location > b.location) return 1;
    if (a.jobNumber < b.jobNumber) return -1;
    if (a.jobNumber > b.jobNumber) return 1;
    return 0;
  });
  
  const handleFilterChange = (column: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredItems = locationItems.filter(item => {
    return (
      item.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      item.jobNumber.toLowerCase().includes(filters.jobNumber.toLowerCase()) &&
      item.jobName.toLowerCase().includes(filters.jobName.toLowerCase()) &&
      item.projectManager.toLowerCase().includes(filters.pmName.toLowerCase()) &&
      item.primaryFieldLeader.toLowerCase().includes(filters.fieldLeader.toLowerCase()) &&
      item.description.toLowerCase().includes(filters.description.toLowerCase()) &&
      item.onHandQuantity.toString().includes(filters.quantity) &&
      item.lastUpdated.toLowerCase().includes(filters.lastUpdated.toLowerCase())
    );
  });


  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelf Locations"
        description="A detailed inventory list by location."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Item Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Shelf Location
                     <Input
                        placeholder="Filter..."
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead>
                    Job Number
                    <Input
                        placeholder="Filter..."
                        value={filters.jobNumber}
                        onChange={(e) => handleFilterChange('jobNumber', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead>
                    Job Name
                     <Input
                        placeholder="Filter..."
                        value={filters.jobName}
                        onChange={(e) => handleFilterChange('jobName', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead>
                    PM Name
                     <Input
                        placeholder="Filter..."
                        value={filters.pmName}
                        onChange={(e) => handleFilterChange('pmName', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead>
                    Primary Field Leader
                     <Input
                        placeholder="Filter..."
                        value={filters.fieldLeader}
                        onChange={(e) => handleFilterChange('fieldLeader', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead>
                    Item Description/Part Number
                     <Input
                        placeholder="Filter..."
                        value={filters.description}
                        onChange={(e) => handleFilterChange('description', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead className="text-right">
                    On-Hand Qty
                     <Input
                        type="number"
                        placeholder="Filter..."
                        value={filters.quantity}
                        onChange={(e) => handleFilterChange('quantity', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                  <TableHead>
                    Last Updated
                     <Input
                        placeholder="Filter..."
                        value={filters.lastUpdated}
                        onChange={(e) => handleFilterChange('lastUpdated', e.target.value)}
                        className="mt-1 h-8"
                      />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => (
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
