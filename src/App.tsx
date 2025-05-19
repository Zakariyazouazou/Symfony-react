import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

import Footer from './components/Footer';

// Public pages
import ProductDetail from './pages/public/ProductDetail';
import SearchResults from './pages/public/SearchResults';
import { CategoryList } from './pages/public/CategoryList';

// Private user pages
import CartPage from './pages/private/CartPage';
import CheckoutPage from './pages/private/CheckoutPage';
import TrackOrdersPage from './pages/private/TrackOrdersPage';

// Admin pages
import AddProduct from './pages/admin/AddProduct';
import DeleteProduct from './pages/admin/DeleteProduct';
import UsersList from './pages/admin/UsersList';
import OrdersList from './pages/admin/OrdersList';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import type { JSX } from 'react';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import { Header } from './components/Header';
import { ProductList } from './pages/public/ProductList';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, role } = useAuth();
  return isAuthenticated && role === 'admin'
    ? children
    : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* Public */}
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search/:search" element={<SearchResults />} />
            <Route path="/category/:category" element={<CategoryList />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Only */}
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <CartPage />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/track-orders"
              element={
                <RequireAuth>
                  <TrackOrdersPage />
                </RequireAuth>
              }
            />

            {/* Admin Only */}
            <Route
              path="/admin/add-product"
              element={
                <RequireAdmin>
                  <AddProduct />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/delete-product"
              element={
                <RequireAdmin>
                  <DeleteProduct />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <UsersList />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RequireAdmin>
                  <OrdersList />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <RequireAdmin>
                  <CategoriesAdmin />
                </RequireAdmin>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
