import { createContext, useContext, useState, type ReactNode } from 'react';

interface CartItem { productId: string; qty: number }
interface Order { id: string; items: CartItem[]; date: Date }

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addItem = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
  };
  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };
  const clearCart = () => setCartItems([]);
  const placeOrder = () => {
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cartItems],
      date: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);
    clearCart();
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addItem, removeItem, clearCart, orders, placeOrder }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
