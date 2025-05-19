// src/pages/ProductList.tsx
import React, { useEffect, useState } from 'react';
// ⇩ import your pre‐configured instance, not the default axios
import api from '@/api/axios';
import { ProductCard, type Product } from '@/components/ProductCard';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/products')
      .then((res) => {
        setProducts(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-8">Loading…</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};
