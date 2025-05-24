"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Save, X, Package, Search, Plus, Edit } from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/api/axios"
import { ProductApi } from "@/api/ProductApi"


// Custom Toast Component
interface ToastProps {
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }[type]

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50 max-w-md`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([])

  const addToast = (type: ToastProps["type"], title: string, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, title, message, onClose: () => removeToast(id) }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const toast = {
    success: (title: string, message: string) => addToast("success", title, message),
    error: (title: string, message: string) => addToast("error", title, message),
    warning: (title: string, message: string) => addToast("warning", title, message),
    info: (title: string, message: string) => addToast("info", title, message),
  }

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  )

  return { toast, ToastContainer }
}

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  sku: string
  price: number
  stock: number
  categories: Category[]
  images: string[]
}

interface EditingProduct {
  id: number
  name: string
  sku: string
  price: string
  stock: string
}

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null)
  const [savingProductId, setSavingProductId] = useState<number | null>(null)
  const { toast, ToastContainer } = useToast()


  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Replace with your actual API call
        const res = await api.get('/api/products')
        setProducts(res.data.data)

        // Mock delay
        // await new Promise((resolve) => setTimeout(resolve, 1000))
        // setProducts(mockProducts)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        toast.error("Failed to load products", "Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories.some((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Start editing a product
  const startEditing = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingProduct(null)
  }

  // Update editing product field
  const updateEditingField = (field: keyof Omit<EditingProduct, "id">, value: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: value,
      })
    }
  }

  // Validate editing data
  const validateEditingData = (): boolean => {
    if (!editingProduct) return false

    if (!editingProduct.name.trim()) {
      toast.error("Validation Error", "Product name cannot be empty.")
      return false
    }

    if (!editingProduct.sku.trim()) {
      toast.error("Validation Error", "SKU cannot be empty.")
      return false
    }

    const price = Number.parseFloat(editingProduct.price)
    if (isNaN(price) || price < 0) {
      toast.error("Validation Error", "Price must be a valid positive number.")
      return false
    }

    const stock = Number.parseInt(editingProduct.stock)
    if (isNaN(stock) || stock < 0) {
      toast.error("Validation Error", "Stock must be a valid non-negative number.")
      return false
    }

    return true
  }

  // Save product changes
  const saveProduct = async () => {
    if (!editingProduct || !validateEditingData()) return

    setSavingProductId(editingProduct.id)

    try {
      // Prepare data for API
      const updatedData = {
        id: editingProduct.id,
        name: editingProduct.name.trim(),
        sku: editingProduct.sku.trim(),
        price: Number.parseFloat(editingProduct.price),
        stock: Number.parseInt(editingProduct.stock),
      }

      console.log("Updating product:", updatedData)
      const response = await ProductApi.FastProductCategory(updatedData, updatedData.id)

      console.log("this is your response", response)
      // FastProductCategory
      // Replace with your actual API call
      // await api.put(`/api/products/${editingProduct.id}`, updatedData)

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProduct.id
            ? {
              ...product,
              name: updatedData.name,
              sku: updatedData.sku,
              price: updatedData.price,
              stock: updatedData.stock,
            }
            : product,
        ),
      )

      toast.success("Product Updated", `"${updatedData.name}" has been updated successfully.`)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Update Failed", "Failed to update product. Please try again.")
    } finally {
      setSavingProductId(null)
    }
  }

  // Truncate text for display
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your products with inline editing</p>
            </div>
            <Link to="/admin/add-product">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first product."}
                </p>
                {!searchTerm && (
                  <Link to="/products/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">MainEdit</TableHead>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead className="min-w-[300px]">Product Name</TableHead>
                      <TableHead className="w-32">SKU</TableHead>
                      <TableHead className="w-24">Price</TableHead>
                      <TableHead className="w-20">Stock</TableHead>
                      <TableHead className="w-32">Categories</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const isEditing = editingProduct?.id === product.id
                      const isSaving = savingProductId === product.id

                      return (
                        <TableRow key={product.id} className="hover:bg-gray-50">
                          {/* Product Image */}
                          <TableCell>
                            <Link to={`/admin/updateProduct/${product.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                          {/* Product Image */}
                          <TableCell>
                            <div className="w-16 h-16 rounded-lg overflow-hidden border">
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=64&width=64"
                                }}
                              />
                            </div>
                          </TableCell>

                          {/* Product Name */}
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editingProduct.name}
                                onChange={(e) => updateEditingField("name", e.target.value)}
                                className="w-full"
                                placeholder="Product name"
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(product)}
                                title="Click to edit"
                              >
                                <div className="font-medium text-gray-900">{truncateText(product.name, 60)}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  Click to edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* SKU */}
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editingProduct.sku}
                                onChange={(e) => updateEditingField("sku", e.target.value)}
                                className="w-full"
                                placeholder="SKU"
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(product)}
                                title="Click to edit"
                              >
                                <div className="font-mono text-sm">{product.sku}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* Price */}
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingProduct.price}
                                onChange={(e) => updateEditingField("price", e.target.value)}
                                className="w-full"
                                placeholder="0.00"
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(product)}
                                title="Click to edit"
                              >
                                <div className="font-semibold text-green-600">${product.price.toFixed(2)}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* Stock */}
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                value={editingProduct.stock}
                                onChange={(e) => updateEditingField("stock", e.target.value)}
                                className="w-full"
                                placeholder="0"
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(product)}
                                title="Click to edit"
                              >
                                <div className="font-medium">{product.stock}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* Categories */}
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {product.categories.map((category) => (
                                <Badge key={category.id} variant="secondary" className="text-xs">
                                  {category.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button size="sm" onClick={saveProduct} disabled={isSaving} className="h-8 w-8 p-0">
                                  {isSaving ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  ) : (
                                    <Save className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                  disabled={isSaving}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(product)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTable
