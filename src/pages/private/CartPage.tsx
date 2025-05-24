"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { orderApi, type OrderItem } from "@/api/orderApi"

const Cart = () => {
  const { isAuthenticated, userId } = useAuth()
  const { UpdateCartQuantity, setCartQunatity } = useCart()
  const navigate = useNavigate()

  // Cart state
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [CartId, setCartId] = useState(0)
  const [cartStatus, setCartStatus] = useState("")
  // Checkout state
  const [couponCode, setCouponCode] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("stripe")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)



  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "info"
    message: string
  }>({ show: false, type: "info", message: "" })

  // Show notification helper
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 700)
  }

  // Load cart data
  useEffect(() => {
    const loadCartData = async () => {
      if (!userId || !isAuthenticated) {
        return
      }

      try {
        setLoading(true)
        const userOrdersResponse = await orderApi.SingleUserOrder(userId)
        const { data: OrdersData, status: OrdersStatus } = userOrdersResponse

        if (OrdersStatus === 200 && OrdersData[0]?.items) {
          console.log(OrdersData)
          setCartItems(OrdersData[0].items)
          setTotalAmount(OrdersData[0].total_amount)
          setCartId(OrdersData[0].order_id)
          setCartStatus(OrdersData[0].status)
          const totalQuantity = OrdersData[0].items.reduce((sum, item) => sum + item.quantity, 0)
          UpdateCartQuantity(totalQuantity)
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        showNotification("error", "Failed to load cart items")
      } finally {
        setLoading(false)
      }
    }

    loadCartData()
  }, [userId, isAuthenticated])

  // Remove item from cart
  const removeItem = async (itemId: number) => {
    try {
      setIsUpdating(itemId)
      console.log("this is the item id", itemId)
      const response = await orderApi.DeleteUserOrderItem(itemId)

      if (response.status === 200) {
        setCartItems((prevItems) => {
          const newItems = prevItems.filter((item) => item.item_id !== itemId)
          // Update cart quantity in context
          const newTotalQuantity = newItems.reduce((total, item) => total + item.quantity, 0)
          UpdateCartQuantity(newTotalQuantity)
          return newItems
        })
        showNotification("success", "Item removed from cart")
      }
    } catch (error) {
      console.error("Error removing item:", error)
      showNotification("error", "Failed to remove item")
    } finally {
      setIsUpdating(null)
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId: number, change: number, newQuantity: number) => {
    if (newQuantity <= 0 || !userId) {
      showNotification("error", "Quantity cannot be zero or negative")
      return
    }

    try {
      setIsUpdating(itemId)
      const response = await orderApi.UpdateQuantityUserOrderItem(itemId, change)

      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.item_id === itemId ? { ...item, quantity: item.quantity + change } : item
          )
        );

        console.log("Updated total quantity:", response.data?.total_amount);
        setTotalAmount(response.data.total_amount)
        setCartQunatity(response.data.total_quantity)

        // refrech the items 
        try {
          const userOrdersResponse = await orderApi.SingleUserOrder(userId)
          const { data: OrdersData, status: OrdersStatus } = userOrdersResponse

          if (OrdersStatus === 200 && OrdersData[0]?.items) {
            setCartItems(OrdersData[0].items)
            setCartId(OrdersData[0].order_id)
          }
        } catch (error) {
          console.error("Error loading cart:", error)
          showNotification("error", "Failed to load cart items")
        }
        showNotification("success", "Cart updated successfully")
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      showNotification("error", "Failed to update quantity. Please check stock availability.")
    } finally {
      setIsUpdating(null)
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    try {
      // You would implement a clear cart API call here
      try {
        const response = await orderApi.ClearAllOrders(CartId)
        if (response.status === 200) {
          setCartItems([])
          setTotalAmount(0)
          UpdateCartQuantity(0)
          showNotification("success", "Cart cleared successfully")
        }
      } catch (error) {
        console.error("Error removing item:", error)
        showNotification("error", "Failed to remove item")
      }

    } catch (error) {
      showNotification("error", "Failed to clear cart")
    }
  }

  // Apply coupon
  const applyCoupon = () => {
    if (couponCode.trim()) {
      // Simulate coupon application
      showNotification("info", "Coupon functionality will be implemented soon")
    }
  }

  // Process payment
  const processPayment = async () => {
    if (cartItems.length === 0) {
      showNotification("error", "Your cart is empty")
      return
    }

    setIsProcessingPayment(true)




    try {
      if (paymentMethod === "stripe") {
        const PaymentRequest = await orderApi.PayementProcess(CartId);
        const { data, status } = PaymentRequest;

        if (status === 200 && data?.stripeCheckoutLink) {
          // ✅ Redirect to Stripe Checkout
          window.location.href = data.stripeCheckoutLink;
        } else {
          // ❌ Invalid response, show error
          showNotification("error", data?.message || "Something went wrong with payment.");
        }
      } else {
        showNotification("error", "Only Stripe payments are currently available");
      }
    } catch (error: any) {
      // ❌ Network or server error
      const message = error?.response?.data?.message || "Payment failed. Please try again.";
      showNotification("error", message);
    } finally {
      setIsProcessingPayment(false);
    }
  }

  const shippingCost = 0
  const subtotal = totalAmount
  const finalTotal = subtotal + shippingCost

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your cart</p>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Notification popup */}
      {notification.show && (
        <AlertDialog
          open={notification.show}
          onOpenChange={() => setNotification((prev) => ({ ...prev, show: false }))}
        >
          <AlertDialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[400px] w-[90vw] p-0 overflow-hidden shadow-2xl z-50">
            <div
              className={`p-4 text-white ${notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
                }`}
            >
              <AlertDialogTitle className="flex items-center gap-2 m-0 text-lg font-semibold">
                {notification.type === "success" ? <Check className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                {notification.type === "success" ? "Success" : notification.type === "error" ? "Error" : "Info"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="p-6 text-center">{notification.message}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <button onClick={() => navigate("/")} className="hover:text-gray-700">
              Home
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>

          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to your cart to get started</p>
              <Button onClick={() => navigate("/")} size="lg">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cart Items Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">Product</th>
                            <th className="text-center p-4 font-medium">Price</th>
                            <th className="text-center p-4 font-medium">Quantity</th>
                            <th className="text-center p-4 font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((item) => (
                            <tr key={item.item_id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={item.images[0]?.url || "/placeholder.svg"}
                                      alt={item.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-lg">{item.product_name}</h3>
                                    <button
                                      onClick={() => removeItem(item.item_id)}
                                      disabled={isUpdating === item.item_id}
                                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mt-1"
                                    >
                                      {isUpdating === item.item_id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3 w-3" />
                                      )}
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(item.item_id, -1, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || isUpdating === item.item_id}
                                    className="w-8 h-8 rounded border hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.item_id, 1, item.quantity + 1)}
                                    disabled={isUpdating === item.item_id}
                                    className="w-8 h-8 rounded border hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="font-medium">${item.total_price.toFixed(2)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Continue Shopping
                  </Button>
                  <Button variant="destructive" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-5 w-5" />
                          <span>Stripe (Credit/Debit Card)</span>
                          <Badge variant="secondary">Recommended</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                        <RadioGroupItem value="paypal" id="paypal" disabled />
                        <Label htmlFor="paypal" className="flex items-center gap-2 cursor-not-allowed">
                          <span>PayPal</span>
                          <Badge variant="outline">Coming Soon</Badge>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                        <RadioGroupItem value="apple-pay" id="apple-pay" disabled />
                        <Label htmlFor="apple-pay" className="flex items-center gap-2 cursor-not-allowed">
                          <span>Apple Pay</span>
                          <Badge variant="outline">Coming Soon</Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>

                    {/* Coupon Code */}
                    <div className="space-y-2">
                      <Label htmlFor="coupon">Coupon Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                        />
                        <Button variant="outline" onClick={applyCoupon}>
                          Apply
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Security Features */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Secure SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span>Free shipping on orders over $50</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      className="w-full h-12 text-lg"
                      onClick={processPayment}
                      disabled={isProcessingPayment || cartItems.length === 0 || cartStatus !== "wait to pay"}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          {cartStatus == "wait to pay" ? "Proceed to Checkout" : "Clear cart to continue shopping"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart
