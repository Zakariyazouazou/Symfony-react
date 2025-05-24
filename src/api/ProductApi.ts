import api from './axios';

export interface ProductRequest {
  name: string;
  slug?: string;
  description: string;
  sku?: string;
  price: number;
  stock: number;
  categories: (string | number)[];
  images: string[];
}

export type ProductRequestBody = ProductRequest[];

export interface ProductCreationResponseItem {
  id: number;
}

export type ProductCreationResponse = ProductCreationResponseItem[];


export interface ProductImageInput {
  id?: number; // optional; omit for new images
  filename: string;
  url: string;
  altText?: string | null;
  position?: number | null;
  createdAt?: string | null;
}

export interface ProductUpdateRequest {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  images: ProductImageInput[];
}

export interface categorieChild {
  "id": number,
  "name": string,
  "slug": string,
  "description": string
}


export interface UpdateProductCategoryResponse {
  id: number;
  categories: categorieChild[]
}


export interface ProductListe {
  "id": number,
  "name": string,
  "sku": string,
  "price": number,
  "stock": number
}



export const ProductApi = {
  createProduct: (data: ProductRequestBody) => {
    return api.post<ProductCreationResponse>(
      `/api/products`,
      data
    );
  },


  updateProduct: (data: ProductUpdateRequest, id: string | number) => {
    return api.patch<ProductCreationResponse>(
      `/api/products/${id}`,
      data
    );
  },


  UpdateProductCategory: (data: categorieChild[], id: string | number) => {
    return api.patch<UpdateProductCategoryResponse>(
      `/api/products/category/${id}`,
      {
        "id": id,
        "categories": data
      }
    );
  },


  FastProductCategory: (data: ProductListe, id: number) => {
    return api.patch<UpdateProductCategoryResponse>(
      `/api/products/${id}`,
      data
    );
  },


  DeleteProduct: (id: number | string) => {
    return api.delete(
      `/api/products/${id}`
    );
  },

};
