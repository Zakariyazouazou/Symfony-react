"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Mail, Calendar, Shield, MoreHorizontal, Edit2, Trash2, Ban, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserApi } from "@/api/userApi"

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
          <MoreHorizontal className="h-4 w-4" />
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

// User interface - adjust this to match your actual UserRequest interface
interface UserRequest {
  id: number
  firstName: string
  lastName: string
  email: string
  roles: string[] | string // Could be array or string
  avatar?: string
  status?: "active" | "inactive" | "banned"
  createdAt?: string
  lastLogin?: string
  phone?: string
}



const UsersList: React.FC = () => {
  const [userList, setUserList] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast, ToastContainer } = useToast()

  useEffect(() => {
    const getUserList = async () => {
      try {
        setLoading(true)
        const response = await UserApi.UserList()
        const { data, status } = response
        if (status === 200) {
          setUserList(data)
        }
        console.log(response)
      } catch (error) {
        console.error(error)
        toast.error("Failed to load users", "Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getUserList()
  }, [])

  // Get user initials for avatar
  const getUserInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format roles
  const formatRoles = (roles: string[] | string): string[] => {
    if (Array.isArray(roles)) return roles
    if (typeof roles === "string") return [roles]
    return []
  }

  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "banned":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get all unique roles for filter
  const getAllRoles = (): string[] => {
    const roles = new Set<string>()
    userList.forEach((user) => {
      formatRoles(user.roles).forEach((role) => roles.add(role))
    })
    return Array.from(roles)
  }

  // Filter users
  const filteredUsers = userList.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || formatRoles(user.roles).includes(roleFilter)

    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Handle user actions
  const handleUserAction = (action: string, user: UserRequest) => {
    switch (action) {
      case "edit":
        toast.info("Edit User", `Opening edit form for ${user.firstName} ${user.lastName}`)
        break
      case "delete":
        if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
          toast.success("User Deleted", `${user.firstName} ${user.lastName} has been deleted`)
        }
        break
      case "ban":
        toast.warning("User Banned", `${user.firstName} ${user.lastName} has been banned`)
        break
      case "activate":
        toast.success("User Activated", `${user.firstName} ${user.lastName} has been activated`)
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
              <p className="text-gray-600">Manage your application users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {getAllRoles().map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "No users have been added yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Avatar</TableHead>
                      <TableHead className="min-w-[200px]">Name</TableHead>
                      <TableHead className="min-w-[250px]">Email</TableHead>
                      <TableHead className="w-32">Roles</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-32">Joined</TableHead>
                      <TableHead className="w-32">Last Login</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        {/* Avatar */}
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getUserInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>

                        {/* Roles */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {formatRoles(user.roles).map((role, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={getStatusVariant(user.status)} className="capitalize">
                            {user.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {user.status === "banned" && <Ban className="h-3 w-3 mr-1" />}
                            {user.status || "unknown"}
                          </Badge>
                        </TableCell>

                        {/* Joined Date */}
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </TableCell>

                        {/* Last Login */}
                        <TableCell>
                          <div className="text-sm text-gray-600">{formatDate(user.lastLogin)}</div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUserAction("edit", user)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              {user.status === "active" ? (
                                <DropdownMenuItem onClick={() => handleUserAction("ban", user)}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserAction("activate", user)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleUserAction("delete", user)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {filteredUsers.length} of {userList.length} users
            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && " (filtered)"}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{userList.length}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{userList.filter((u) => u.status === "active").length}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {userList.filter((u) => formatRoles(u.roles).includes("admin")).length}
                  </div>
                  <div className="text-sm text-gray-600">Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{userList.filter((u) => u.status === "banned").length}</div>
                  <div className="text-sm text-gray-600">Banned Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UsersList
