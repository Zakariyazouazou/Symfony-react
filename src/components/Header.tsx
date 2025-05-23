"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Menu, SearchIcon, Minus, Plus, ChevronRight, Trash2, AwardIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import api from "@/api/axios"
import { orderApi, type OrderItem } from "@/api/orderApi"

interface Category {
    id: number
    name: string
    slug: string
}

interface CategoriesResponse {
    status: string
    total: number
    data: Category[]
}

// Fake cart item interface
interface CartItem {
    id: number
    productId: number
    name: string
    price: number
    quantity: number
    image: string
}

export const Header: React.FC = () => {
    const { isAuthenticated, role, logout, userId } = useAuth()
    const { UpdateCartQuantity, CartQunatity, setCartQunatity } = useCart()
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingCats, setLoadingCats] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    // control sheet open state
    const [sheetOpen, setSheetOpen] = useState(false)
    // control cart sheet open state
    const [cartSheetOpen, setCartSheetOpen] = useState(false)
    // Fake cart items
    const [cartItems, setCartItems] = useState<OrderItem[]>([])
    // total amount
    const [totalAmount, setTotalAmount] = useState(0)

    const navigate = useNavigate()

    useEffect(() => {
        api
            .get<CategoriesResponse>("/api/categories")
            .then((res) => setCategories(res.data.data))
            .catch(console.error)
            .finally(() => setLoadingCats(false))
    }, [])

    // close sheet helper
    const closeSheet = () => setSheetOpen(false)

    const handleSearchConfirm = () => {
        if (searchQuery.trim() === "") {
            setDialogOpen(false)
        } else {
            setDialogOpen(false)
            navigate(`/search/${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearchConfirm()
        }
    }

    

    // Remove item from cart
    const removeItem = async (itemId: number) => {
        const DeletOrderResponse = await orderApi.DeleteUserOrderItem(itemId)
        const { status: OrdersItemStatus } = DeletOrderResponse
        console.log("this is the status from deleting order ", OrdersItemStatus)
        setCartItems((prevItems) => {
            const newItems = prevItems.filter((item) => item.item_id !== itemId)
            // Update cart quantity in context
            const newTotalQuantity = newItems.reduce((total, item) => total + item.quantity, 0)
            UpdateCartQuantity(newTotalQuantity)
            return newItems
        })
    }

    // Update item quantity
    const updateQuantity = async (itemId: number, UpdatedNumber: number, newTotalQuantity: number) => {

        if (newTotalQuantity = 0) {
            alert("we can not update to zero ")
            return
        }

        try {
            const updateOrderResponse = await orderApi.UpdateQuantityUserOrderItem(itemId, UpdatedNumber);
            const { status: OrdersItemQtyStatus } = updateOrderResponse;

            console.log("Status:", OrdersItemQtyStatus);
            console.log("This is the status from updating order");

            if (OrdersItemQtyStatus === 200) {
                console.log("Updated total quantity:", updateOrderResponse.data.total_quantity);

                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item.item_id === itemId ? { ...item, quantity: item.quantity + UpdatedNumber } : item
                    )
                );

                setCartQunatity(updateOrderResponse.data.total_quantity);
            } else {
                alert("⚠️ Failed to update quantity. It may be due to limited stock or a temporary issue . Please refresh the page and try again.");
            }
        } catch (error) {
            console.error("Error updating order item quantity:", error);
            alert("⚠️ Failed to update quantity. It may be due to limited stock or a temporary issue . Please refresh the page and try again.");
        }
    }

    // Navigate to product detail
    const goToProductDetail = (productId: number) => {
        setCartSheetOpen(false)
        navigate(`/product/${productId}`)
    }

    // Navigate to cart page
    const goToCart = () => {
        setCartSheetOpen(false)
        navigate("/cart")
    }

    useEffect(() => {
        const ResentTheOderQuantity = async () => {
            if (!userId) return
            // Reset the cart information in reload case
            const userOrdersResponse = await orderApi.SingleUserOrder(userId)
            const { data: OrdersData, status: OrdersStatus } = userOrdersResponse

            if (OrdersStatus === 200) {
                // Sum quantities across all orders
                if (OrdersData[0].items && OrdersData[0].items.length > 0) {
                    const totalQuantity = OrdersData[0].items.reduce((itemAcc, item) => itemAcc + item.quantity, 0)
                    UpdateCartQuantity(totalQuantity)
                    setTotalAmount(OrdersData[0].total_amount)
                    setCartItems(OrdersData[0].items)
                }
            }
        }

        ResentTheOderQuantity()
    }, [userId, CartQunatity])



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
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    <SheetContent side="left" className="bg-white p-4">
                        <SheetHeader>
                            <SheetTitle>Categories</SheetTitle>
                            <SheetDescription>
                                {loadingCats ? "Loading..." : "Select a category to browse products."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 flex flex-col gap-2">
                            {categories.map((cat) => (
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
                        {role === "user" && (
                            <Link to="/track-orders">
                                <Button variant="ghost">Track Orders</Button>
                            </Link>
                        )}
                        {role === "admin" && (
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
                    <SheetContent side="left" className="bg-white p-4">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 flex flex-col gap-4">
                            <Link to="/" onClick={closeSheet}>
                                Products
                            </Link>
                            <Link to="/search" onClick={closeSheet}>
                                Search
                            </Link>
                            <div className="border-t" />
                            <div className="flex flex-col gap-2">
                                <span className="font-semibold">Categories</span>
                                {loadingCats ? (
                                    <span>Loading...</span>
                                ) : (
                                    categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/category/${cat.id}`}
                                            onClick={closeSheet}
                                            className="px-3 py-2 rounded hover:bg-gray-100"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                )}
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
                                    {role === "user" && (
                                        <Link to="/track-orders" onClick={closeSheet}>
                                            <Button variant="ghost">Track Orders</Button>
                                        </Link>
                                    )}
                                    {role === "admin" && (
                                        <Link to="/admin/users" onClick={closeSheet}>
                                            <Button variant="ghost">Admin Panel</Button>
                                        </Link>
                                    )}
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            logout()
                                            closeSheet()
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Cart Icon with Sheet */}
            {isAuthenticated && role === "user" && (
                <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
                    <SheetTrigger asChild>
                        <button
                            className="relative hidden md:block cursor-pointer">
                            <ShoppingCart size={24} />
                            {CartQunatity > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                    {CartQunatity}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[350px] sm:w-[450px] p-0 bg-white">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="flex items-center gap-2">
                                    <ShoppingCart size={20} />
                                    Your Cart ({CartQunatity} items)
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-auto p-4">
                                {CartQunatity === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <ShoppingCart size={48} className="text-gray-300 mb-4" />
                                        <p className="text-lg font-medium mb-2">Your cart is empty</p>
                                        <p className="text-gray-500 mb-4">Add items to your cart to see them here</p>
                                        <SheetClose asChild>
                                            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
                                        </SheetClose>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {cartItems.map((item) => (
                                            <li key={item.product_id} className="border rounded-lg overflow-hidden">
                                                <div className="flex p-3">
                                                    {/* Product Image */}
                                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                        <img
                                                            src={item.images[0].url || "/placeholder.svg"}
                                                            alt={item.product_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="ml-3 flex-1">
                                                        <div
                                                            className="font-medium hover:text-primary cursor-pointer flex items-center"
                                                            onClick={() => goToProductDetail(item.product_id)}
                                                        >
                                                            {item.product_name}
                                                            <ChevronRight size={16} className="ml-1" />
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">${item.unit_price.toFixed(2)} each</div>

                                                        <div className="flex items-center justify-between mt-2">
                                                            {/* Quantity Controls */}
                                                            <div className="flex items-center border rounded">
                                                                <button
                                                                    className="p-1 hover:bg-gray-100"
                                                                    onClick={() => updateQuantity(item.item_id, -1, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="px-2">{item.quantity}</span>
                                                                <button
                                                                    className="p-1 hover:bg-gray-100"
                                                                    onClick={() => updateQuantity(item.item_id, 1, item.quantity + 1)}
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>

                                                            {/* Item Total */}
                                                            <div className="font-medium">${item.total_price}</div>

                                                            {/* Remove Button */}
                                                            <button
                                                                className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                                                                onClick={() => removeItem(item.item_id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {CartQunatity > 0 && (
                                <SheetFooter className="border-t p-4 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-lg font-semibold">
                                        <span>Total:</span>
                                        <span>${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <Button className="w-full" size="lg" onClick={goToCart}>
                                        View Cart & Checkout
                                    </Button>
                                </SheetFooter>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </header>
    )
}

export const CategoryList: React.FC = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold">Hello World</h1>
    </div>
)
