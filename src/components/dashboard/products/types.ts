export type FilterFormValues = {
  term: string;
  categoryId: string;
  status: string;
};

export type ProductFormValues = {
  name: string;
  categoryId: string;
  shortDescription: string;
  imageFile: File | null;
  removeImage: boolean;
  status: string;
  basePriceAmount: string;
  inventoryQuantity: string;
  isAvailable: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
};

// Generic Item type based on usage in routes
export type ProductItem = {
  id: string;
  categoryId: string | null;
  name: string;
  shortDescription: string | null;
  imageUrl: string | null;
  status: string;
  basePriceAmount: number | null;
  inventoryQuantity: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
};
