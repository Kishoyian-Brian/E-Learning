import { MaterialType } from '@prisma/client';

export interface Content {
  id: string; // Unique identifier
  title: string; // Title of the content/material
  description: string | null; // Optional: Description or summary
  type: MaterialType; // Type of content: 'video', 'pdf', 'image', 'text', etc.
  url: string; // URL or path to the file/resource
  moduleId: string; // Foreign key: which module this content belongs to
  order: number; // Optional: order/position within the module
  visible: boolean;
  createdAt: Date; // Timestamp for creation
  updatedAt: Date; // Timestamp for last update
}
