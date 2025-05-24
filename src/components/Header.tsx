import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Menu, SearchIcon, Minus, Plus, ChevronRight, Trash2 } from "lucide-react"
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
import { UserButton } from "./UserButton"

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
    if (newTotalQuantity === 0) {
      alert("we can not update to zero ")
      return
    }

    try {
      const updateOrderResponse = await orderApi.UpdateQuantityUserOrderItem(itemId, UpdatedNumber)
      const { status: OrdersItemQtyStatus } = updateOrderResponse

      console.log("Status:", OrdersItemQtyStatus)
      console.log("This is the status from updating order")

      if (OrdersItemQtyStatus === 200) {
        console.log("Updated total quantity:", updateOrderResponse.data.total_quantity)

        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.item_id === itemId ? { ...item, quantity: item.quantity + UpdatedNumber } : item,
          ),
        )

        setCartQunatity(updateOrderResponse.data.total_quantity)
      } else {
        alert(
          "⚠️ Failed to update quantity. It may be due to limited stock or a temporary issue . Please refresh the page and try again.",
        )
      }
    } catch (error) {
      console.error("Error updating order item quantity:", error)
      alert(
        "⚠️ Failed to update quantity. It may be due to limited stock or a temporary issue . Please refresh the page and try again.",
      )
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
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary flex-shrink-0">
            MyShop
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-center">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              Products
            </Link>

            {/* Search Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SearchIcon size={16} />
                  <span className="hidden xl:inline">Search</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="p-4 bg-white max-w-md">
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
                  className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <DialogFooter>
                  <Button onClick={handleSearchConfirm}>Go</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Categories Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Menu size={16} />
                  <span className="hidden xl:inline">Categories</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white p-4 w-80">
                <SheetHeader>
                  <SheetTitle>Categories</SheetTitle>
                  <SheetDescription>
                    {loadingCats ? "Loading..." : "Select a category to browse products."}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={closeSheet}
                      className="px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Auth Links */}
            <div className="hidden lg:flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              ) : (
                <>
                  {(role === "user" || role === "admin") && (
                    <Link to="/track-orders">
                      <Button variant="ghost" size="sm">
                        Track Orders
                      </Button>
                    </Link>
                  )}
                  {role === "admin" && <UserButton />}
                  <Button variant="destructive" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Cart Icon - Now visible on all screen sizes */}
            {isAuthenticated && (role === "user" || role === "admin") && (
              <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
                <SheetTrigger asChild>
                  <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                    {CartQunatity > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-medium">
                        {CartQunatity > 99 ? "99+" : CartQunatity}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] lg:w-[450px] p-0 bg-white">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="flex items-center gap-2 text-left">
                        <ShoppingCart size={20} />
                        Your Cart ({CartQunatity} {CartQunatity === 1 ? "item" : "items"})
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
                            <li key={item.product_id} className="border rounded-lg overflow-hidden bg-gray-50">
                              <div className="flex p-3 gap-3">
                                {/* Product Image */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded overflow-hidden border">
                                  <img
                                    src={item.images[0]?.url || "/placeholder.svg"}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <div
                                    className="font-medium hover:text-primary cursor-pointer flex items-center text-sm sm:text-base truncate"
                                    onClick={() => goToProductDetail(item.product_id)}
                                  >
                                    <span className="truncate">{item.product_name}</span>
                                    <ChevronRight size={16} className="ml-1 flex-shrink-0" />
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                    ${item.unit_price.toFixed(2)} each
                                  </div>

                                  <div className="flex items-center justify-between mt-3 gap-2">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border rounded bg-white">
                                      <button
                                        className="p-1.5 hover:bg-gray-100 disabled:opacity-50"
                                        onClick={() => updateQuantity(item.item_id, -1, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                      >
                                        <Minus size={12} />
                                      </button>
                                      <span className="px-2 py-1 text-sm min-w-[2rem] text-center">
                                        {item.quantity}
                                      </span>
                                      <button
                                        className="p-1.5 hover:bg-gray-100"
                                        onClick={() => updateQuantity(item.item_id, 1, item.quantity + 1)}
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="font-medium text-sm sm:text-base">${item.total_price}</div>

                                    {/* Remove Button */}
                                    <button
                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
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
                      <SheetFooter className="border-t p-4 bg-gray-50">
                        <div className="w-full space-y-4">
                          <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total:</span>
                            <span>${totalAmount.toFixed(2)}</span>
                          </div>
                          <Button className="w-full" size="lg" onClick={goToCart}>
                            View Cart & Checkout
                          </Button>
                        </div>
                      </SheetFooter>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white p-0 w-80">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="text-left">Menu</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-auto p-4">
                      <div className="space-y-6">
                        {/* Navigation Links */}
                        <div className="space-y-2">
                          <Link
                            to="/"
                            onClick={closeSheet}
                            className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            Products
                          </Link>

                          {/* Mobile Search */}
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <SearchIcon size={16} />
                                Search
                              </button>
                            </DialogTrigger>
                            <DialogContent className="p-4 bg-white max-w-sm mx-4">
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
                                className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <DialogFooter>
                                <Button onClick={handleSearchConfirm}>Go</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Categories */}
                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-3 px-4">Categories</h3>
                          <div className="space-y-1">
                            {loadingCats ? (
                              <div className="px-4 py-2 text-gray-500">Loading...</div>
                            ) : (
                              categories.map((cat) => (
                                <Link
                                  key={cat.id}
                                  to={`/category/${cat.slug}`}
                                  onClick={closeSheet}
                                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  {cat.name}
                                </Link>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Auth Section */}
                    <div className="border-t p-4 bg-gray-50">
                      <div className="space-y-2">
                        {!isAuthenticated ? (
                          <>
                            <Link to="/login" onClick={closeSheet} className="block">
                              <Button variant="outline" className="w-full">
                                Login
                              </Button>
                            </Link>
                            <Link to="/register" onClick={closeSheet} className="block">
                              <Button className="w-full">Register</Button>
                            </Link>
                          </>
                        ) : (
                          <>
                            {(role === "user" || role === "admin") && (
                              <Link to="/track-orders" onClick={closeSheet} className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                  Track Orders
                                </Button>
                              </Link>
                            )}
                            {role === "admin" && (
                              <Link to="/admin/users" onClick={closeSheet} className="block">
                                <Button variant="ghost" className="w-full justify-start">
                                  Admin Panel
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="destructive"
                              className="w-full"
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
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export const CategoryList: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Hello World</h1>
  </div>
)
