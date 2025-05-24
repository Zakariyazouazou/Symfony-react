import React from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Plus, List, BarChart3 } from "lucide-react"
import { Link } from 'react-router-dom';
interface Props {

}

const Dashbord: React.FC<Props> = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Management System</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Create, manage, and organize your products with ease. Add categories, images, and track inventory all in one
                        place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="mx-auto bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <Plus className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle>Create Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Add new products with detailed information, categories, and images.</p>
                            <Link to="/admin/add-product">
                                <Button className="w-full">Create Product</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="mx-auto bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <List className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle>Manage Inventory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">View, edit, and organize your existing product catalog.</p>
                            <Link to="/admin/product-list">
                                <Button variant="outline" className="w-full">
                                    View Products
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="mx-auto bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle>Track Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Monitor stock levels, pricing, and product performance.</p>
                            <Button variant="outline" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Features */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Dynamic Categories</h4>
                                <p className="text-gray-600">Create and assign multiple categories to products</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Plus className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Multiple Images</h4>
                                <p className="text-gray-600">Add multiple product images with URL support</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Inventory Tracking</h4>
                                <p className="text-gray-600">Monitor stock levels and pricing</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <List className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Auto-Generated Slugs</h4>
                                <p className="text-gray-600">SEO-friendly URLs generated automatically</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashbord;
