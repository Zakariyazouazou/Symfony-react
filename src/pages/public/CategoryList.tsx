import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard, type Product } from '@/components/ProductCard';
import api from '@/api/axios';

interface ProductsResponse {
  status: string;
  page: number;
  data: Product[];
}

export const CategoryList: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<ProductsResponse>(`/api/categories/${category}/products`)
      .then(res => setProducts(res.data.data))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return <div className="p-6 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="p-6 text-center">No products found in this category.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Category {category}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
