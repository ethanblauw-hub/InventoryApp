import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to conditionally join Tailwind CSS class names together.
 * It merges Tailwind classes and resolves conflicts, ensuring a clean and predictable class string.
 *
 * @param {...ClassValue[]} inputs - A list of class values to be combined. These can be strings, objects, or arrays.
 * @returns {string} The merged and optimized class name string.
 * @example
 * // Returns "bg-red-500 text-white"
 * cn("bg-red-500", { "text-white": true });
 * @example
 * // Returns "p-4" because p-8 is overridden by the last class
 * cn("p-2", "p-8", "p-4");
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
