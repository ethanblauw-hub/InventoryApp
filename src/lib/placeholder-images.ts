import data from './placeholder-images.json';

/**
 * Defines the structure for a placeholder image object.
 * @property {string} id - A unique identifier for the image.
 * @property {string} description - A brief description of the image content.
 * @property {string} imageUrl - The URL of the placeholder image.
 * @property {string} imageHint - A hint for AI, typically one or two keywords for image search.
 */
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

/**
 * An array of placeholder image data, imported from a JSON file.
 * This is used throughout the application to provide consistent placeholder images.
 * @type {ImagePlaceholder[]}
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
