
'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AddCategoryDialog } from '@/components/add-category-dialog';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';

// Define the Category type based on the expected Firestore document structure.
type Category = {
  name: string;
  description: string;
};

/**
 * A custom hook to fetch work categories from Firestore.
 * It encapsulates the Firestore query and memoization logic.
 * @returns {object} The state of the collection query: data, isLoading, and error.
 */
function useCategories() {
  const firestore = useFirestore();

  // Memoize the collection reference to prevent re-renders.
  const categoriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'workCategories');
  }, [firestore]);

  return useCollection<Category>(categoriesRef);
}


/**
 * A page component for managing work categories.
 * It displays a list of existing categories fetched from Firestore and provides
 * administrative actions like adding, editing, and deleting categories.
 *
 * @returns {JSX.Element} The rendered categories management page.
 */
export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Categories"
        description="Customize work categories for organizing BOMs."
      >
        <AddCategoryDialog />
      </PageHeader>
      
      <Alert>
        <UserCog className="h-4 w-4" />
        <AlertTitle>Admin Access</AlertTitle>
        <AlertDescription>
          Managing categories is restricted to administrators.
        </AlertDescription>
      </Alert>

      {isLoading && <p>Loading categories...</p>}
      {error && <p className="text-destructive">Error: {error.message}</p>}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories && categories.map((category: WithId<Category>) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Category</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Delete Category</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
