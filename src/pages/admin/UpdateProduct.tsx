import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Package, DollarSign, Tag, ImageIcon, Trash2, Save, ArrowLeft, Plus } from "lucide-react"
import { toast } from "@/components/ui/toast-costume"
import api from '@/api/axios';
import type { Product } from '../public/ProductDetail';
import { ProductApi, type categorieChild } from "@/api/ProductApi"

interface Props {

}


interface Category {
    id: number
    name: string
    slug?: string
    description?: string
    createdAt?: string
    updatedAt?: string
}

interface ProductImage {
    id: number
    filename: string
    url: string
    altText?: string | null
    position?: number | null
    createdAt: string | null
}



interface ProductFormData {
    name: string
    slug: string
    description: string
    sku: string
    price: string
    stock: string
    categories: Category[]
    images: ProductImage[]
}




const UpdateProduct: React.FC<Props> = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [product, setProduct] = useState<Product | null>(null)

    const [availableCategories, setAvailableCategories] = useState<Category[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})


    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        slug: "",
        description: "",
        sku: "",
        price: "",
        stock: "",
        categories: [],
        images: [],
    })

    // Function to explicitly add a new image input
    const addImageInput = () => {
        setFormData(prev => ({
            ...prev,
            images: [
                ...prev.images,
                { id: 0, filename: "", url: "", altText: "", position: null, createdAt: null }
            ]
        }))
    }



    // Fetch available categories
    useEffect(() => {
        api
            .get("/api/categories")
            .then((res) => setAvailableCategories(res.data.data))
            .catch((error) => {
                console.error("Failed to load categories:", error)
                toast.error("Failed to load categories", "Some features may not work properly.")
            })
    }, [])

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await api.get(`/api/products/${id}`)

                setProduct(res.data)


                // Populate form with product data
                const productData = res.data
                setFormData({
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description,
                    sku: productData.sku,
                    price: productData.price.toString(),
                    stock: productData.stock.toString(),
                    categories: productData.categories.map((cat: Category) => ({
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description,
                        createdAt: cat.createdAt,
                        updatedAt: cat.updatedAt,
                    })),
                    images: [...productData.images.map((img: ProductImage) => {
                        return {
                            "id": img.id,
                            "filename": img.filename,
                            "url": img.url,
                            "altText": null,
                            "position": null,
                            "createdAt": img.createdAt
                        }
                    })],
                })
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



    // Handle input changes
    const handleInputChange = (field: keyof ProductFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    // Handle image input changes
    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images]
        // If image at index doesn't exist, prevent crashing
        if (!newImages[index]) return

        // Update the URL
        newImages[index] = {
            ...newImages[index],
            url: value,
        }

        // If it's the last image and it's not empty, add a new empty image entry
        if (index === newImages.length - 1 && value.trim() !== "") {
            newImages.push({
                id: 0,
                filename: "",
                url: "",
                altText: "",
                position: null,
                createdAt: null,
            })
        }


        setFormData((prev) => ({ ...prev, images: newImages }))
    }

    // Remove image input
    const removeImageInput = (index: number) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index)
            setFormData((prev) => ({ ...prev, images: newImages }))
        }
    }

    // Add category to selection
    const addCategory = (categoryId: string) => {
        const newCategory = availableCategories.find(
            (cat) => cat.id.toString() === categoryId
        )
        if (!newCategory) return

        const exists = formData.categories.some(
            (cat) => cat.id === newCategory.id
        )

        if (!exists) {
            setFormData((prev) => ({
                ...prev,
                categories: [...prev.categories, newCategory],
            }))
        }
    }
    // Remove category from selection
    const removeCategory = (categoryId: number) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((cat) => cat.id !== categoryId),
        }))
    }

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Product name is required"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Product description is required"
        }

        if (!formData.price.trim()) {
            newErrors.price = "Price is required"
        } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            newErrors.price = "Price must be a valid positive number"
        }

        if (!formData.stock.trim()) {
            newErrors.stock = "Stock quantity is required"
        } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
            newErrors.stock = "Stock must be a valid non-negative number"
        }

        if (formData.categories.length === 0) {
            newErrors.categories = "At least one category is required"
        }

        const urls = formData.images
            .map((img) => img.url?.trim() ?? "")
            .filter((u) => u.length > 0)

        // 2) You need at least one URL
        if (urls.length === 0) {
            newErrors.images = "At least one image URL is required"
        } else {
            // 3) Validate each of your non-empty URLs
            const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
            const invalid = urls.filter((u) => !urlPattern.test(u))

            if (invalid.length > 0) {
                newErrors.images =
                    "All image URLs must be valid and end with .jpg, .jpeg, .png, .gif, or .webp"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Validation Error", "Please fix the errors in the form before submitting.")
            return
        }

        setIsSubmitting(true)

        try {
            // Prepare data for API
            const validImages = formData.images.filter((img) => img.url?.trim() !== "")


            // 1. find all matching categories by id
            const categoryObjects: categorieChild[] = formData.categories
                .map(cat => availableCategories.find(c => c.id === cat.id))
                .filter((c): c is categorieChild => c !== undefined);

            const productData = {
                id: product?.id as number,
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                description: formData.description.trim(),
                sku: formData.sku.trim(),
                price: Number.parseFloat(formData.price),
                stock: Number.parseInt(formData.stock),
                categories: categoryObjects,
                images: validImages
                    .filter(img => img.url && img.url.trim() !== '') // filter out images without url or empty url
                    .map((img, index) => ({
                        ...(img.id ? { id: img.id } : {}),
                        url: img.url,
                        filename: img.filename || `image-${index + 1}.jpg`,
                        altText: img.altText ?? null,
                        position: img.position ?? index,
                    })),
            }


            if (!id) return toast.error("Failed to update product", "Please try again.")
            if (categoryObjects.length === 0) return toast.error("Failed to update product", "Please try again.")

            const CategoryResponse = await ProductApi.UpdateProductCategory(categoryObjects, id)

            const response = await ProductApi.updateProduct(productData, id)
            const { status } = response
            const { status: CategoryResponseStatus } = CategoryResponse

            if (status === 200 && CategoryResponseStatus === 200) {
                toast.success("Product Updated Successfully!", `Product "${productData.name}" has been updated.`)
                // Reload the page to show updated data
                window.location.reload()
            } else {
                throw new Error("Failed to update product")
            }

        } catch (error) {
            console.error("Error updating product:", error)
            toast.error("Failed to update product", "Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle product deletion
    const handleDelete = async () => {
        setIsDeleting(true)

        try {
            if (!id) return toast.error("Failed", "Failed to delete product")
            console.log("start deleting")
            const response = await ProductApi.DeleteProduct(id)
            const { status } = response
            if (status === 200) {
                toast.success("Product Deleted", "The product has been successfully deleted.")
                // Navigate back to products list
                navigate("/admin/product-list")
            } else {
                throw new Error("Failed to delete product")
            }
        } catch (error) {
            console.error("Error deleting product:", error)
            toast.error("Failed to delete product", "Please try again.")
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading product...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link to="/products">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // get the product full details
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/admin/product-list">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Products
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Product</h1>
                    <p className="text-gray-600">Modify the product details and save your changes.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Enter product name"
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="slug">Product Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange("slug", e.target.value)}
                                        placeholder="product-slug"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Enter product description"
                                    rows={4}
                                    className={errors.description ? "border-red-500" : ""}
                                />
                                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleInputChange("sku", e.target.value)}
                                    placeholder="Enter SKU"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing & Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing & Inventory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange("price", e.target.value)}
                                        placeholder="0.00"
                                        className={errors.price ? "border-red-500" : ""}
                                    />
                                    {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="stock">Stock Quantity *</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => handleInputChange("stock", e.target.value)}
                                        placeholder="0"
                                        className={errors.stock ? "border-red-500" : ""}
                                    />
                                    {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Select Categories *</Label>
                                <Select onValueChange={addCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories
                                            .filter(
                                                (cat) =>
                                                    !formData.categories.some(
                                                        (selected) => selected.id === cat.id
                                                    )
                                            )
                                            .map((category) => {
                                                return (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                )
                                            })}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">You can only select from existing categories</p>
                            </div>

                            {formData.categories.length > 0 && (
                                <div>
                                    <Label>Selected Categories</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.categories.map((category) => (
                                            <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
                                                {category.name}
                                                <X
                                                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                    onClick={() => removeCategory(category.id)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Product Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Image URLs *</Label>
                                <p className="text-sm text-gray-500 mb-3">Enter image URLs. At least one image is required.</p>

                                <div className="space-y-3">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={image.url}
                                                onChange={(e) => handleImageChange(index, e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1"
                                            />
                                            {formData.images.length > 1 && (
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeImageInput(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    {/* Explicit Add Image Button */}
                                    <Button type="button" variant="outline" onClick={addImageInput} className="mt-2 flex items-center gap-1">
                                        <Plus className="h-4 w-4" />
                                        Add Image
                                    </Button>
                                </div>

                                {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
                            </div>


                            {/* Image Preview */}
                            {formData.images.some((img) => img.url.trim() !== "") && (
                                <div>
                                    <Label>Image Preview</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        {formData.images
                                            .filter((img) => img.url?.trim().length > 0)
                                            .map((image, index) => (
                                                <div key={index} className="aspect-square border rounded-lg overflow-hidden">
                                                    <img
                                                        src={image.url || "/placeholder.svg"}
                                                        alt={image.altText || `Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.src = "/placeholder.svg?height=200&width=200"
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Product
                        </Button>

                        <div className="flex gap-4">
                            <Link to="/admin/product-list">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting} className="min-w-[120px] flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete "{product?.name}"? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="min-w-[100px]">
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpdateProduct;
