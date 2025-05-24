"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ShoppingCart, Search, Trash2, Eye, Package, DollarSign, User, X } from "lucide-react"
import { orderApi } from "@/api/orderApi"

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

// Interfaces - adjust these to match your actual types
interface OrderListe {
  order_id: number
  order_name: string
  status: string
  total_amount: number
  total_quantity: number
  created_at?: string
  customer_name?: string
  customer_email?: string
}

interface ItemsDependOrder {
  item_id: number
  product_id: number
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
}



const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<OrderListe[]>([])
  const [orderItem, setOrderItem] = useState<ItemsDependOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toast, ToastContainer } = useToast()

  const allStatus = ["paid", "wait to pay", "cancelled",  "shipped"]

  useEffect(() => {
    const getAllOrder = async () => {
      try {
        setLoading(true)
        const response = await orderApi.AllOrder()
        const { data, status } = response
        if (status === 200) {
          setOrders(data)
        }
        console.log(response)
      } catch (error) {
        console.error(error)
        toast.error("Failed to load orders", "Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    getAllOrder()
  }, [])

  // Get single order items
  const SingleUserOrder = async (orderId: number) => {
    try {
      setLoadingItems(true)
      setSelectedOrderId(orderId)
      setDrawerOpen(true)

      const response = await orderApi.GetItemsSingleOrder(orderId)
      const { data, status } = response
      if (status === 200) {
        setOrderItem(data)
      }
    } catch (error) {
      console.log("error")
      toast.error("Failed to load order items", "Please try again.")
    } finally {
      setLoadingItems(false)
    }
  }

  // Delete specific order
  const clearCart = async (orderId: number, orderName: string) => {
    if (!confirm(`Are you sure you want to delete ${orderName}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingOrder(orderId)
      const response = await orderApi.ClearAllOrders(orderId)
      if (response.status === 200) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.order_id !== orderId))
        toast.success("Order Deleted", `${orderName} has been deleted successfully.`)
      }
    } catch (error) {
      console.error("Error removing order:", error)
      toast.error("Failed to delete order", "Please try again.")
    } finally {
      setDeletingOrder(null)
    }
  }

  // Update order status
  const UpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      const response = await orderApi.UpdateStatus(orderId, newStatus)
      const { data, status } = response
      console.log("this is the update form the status" , data)
      if (status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.order_id === orderId ? { ...order, status: newStatus } : order)),
        )
        toast.success("Status Updated", `Order status changed to ${newStatus}`)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status", "Please try again.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default"
      case "shipped":
        return "secondary"
      case "wait to pay":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

 
  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toString().includes(searchTerm) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black  mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
              <p className="text-gray-600">Manage customer orders and track their status</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {allStatus.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "No orders have been placed yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Order ID</TableHead>
                      <TableHead className="min-w-[200px]">Customer</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-32">Amount</TableHead>
                      <TableHead className="w-24">Quantity</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const isUpdating = updatingStatus === order.order_id
                      const isDeleting = deletingOrder === order.order_id

                      return (
                        <TableRow
                          key={order.order_id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            // Don't trigger row click if clicking on select or buttons
                            const target = e.target as HTMLElement
                            if (!target.closest("button") && !target.closest('[role="combobox"]')) {
                              SingleUserOrder(order.order_id)
                            }
                          }}
                        >
                          {/* Order ID */}
                          <TableCell>
                            <div className="font-mono text-sm font-medium">#{order.order_id}</div>
                          </TableCell>

                          {/* Customer */}
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{order.customer_name || order.order_name}</div>
                              {order.customer_email && (
                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                              )}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) => UpdateOrderStatus(order.order_id, newStatus)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge variant={getStatusVariant(order.status)} className="capitalize">
                                    {isUpdating ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                                    ) : null}
                                    {order.status}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {allStatus.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <Badge variant={getStatusVariant(status)} className="capitalize">
                                      {status}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* Amount */}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-green-600">${order.total_amount.toFixed(2)}</span>
                            </div>
                          </TableCell>

                          {/* Quantity */}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span>{order.total_quantity}</span>
                            </div>
                          </TableCell>

                      

                          {/* Actions */}
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  SingleUserOrder(order.order_id)
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  clearCart(order.order_id, order.order_name)
                                }}
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
        {filteredOrders.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {filteredOrders.length} of {orders.length} orders
            {(searchTerm || statusFilter !== "all") && " (filtered)"}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    ${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {orders.reduce((sum, order) => sum + order.total_quantity, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{orders.filter((order) => order.status === "paid").length}</div>
                  <div className="text-sm text-gray-600">Paid Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent className="w-[600px] sm:w-[800px] overflow-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{selectedOrderId} Items
              </SheetTitle>
              <SheetDescription>View all items in this order</SheetDescription>
            </SheetHeader>

            <div className="mt-6">
              {loadingItems ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading items...</p>
                  </div>
                </div>
              ) : orderItem.length > 0 ? (
                <div className="space-y-4">
                  {orderItem.map((item) => (
                    <Card key={item.item_id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0">
                            <img
                              src={item.product_image || "/placeholder.svg"}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=80&width=80"
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.product_name}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Product ID:</span> #{item.product_id}
                              </div>
                              <div>
                                <span className="font-medium">Item ID:</span> #{item.item_id}
                              </div>
                              <div>
                                <span className="font-medium">Unit Price:</span> ${item.unit_price.toFixed(2)}
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span> {item.quantity}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900">Total Price:</span>
                                <span className="font-bold text-green-600 text-lg">${item.total_price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Order Summary */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-600">Total Items: {orderItem.length}</div>
                          <div className="text-sm text-gray-600">
                            Total Quantity: {orderItem.reduce((sum, item) => sum + item.quantity, 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            Total: ${orderItem.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No items found for this order</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default OrdersList
