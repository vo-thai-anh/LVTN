import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoadingCart(true);
      try {
          const res = await cartAPI.getCart();
          if (res && res.data) {
              const items = res.data.thong_tin_gio_hang?.chitietgiohangs || [];
              setCartItems(items);
          }
      } catch (error) {
          console.error('Lỗi:', error);
      } finally {
          setLoadingCart(false);
      }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Tính tổng số lượng dựa trên 'so_luong' trong DB
  const cartCount = (cartItems || []).reduce((acc, item) => {
    return acc + (parseInt(item?.so_luong) || 0);
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, cartCount, loadingCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
