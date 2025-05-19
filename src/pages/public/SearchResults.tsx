// src/components/SearchResults.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard, type Product } from '@/components/ProductCard';
import api from '@/api/axios';

interface SearchResponse {
  status: string;
  results: Product[];
}

const SearchResults: React.FC = () => {
  const { search } = useParams<{ search: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search) return;
    setLoading(true);
    api
      .get<SearchResponse>(`/api/products/search?q=${encodeURIComponent(search)}`)
      .then(res => setProducts(res.data.results))
      .catch(() => setError('Search failed.'))
      .finally(() => setLoading(false));
  }, [search]);

  if (loading) {
    return <div className="p-6 text-center">Searching for "{search}"...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="p-6 text-center">No results found for "{search}".</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Results for "{search}"</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;