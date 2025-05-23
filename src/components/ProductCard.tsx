"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { orderApi } from "@/api/orderApi"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Check, ShoppingCart, Star } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"

export interface Product {
  id: number
  name: string
  price: number
  images: string[]
  stock: number
}

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { UpdateCartQuantity } = useCart()
  const { isAuthenticated, userId } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  const handleAdd = async () => {
    setIsAdding(true)

    if (!isAuthenticated) {
      navigate("/login")
      setIsAdding(false)
      return
    }

    if (!userId) {
      alert("User is not authenticated")
      setIsAdding(false)
      return
    }

    try {
      const { status } = await orderApi.create(userId, product.id, 1)
      console.log("Create status:", status)

      if (status === 201) {
        // show success popup
        setShowSuccess(true)

        // Auto-hide success message after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000)

        // fetch user orders and update cart quantity
        const { data: OrdersData, status: OrdersStatus } = await orderApi.SingleUserOrder(userId)
        if (OrdersStatus === 200 && OrdersData[0]?.items?.length) {
          const totalQuantity = OrdersData[0].items.reduce((sum, item) => sum + item.quantity, 0)
          console.log("Total items in this order:", totalQuantity)
          UpdateCartQuantity(totalQuantity)
        }
      }
    } catch (err: any) {
      console.error("Order API error:", err.response?.status, err.response?.data)
      alert("Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  // Calculate original price (current price + 20%)
  const originalPrice = product.price * 1.2

  // Generate fake review data
  const fakeRating = 4.2 + (product.id % 10) * 0.05 // Rating between 4.2-4.7
  const fakeReviewCount = 15 + (product.id % 50) // Review count between 15-65

  return (
    <>
      {/* Success popup using AlertDialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="bg-white border-green-500 border-2 max-w-[300px] p-0 overflow-hidden">
          <div className="bg-green-500 p-3 text-white">
            <AlertDialogTitle className="flex items-center gap-2 m-0">
              <Check className="h-5 w-5" /> Added to Cart
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="p-4 text-center">
            Item has been added to your cart successfully!
          </AlertDialogDescription>
          <div className="p-3 bg-gray-50 flex justify-center">
            <Button variant="outline" onClick={() => setShowSuccess(false)} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md flex flex-col">
        <Link to={`/product/${product.id}`} className="overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {product.stock === 0 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                Out of Stock
              </Badge>
            )}
            {/* Discount badge */}
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">20% OFF</Badge>
          </div>
        </Link>

        <CardContent className="flex-1 flex flex-col p-4">
          <Link to={`/product/${product.id}`} className="group">
            <h3 className="text-lg font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Star rating and reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.floor(fakeRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : star === Math.ceil(fakeRating) && fakeRating % 1 !== 0
                        ? "fill-yellow-400/50 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {fakeRating.toFixed(1)} ({fakeReviewCount} reviews)
            </span>
          </div>

          {/* Price section */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold text-red-600">${product.price.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-green-600 font-medium">You save ${(originalPrice - product.price).toFixed(2)}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0 mt-auto">
          <Button
            onClick={handleAdd}
            disabled={product.stock === 0 || isAdding}
            variant={product.stock === 0 ? "secondary" : "default"}
            size="lg"
            className="w-full gap-2 h-12"
          >
            {isAdding ? (
              "Adding…"
            ) : product.stock === 0 ? (
              "Out of stock"
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
