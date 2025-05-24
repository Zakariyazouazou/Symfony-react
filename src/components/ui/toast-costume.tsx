"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}


const toastContext = {
  toasts: [] as Toast[],
  listeners: [] as ((toasts: Toast[]) => void)[],

  addToast(toast: Omit<Toast, "id">) {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    this.toasts.push(newToast)
    this.notifyListeners()

    // Auto remove after duration
    setTimeout(() => {
      this.removeToast(id)
    }, toast.duration || 5000)
  },

  removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notifyListeners()
  },

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  },

  notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.toasts]))
  },
}

export const toast = {
  success: (title: string, description?: string) => {
    toastContext.addToast({ title, description, type: "success" })
  },
  error: (title: string, description?: string) => {
    toastContext.addToast({ title, description, type: "error" })
  },
  warning: (title: string, description?: string) => {
    toastContext.addToast({ title, description, type: "warning" })
  },
  info: (title: string, description?: string) => {
    toastContext.addToast({ title, description, type: "info" })
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastContext.subscribe(setToasts)
  }, [])

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg transition-all duration-300 ${getBackgroundColor(toast.type)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(toast.type)}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{toast.title}</h4>
                {toast.description && <p className="text-sm text-gray-600 mt-1">{toast.description}</p>}
              </div>
              <button onClick={() => toastContext.removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
