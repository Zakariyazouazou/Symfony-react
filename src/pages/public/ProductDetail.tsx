import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { ProductCard, type Product as ProductList } from '@/components/ProductCard';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    stock: number;
    categories: { id: number; name: string; slug: string }[];
    images: { id: number; url: string; altText: string | null }[];
}

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState<ProductList[]>([]);

    useEffect(() => {
        api
            .get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);


    // Fetch all products
    useEffect(() => {
        api
            .get('/api/products?limit=3')
            .then((res) => {
                setAllProducts(res.data.data);
            })
            .catch((err) => {
                console.error('Failed to fetch products:', err);
            })
            .finally(() => setLoading(false));
    }, []);


    if (loading) return <div className="p-4">Loading...</div>;
    if (!product || !allProducts) return <div className="p-4">Product not found</div>;

    return (
        <div>
            <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image */}
                <div>
                    <img
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        className="w-full h-auto object-cover rounded-xl shadow"
                    />
                </div>

                {/* Info */}
                <div>
                    <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <div className="text-lg font-semibold text-green-600 mb-2">
                        ${product.price}
                    </div>
                    <div className="mb-4">
                        <span className="font-medium">SKU:</span> {product.sku}
                    </div>
                    <div className="mb-4">
                        <span className="font-medium">Stock:</span> {product.stock}
                    </div>
                    <div className="mb-4">
                        <span className="font-medium">Categories:</span>{' '}
                        {product.categories.map(cat => (
                            <span key={cat.id} className="inline-block mr-2 text-sm text-blue-600">
                                #{cat.name}
                            </span>
                        ))}
                    </div>
                    <Button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Add to Cart
                    </Button>
                </div>
            </div>
            {/* Related products */}
            <div className='container mx-auto'>
                {
                    allProducts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {allProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default ProductDetail;
