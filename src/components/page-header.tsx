import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Props for the PageHeader component.
 */
type PageHeaderProps = {
  /**
   * The main title to be displayed in the header.
   */
  title: string;
  /**
   * An optional subtitle or description to be displayed below the title.
   */
  description?: string;
  /**
   * Optional child elements, typically action buttons or controls, to be displayed on the right side of the header.
   */
  children?: ReactNode;
  /**
   * Optional additional class names to apply to the root element for custom styling.
   */
  className?: string;
};

/**
 * A reusable component for displaying a consistent page header across the application.
 * It includes a title, an optional description, and a slot for action buttons.
 *
 * @param {PageHeaderProps} props - The props for the PageHeader component.
 * @returns {JSX.Element} The rendered page header.
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-1">
        <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}
