import { PageHeader } from '@/components/page-header';
import { categories } from '@/lib/data';
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

/**
 * A page component for managing work categories.
 * It displays a list of existing categories and provides administrative actions
 * like adding, editing, and deleting categories. Access to these actions is
 * visually indicated as being restricted to administrators.
 *
 * @returns {JSX.Element} The rendered categories management page.
 */
export default function CategoriesPage() {
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
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
