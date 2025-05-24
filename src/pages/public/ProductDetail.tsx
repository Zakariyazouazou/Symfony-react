"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProductCard, type Product as ProductList } from "@/components/ProductCard"
import {
    Star,
    Plus,
    Minus,
    ShoppingCart,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Package,
    Shield,
    Truck,
    RotateCcw,
    AlertCircle,
    Loader2,
    Check,
} from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { orderApi } from "@/api/orderApi"
import { useCart } from "@/contexts/CartContext"

export interface Product {
    id: number
    name: string
    slug: string
    description: string
    sku: string
    price: number
    stock: number
    categories: { id: number; name: string; slug: string }[]
    images: { id: number; url: string; altText: string | null }[]
}

interface Review {
    id: number
    name: string
    rating: number
    comment: string
    date: string
    verified: boolean
}

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const { isAuthenticated, userId } = useAuth()
    const { UpdateCartQuantity } = useCart()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [allProducts, setAllProducts] = useState<ProductList[]>([])
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // Generate fake reviews based on product ID
    const generateFakeReviews = (productId: number): Review[] => {
        const names = ["Sarah Johnson", "Mike Chen", "Emma Wilson", "David Brown", "Lisa Garcia", "Tom Anderson"]
        const comments = [
            "Great quality product! Exactly what I was looking for.",
            "Fast shipping and excellent customer service.",
            "Good value for money. Would recommend to others.",
            "Perfect fit and great design. Very satisfied!",
            "Amazing product quality. Will definitely buy again.",
            "Exceeded my expectations. Highly recommended!",
        ]

        return Array.from({ length: 3 + (productId % 3) }, (_, index) => ({
            id: index + 1,
            name: names[index % names.length],
            rating: 4 + Math.floor((productId + index) % 2),
            comment: comments[index % comments.length],
            date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            verified: index % 2 === 0,
        }))
    }

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await api.get(`/api/products/${id}`)
                setProduct(res.data)
            } catch (err: any) {
                console.error("Failed to fetch product:", err)
                setError(err.response?.status === 404 ? "Product not found" : "Failed to load product")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchProduct()
        }
    }, [id])

    // Fetch related products
    useEffect(() => {
        api
            .get("/api/products?limit=3")
            .then((res) => {
                setAllProducts(res.data.data)
            })
            .catch((err) => {
                console.error("Failed to fetch related products:", err)
            })
    }, [])

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
            setQuantity(newQuantity)
        }
    }

    const handleAddToCart = async (id: number) => {
        setIsAddingToCart(true)
        if (!isAuthenticated) {
            navigate("/login")
            setIsAddingToCart(false)
            return
        }
        if (!userId) {
            alert("User is not authenticated")
            setIsAddingToCart(false)
            return
        }
        try {
            const { status } = await orderApi.create(userId, id, quantity)
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
            setIsAddingToCart(false)
        }
    }
    const nextImage = () => {
        if (product?.images) {
            setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
        }
    }

    const prevImage = () => {
        if (product?.images) {
            setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Loading product details...</p>
                    <p className="text-sm text-muted-foreground">Please wait while we fetch the information</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        {error || "The product you are looking for does not exist or has been removed."}
                    </p>
                    <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    const originalPrice = product.price * 1.2
    const savings = originalPrice - product.price
    const averageRating = 4.2 + (product.id % 10) * 0.05
    const reviewCount = 15 + (product.id % 50)
    const fakeReviews = generateFakeReviews(product.id)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <span>Home</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Products</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 lg:items-start">
                    {/* Image Gallery */}
                    <div className="space-y-4 h-full flex flex-col">
                        {/* Main Image */}
                        <div className="relative group flex-grow">
                            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                                <DialogTrigger asChild>
                                    <div className="relative h-full overflow-hidden rounded-xl bg-white shadow-lg cursor-zoom-in flex items-center justify-center">
                                        <img
                                            src={product.images?.[selectedImageIndex]?.url || "/placeholder.svg"}
                                            alt={product.name}
                                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {product.images && product.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        prevImage()
                                                    }}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        nextImage()
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                        <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">20% OFF</Badge>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-full p-0">
                                    <div className="relative aspect-square">
                                        <img
                                            src={product.images?.[selectedImageIndex]?.url || "/placeholder.svg"}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                        {product.images && product.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Thumbnail Images - All images in a row */}
                        {product.images && product.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 flex-nowrap">
                                {product.images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                            ? "border-primary shadow-md"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <img
                                            src={image.url || "/placeholder.svg"}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= Math.floor(averageRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : star === Math.ceil(averageRating) && averageRating % 1 !== 0
                                                    ? "fill-yellow-400/50 text-yellow-400"
                                                    : "fill-gray-200 text-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-red-600">${product.price.toFixed(2)}</span>
                                <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-green-600 font-medium">You save ${savings.toFixed(2)} (20%)</p>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                        </div>

                        {/* Product Details */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">SKU</span>
                                <p className="font-medium">{product.sku}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Stock</span>
                                <p className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                                </p>
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <span className="text-sm font-medium text-muted-foreground mb-2 block">Categories</span>
                            <div className="flex flex-wrap gap-2">
                                {product.categories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary">
                                        {cat.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Quantity</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="px-4 py-3 font-medium min-w-[60px] text-center">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock}
                                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{product.stock} available</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 h-12"
                                    onClick={() => {
                                        handleAddToCart(product.id)
                                    }}

                                    disabled={product.stock === 0 || isAddingToCart}
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-5 w-5 mr-2" />
                                            Add to Cart
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" size="lg" className="h-12">
                                    <Heart className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" size="lg" className="h-12">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <Truck className="h-4 w-4 text-green-600" />
                                <span>Free shipping</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                <span>30-day returns</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-purple-600" />
                                <span>2-year warranty</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-orange-600" />
                                <span>Secure packaging</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success popup using AlertDialog */}
                <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
                    <AlertDialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-green-500 border-2 max-w-[400px] w-[90vw] p-0 overflow-hidden shadow-2xl z-50">
                        <div className="bg-green-500 p-4 text-white">
                            <AlertDialogTitle className="flex items-center gap-2 m-0 text-lg font-semibold">
                                <Check className="h-6 w-6" /> Added to Cart Successfully!
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="p-6 text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-lg font-medium text-gray-900 mb-2">Item added to your cart!</p>
                                <p className="text-sm text-gray-600">
                                    {quantity} x {product?.name} has been added to your cart successfully.
                                </p>
                            </div>
                        </AlertDialogDescription>
                        <div className="p-4 bg-gray-50 flex gap-3">
                            <Button variant="outline" onClick={() => setShowSuccess(false)} className="flex-1">
                                Continue Shopping
                            </Button>
                            <Button onClick={() => navigate("/cart")} className="flex-1">
                                View Cart
                            </Button>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Reviews Section */}
                <Card className="mb-12">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                        <div className="space-y-6">
                            {fakeReviews.map((review) => (
                                <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarFallback>
                                                {review.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">{review.name}</span>
                                                {review.verified && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Verified Purchase
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= review.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "fill-gray-200 text-gray-200"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-muted-foreground">{review.date}</span>
                                            </div>
                                            <p className="text-muted-foreground">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Related Products */}
                {allProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetail
