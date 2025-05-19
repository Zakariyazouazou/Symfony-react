import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, SearchIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import api from '@/api/axios';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface CategoriesResponse {
    status: string;
    total: number;
    data: Category[];
}

export const Header: React.FC = () => {
    const { isAuthenticated, role, logout } = useAuth();
    const { cartItems } = useCart();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // control sheet open state
    const [sheetOpen, setSheetOpen] = useState(false);

    const navigate = useNavigate();

    const totalQty = cartItems.reduce((sum, i) => sum + i.qty, 0);

    useEffect(() => {
        api
            .get<CategoriesResponse>('/api/categories')
            .then(res => setCategories(res.data.data))
            .catch(console.error)
            .finally(() => setLoadingCats(false));
    }, []);

    // close sheet helper
    const closeSheet = () => setSheetOpen(false);



    const handleSearchConfirm = () => {
        if (searchQuery.trim() === '') {
            setDialogOpen(false);
        } else {
            setDialogOpen(false);
            navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchConfirm();
        }
    };

    return (
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
                MyShop
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-4 items-center">
                <Link to="/">Products</Link>
                {/* Search Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1 ">
                            <SearchIcon size={16} />
                            Search
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-4 bg-white">
                        <DialogHeader>
                            <DialogTitle>Search Products</DialogTitle>
                        </DialogHeader>
                        <input
                            type="text"
                            autoFocus
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter search term..."
                            className="w-full border rounded px-3 py-2 mb-4"
                        />
                        <DialogFooter>
                            <Button onClick={handleSearchConfirm}>Go</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Controlled Sheet for Categories */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                            <Menu size={16} />
                            Categories
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className='bg-white p-4'>
                        <SheetHeader>
                            <SheetTitle>Categories</SheetTitle>
                            <SheetDescription>
                                {loadingCats ? 'Loading...' : 'Select a category to browse products.'}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 flex flex-col gap-2">
                            {categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    to={`/category/${cat.slug}`}
                                    onClick={closeSheet}
                                    className="px-3 py-2 rounded hover:bg-gray-100"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Auth Links Desktop */}
                {!isAuthenticated ? (
                    <>
                        <Link to="/login">
                            <Button variant="outline">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Register</Button>
                        </Link>
                    </>
                ) : (
                    <>
                        {role === 'user' && (
                            <Link to="/track-orders">
                                <Button variant="ghost">Track Orders</Button>
                            </Link>
                        )}
                        {role === 'admin' && (
                            <Link to="/admin/users">
                                <Button variant="ghost">Admin Panel</Button>
                            </Link>
                        )}
                        <Button variant="destructive" onClick={logout}>
                            Logout
                        </Button>
                    </>
                )}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className='bg-white p-4'>
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 flex flex-col gap-4">
                            <Link to="/" onClick={closeSheet}>Products</Link>
                            <Link to="/search" onClick={closeSheet}>Search</Link>
                            <div className="border-t" />
                            <div className="flex flex-col gap-2">
                                <span className="font-semibold">Categories</span>
                                {loadingCats
                                    ? <span>Loading...</span>
                                    : categories.map(cat => (
                                        <Link
                                            key={cat.id}
                                            to={`/category/${cat.id}`}
                                            onClick={closeSheet}
                                            className="px-3 py-2 rounded hover:bg-gray-100"
                                        >{cat.name}</Link>
                                    ))}
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-t flex flex-col gap-2">
                            {/* Auth Links Mobile */}
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" onClick={closeSheet}>
                                        <Button variant="outline">Login</Button>
                                    </Link>
                                    <Link to="/register" onClick={closeSheet}>
                                        <Button>Register</Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {role === 'user' && (
                                        <Link to="/track-orders" onClick={closeSheet}>
                                            <Button variant="ghost">Track Orders</Button>
                                        </Link>
                                    )}
                                    {role === 'admin' && (
                                        <Link to="/admin/users" onClick={closeSheet}>
                                            <Button variant="ghost">Admin Panel</Button>
                                        </Link>
                                    )}
                                    <Button variant="destructive" onClick={() => { logout(); closeSheet(); }}>
                                        Logout
                                    </Button>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Cart Icon Desktop */}
            {isAuthenticated && role === 'user' && (
                <Link to="/cart" className="relative hidden md:block">
                    <ShoppingCart size={24} />
                    {totalQty > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {totalQty}
                        </span>
                    )}
                </Link>
            )}
        </header>
    );
};

export const CategoryList: React.FC = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold">Hello World</h1>
    </div>
);
