"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Package, DollarSign, Tag, ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/toast-costume"
import api from "@/api/axios"
import { categorieApi } from "@/api/categorieApi"
import { ProductApi } from "@/api/ProductApi"



interface Category {
  id: number
  name: string
  slug?: string
}

interface CategoriesResponse {
  status: string
  total: number
  data: Category[]
}


interface ProductFormData {
  name: string
  slug: string
  description: string
  sku: string
  price: string
  stock: string
  categories: string[]
  images: string[]
}

const AddProduct = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    sku: "",
    price: "",
    stock: "",
    categories: [],
    images: [""],
  })

  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {

    api
      .get<CategoriesResponse>("/api/categories")
      .then((res) => setAvailableCategories(res.data.data))
      .catch((error) => {
        console.error("Failed to load categories:", error)
        toast.error("Failed to load categories", "Please refresh the page to try again.")
      })
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const autoSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug: autoSlug }))
    }
  }, [formData.name, formData.slug])

  // Generate slug manually
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

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
    newImages[index] = value

    // Add new empty input if this is the last one and it's not empty
    if (index === newImages.length - 1 && value.trim() !== "") {
      newImages.push("")
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
  const addCategory = (categoryName: string) => {
    if (!formData.categories.includes(categoryName)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, categoryName],
      }))
    }
  }

  // Remove category from selection (only from selected categories, not from available categories)
  const removeCategory = (categoryName: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryName),
    }))
  }

  // Create new category
  const createNewCategory = async () => {
    const trimmedName = newCategoryName.trim()

    if (!trimmedName) {
      toast.warning("Category name required", "Please enter a category name.")
      return
    }

    // Check if category already exists (case-insensitive)
    const categoryExists = availableCategories.find((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())

    if (categoryExists) {
      toast.warning("Category already exists", `"${trimmedName}" is already in your categories.`)
      setNewCategoryName("")
      return
    }

    setIsCreatingCategory(true)

    try {
      const response = await categorieApi.createCategorie(trimmedName, "", "")
      const { data, status } = response
      if (status === 201) {
        const newCategory = {
          id: data.category.id,
          name: data.category.name,
          slug: data.category.slug,
        }

        // Add to available categories
        setAvailableCategories((prev) => [...prev, newCategory])

        // Add to selected categories
        addCategory(newCategory.name)

        // Clear input
        setNewCategoryName("")

        toast.success("Category Created", `"${newCategory.name}" has been added to your categories.`)

        console.log("Created category:", data.category)
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Failed to create category", "Please try again.")
    } finally {
      setIsCreatingCategory(false)
    }
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

    const validImages = formData.images.filter((img) => img.trim() !== "")
    if (validImages.length === 0) {
      newErrors.images = "At least one image URL is required"
    } else {
      // Validate image URLs
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
      const invalidImages = validImages.filter((img) => !urlPattern.test(img))
      if (invalidImages.length > 0) {
        newErrors.images = "All image URLs must be valid and end with .jpg, .jpeg, .png, .gif, or .webp"
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
      const validImages = formData.images.filter((img) => img.trim() !== "")
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        categories: formData.categories,
        images: validImages,
      }

      console.log("Sending product data:", [productData])

      const response = await ProductApi.createProduct([productData])
      const { data, status } = response

      if (status === 201) {
        // Reset form
        setFormData({
          name: "",
          slug: "",
          description: "",
          sku: "",
          price: "",
          stock: "",
          categories: [],
          images: [""],
        })

        toast.success("Product Created Successfully!", `Product "${productData.name}" has been created.`)

        console.log("Created product with ID:", data[0].id)
        // You can navigate to update page here: navigate(`/admin/updateProduct/${data[0].id}`)
      } else {
        throw new Error("Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("Failed to create product", "Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-gray-600">Add a new product to your inventory with all the necessary details.</p>
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
                    placeholder="auto-generated-from-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from name if left empty</p>
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
                <Label htmlFor="sku">SKU (Optional)</Label>
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
                      .filter((cat) => !formData.categories.includes(cat.name))
                      .map((category) => {
                        // console.log(category);
                        return (<SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>)
                      })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Create New Category</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), createNewCategory())}
                    disabled={isCreatingCategory}
                  />
                  <Button
                    type="button"
                    onClick={createNewCategory}
                    disabled={!newCategoryName.trim() || isCreatingCategory}
                    variant="outline"
                  >
                    {isCreatingCategory ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {formData.categories.length > 0 && (
                <div>
                  <Label>Selected Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeCategory(category)}
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
                        value={image}
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
                </div>

                {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
              </div>

              {/* Image Preview */}
              {formData.images.some((img) => img.trim() !== "") && (
                <div>
                  <Label>Image Preview</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {formData.images
                      .filter((img) => img.trim() !== "")
                      .map((image, index) => (
                        <div key={index} className="aspect-square border rounded-lg overflow-hidden">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: "",
                  slug: "",
                  description: "",
                  sku: "",
                  price: "",
                  stock: "",
                  categories: [],
                  images: [""],
                })
                setErrors({})
                toast.info("Form Reset", "All form fields have been cleared.")
              }}
            >
              Reset Form
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProduct
