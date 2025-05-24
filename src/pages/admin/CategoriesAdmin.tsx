"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Save, X, Tag, Search, Plus, Trash2 } from "lucide-react"
import api from "@/api/axios"
import { categorieApi } from "@/api/categorieApi"

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
  name: string | null
  slug: string | null
  description: string
}

interface CategoriesResponse {
  status: string
  total: number
  data: Category[]
}

interface EditingCategory {
  id: number
  name: string
  slug: string
  description: string
}

interface NewCategory {
  name: string
  slug: string
  description: string
}

const CategoriesAdmin: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
  const [savingCategoryId, setSavingCategoryId] = useState<number | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
    slug: "",
    description: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const { toast, ToastContainer } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true)
        // Replace with your actual API call
        const res = await api.get<CategoriesResponse>("/api/categories")
        setCategories(res.data.data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories", "Please try again later.")
      } finally {
        setLoadingCats(false)
      }
    }

    fetchCategories()
  }, [])

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Start editing a category
  const startEditing = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
    })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingCategory(null)
  }

  // Update editing category field
  const updateEditingField = (field: keyof Omit<EditingCategory, "id">, value: string) => {
    if (editingCategory) {
      const updatedCategory = {
        ...editingCategory,
        [field]: value,
      }

      // Auto-generate slug when name changes
      if (field === "name") {
        updatedCategory.slug = generateSlug(value)
      }

      setEditingCategory(updatedCategory)
    }
  }

  // Update new category field
  const updateNewCategoryField = (field: keyof NewCategory, value: string) => {
    const updatedCategory = {
      ...newCategory,
      [field]: value,
    }

    // Auto-generate slug when name changes
    if (field === "name") {
      updatedCategory.slug = generateSlug(value)
    }

    setNewCategory(updatedCategory)
  }

  // Validate category data
  const validateCategoryData = (data: { name: string; slug: string; description: string }): boolean => {
    if (!data.name.trim()) {
      toast.error("Validation Error", "Category name is required.")
      return false
    }

    // Check for duplicate names (excluding current category when editing)
    const duplicateName = categories.find(
      (cat) => cat.name?.toLowerCase() === data.name.trim().toLowerCase() && cat.id !== editingCategory?.id,
    )

    if (duplicateName) {
      toast.error("Validation Error", "A category with this name already exists.")
      return false
    }

    // Check for duplicate slugs (excluding current category when editing)
    const duplicateSlug = categories.find(
      (cat) => cat.slug?.toLowerCase() === data.slug.trim().toLowerCase() && cat.id !== editingCategory?.id,
    )

    if (duplicateSlug) {
      toast.error("Validation Error", "A category with this slug already exists.")
      return false
    }

    return true
  }

  // Save category changes
  const saveCategory = async () => {
    if (!editingCategory || !validateCategoryData(editingCategory)) return

    setSavingCategoryId(editingCategory.id)

    try {
      const updatedData = {
        id: editingCategory.id,
        name: editingCategory.name.trim(),
        slug: editingCategory.slug.trim(),
        description: editingCategory.description.trim(),
      }

      const response = await categorieApi.UpdateCategorie(updatedData.id, updatedData.name, updatedData.description, updatedData.slug)
      const { status } = response
      if (status === 200) {
        // Update local state
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === editingCategory.id
              ? {
                ...category,
                name: updatedData.name,
                slug: updatedData.slug,
                description: updatedData.description,
              }
              : category,
          ),
        )
        toast.success("Category Updated", `"${updatedData.name}" has been updated successfully.`)
        setEditingCategory(null)
      } else {
        toast.error("Update Failed", "Failed to update category. Please try again.")
      }

    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Update Failed", "Failed to update category. Please try again.")
    } finally {
      setSavingCategoryId(null)
    }
  }

  // Create new category
  const createCategory = async () => {
    if (!validateCategoryData(newCategory)) return

    setIsCreating(true)

    try {
      const categoryData = {
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim(),
        description: newCategory.description.trim(),
      }

      console.log("Creating category:", categoryData)

      const response = await categorieApi.createCategorie(categoryData.name, categoryData.description, categoryData.slug)
      const { status, data } = response

      if (status === 201) {

        console.log("this is your data", data)

        setCategories((prevCategories) => [...prevCategories, data.category])
        toast.success("Category Created", `"${categoryData.name}" has been created successfully.`)
        setNewCategory({ name: "", slug: "", description: "" })
        setShowAddForm(false)
      } else {
        toast.error("Creation Failed", "Failed to create category. Please try again.")
      }

    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Creation Failed", "Failed to create category. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingCategoryId(categoryId)

    try {
      console.log("Deleting category:", categoryId)
      const response = await categorieApi.DeleteCategorie(categoryId)
      const { status } = response
      if (status === 200) {
        // Update local state
        setCategories((prevCategories) => prevCategories.filter((category) => category.id !== categoryId))
        toast.success("Category Deleted", `"${categoryName}" has been deleted successfully.`)
      } else {
        toast.error("Deletion Failed", "Failed to delete category. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Deletion Failed", "Failed to delete category. Please try again.")
    } finally {
      setDeletingCategoryId(null)
    }
  }

  // Cancel add form
  const cancelAddForm = () => {
    setNewCategory({ name: "", slug: "", description: "" })
    setShowAddForm(false)
  }

  if (loadingCats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => updateNewCategoryField("name", e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <Input
                    value={newCategory.slug}
                    onChange={(e) => updateNewCategoryField("slug", e.target.value)}
                    placeholder="category-slug"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={newCategory.description}
                  onChange={(e) => updateNewCategoryField("description", e.target.value)}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createCategory} disabled={isCreating} className="flex items-center gap-2">
                  {isCreating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isCreating ? "Creating..." : "Create Category"}
                </Button>
                <Button variant="outline" onClick={cancelAddForm} disabled={isCreating}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first category."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead className="min-w-[200px]">Name</TableHead>
                      <TableHead className="min-w-[200px]">Slug</TableHead>
                      <TableHead className="min-w-[300px]">Description</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const isEditing = editingCategory?.id === category.id
                      const isSaving = savingCategoryId === category.id
                      const isDeleting = deletingCategoryId === category.id

                      return (
                        <TableRow key={category.id} className="hover:bg-gray-50">
                          {/* ID */}
                          <TableCell>
                            <div className="font-mono text-sm text-gray-600">{category.id}</div>
                          </TableCell>

                          {/* Name */}
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editingCategory.name}
                                onChange={(e) => updateEditingField("name", e.target.value)}
                                className="w-full"
                                placeholder="Category name"
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(category)}
                                title="Click to edit"
                              >
                                <div className="font-medium text-gray-900">{category.name || "Unnamed"}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  Click to edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* Slug */}
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editingCategory.slug}
                                onChange={(e) => updateEditingField("slug", e.target.value)}
                                className="w-full"
                                placeholder="category-slug"
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(category)}
                                title="Click to edit"
                              >
                                <div className="font-mono text-sm">{category.slug || "No slug"}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* Description */}
                          <TableCell>
                            {isEditing ? (
                              <Textarea
                                value={editingCategory.description}
                                onChange={(e) => updateEditingField("description", e.target.value)}
                                className="w-full"
                                placeholder="Category description"
                                rows={2}
                              />
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                                onClick={() => startEditing(category)}
                                title="Click to edit"
                              >
                                <div className="text-sm text-gray-700">{category.description || "No description"}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </div>
                              </div>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button size="sm" onClick={saveCategory} disabled={isSaving} className="h-8 w-8 p-0">
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
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(category)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteCategory(category.id, category.name || "Unnamed")}
                                  disabled={isDeleting}
                                  className="h-8 w-8 p-0"
                                >
                                  {isDeleting ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
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
        {filteredCategories.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {filteredCategories.length} of {categories.length} categories
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesAdmin
