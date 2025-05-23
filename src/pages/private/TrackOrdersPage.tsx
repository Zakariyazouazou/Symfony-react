import React, { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { orderApi, type UserOrderResponse } from '@/api/orderApi'
import { useAuth } from '@/contexts/AuthContext'

const TrackOrdersPage: React.FC = () => {
  const [orderList, setOrderList] = useState<UserOrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { userId } = useAuth()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "wait to pay":
        return "secondary"
      case "paid":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  useEffect(() => {
    const getOrdersTrack = async () => {
      if (!userId) {
        setError("Unable to determine user. Please log in again.")
        setIsLoading(false)
        return
      }

      try {
        const { data, status } = await orderApi.UserOrder(userId)
        if (status === 200) {
          setOrderList(data)
        } else {
          setError(`Unexpected response code: ${status}`)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to fetch orders or they are no order to play . Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    getOrdersTrack()
  }, [userId])

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Orders</h1>
          <p className="text-gray-600">Manage and view your order details</p>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl text-black">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="text-black font-semibold">
                      Order ID
                    </TableHead>
                    <TableHead className="text-black font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-black font-semibold">
                      Customer Email
                    </TableHead>
                    <TableHead className="text-black font-semibold">
                      Total Amount
                    </TableHead>
                    <TableHead className="text-black font-semibold">
                      Created At
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : orderList.length > 0 ? (
                    orderList.map((order) => (
                      <TableRow
                        key={order.order_id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium text-black">
                          #{order.order_id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className="capitalize"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {order.customer_email}
                        </TableCell>
                        <TableCell className="font-semibold text-black">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatDate(order.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-friendly card view */}
        <div className="md:hidden mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600"></div>
          ) : orderList.length > 0 ? (
            orderList.map((order) => (
              <Card key={order.order_id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-black">
                        Order #{order.order_id}
                      </span>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="text-black">
                          {order.customer_email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-black">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-black">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-4">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackOrdersPage
