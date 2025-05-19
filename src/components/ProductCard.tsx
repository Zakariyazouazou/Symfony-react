import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
    stock: number;
}

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const stars = Math.floor(Math.random() * 5) + 1;
    const reviews = Math.floor(Math.random() * 200) + 1;
    const navigate = useNavigate();

    const handleAdd = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            addItem({ productId: product.id.toString(), qty: 1 });
            alert('Product added to cart!'); // placeholder for future action
        }
    };





    return (
        <div className="border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <Link to={`/product/${product.id}`}>
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                />
            </Link>

            <div className="p-4 flex-1 flex flex-col">
                <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-medium mb-2 line-clamp-2 hover:underline">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center text-sm text-yellow-500 mb-4">
                    {'★'.repeat(stars) + '☆'.repeat(5 - stars)}
                    <span className="ml-2 text-gray-600">({reviews})</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-semibold">${product.price}</span>
                    <Button
                        onClick={handleAdd}
                        disabled={product.stock === 0}
                        variant="secondary"
                    >
                        {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
