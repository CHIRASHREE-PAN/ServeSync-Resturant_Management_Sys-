import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

function getStoredCart() {
  try {
    const stored = localStorage.getItem('cart_items');

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Invalid cart data in localStorage:', error);
    localStorage.removeItem('cart_items');
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getStoredCart);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((current) => {
      const existing = current.find(
        (entry) => entry.id === item.id,
      );

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: entry.quantity + 1,
              }
            : entry,
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    const newQuantity = Number(quantity);

    if (!Number.isFinite(newQuantity)) {
      return;
    }

    setItems((current) =>
      current.flatMap((entry) => {
        if (entry.id !== id) {
          return [entry];
        }

        if (newQuantity <= 0) {
          return [];
        }

        return [
          {
            ...entry,
            quantity: Math.floor(newQuantity),
          },
        ];
      }),
    );
  };

  const removeItem = (id) => {
    setItems((current) =>
      current.filter((entry) => entry.id !== id),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, entry) =>
          sum + Number(entry.price || 0) * Number(entry.quantity || 0),
        0,
      ),
    [items],
  );

  const itemCount = useMemo(
    () =>
      items.reduce(
        (count, entry) => count + Number(entry.quantity || 0),
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      itemCount,
    }),
    [items, subtotal, itemCount],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider',
    );
  }

  return context;
}