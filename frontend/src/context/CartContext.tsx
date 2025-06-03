import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axiosConfig';
import type { Libro } from '../types/models';

interface CartItem {
  id: number;
  libro: Libro;
  cantidad: number;
}

interface CartContextProps {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);


  const fetchCart = async () => {
    try {
      const { data } = await api.get<{ id: number; items: CartItem[] }>('/compras/mi-carrito/');
      setItems(data.items);
    } catch {
      setItems([]);
    }
  };


  const addToCart = async (item: CartItem) => {
    await fetchCart();
    if (items.find((i) => i.libro.id === item.libro.id)) {
      alert('Este libro ya está en tu carrito.');
      return;
    }
    if (!item.libro.id) throw new Error('Libro inválido');
    await api.get('/auth/csrf/');
    const { data: compra } = await api.get<{ id: number; items: CartItem[] }>('/compras/mi-carrito/');
    const carritoId = compra.id;

    await api.post(`/compras/${carritoId}/agregar-items/`, {
      items: [{ libro_id: item.libro.id, cantidad: item.cantidad }]
    });

    await fetchCart();
  };


  const removeFromCart = async (itemId: number) => {
    const { data: compra } = await api.get<{ id: number; items: CartItem[] }>('/compras/mi-carrito/');
    const carritoId = compra.id;
    await api.delete(`/compras/${carritoId}/eliminar-item/${itemId}/`);
    await fetchCart();
  };


  const clearCart = () => setItems([]);


  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
