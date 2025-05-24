import { Link } from 'react-router-dom'
import {
    Home,
    PlusCircle,
    Users,
    ClipboardList,
    Tag,
    AlignLeft,
    } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'



export function UserButton() {

    const { role } = useAuth()


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    {role === 'admin' && 'Admin Panel'}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent sideOffset={4} className="w-56">
                {role === 'admin' && (
                    <>
                        <DropdownMenuLabel>Administration</DropdownMenuLabel>

                        <DropdownMenuItem asChild >
                            <Link to="/admin">
                                <Home className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Products
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent sideOffset={2} className="w-48">
                                <DropdownMenuItem asChild >
                                    <Link to="/admin/add-product">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Product
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild >
                                    <Link to="/admin/product-list">
                                        <AlignLeft className="mr-2 h-4 w-4" />
                                        Product Liste
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuItem asChild >
                            <Link to="/admin/users">
                                <Users className="mr-2 h-4 w-4" />
                                Users
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild >
                            <Link to="/admin/orders">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Orders
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild >
                            <Link to="/admin/categories">
                                <Tag className="mr-2 h-4 w-4" />
                                Categories
                            </Link>
                        </DropdownMenuItem>


                    </>
                )}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
