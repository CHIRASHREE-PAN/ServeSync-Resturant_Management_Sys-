import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import CheckoutModal from '../checkout/CheckoutModal';

const DISH_FALLBACK =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

// Get API base URL for constructing absolute image paths
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8007';

function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const itemCount = items.reduce(
    (count, entry) => count + Number(entry.quantity || 0),
    0,
  );
  
  // Convert relative image path to absolute URL
  const getImageSrc = (imagePath) => {
    if (!imagePath) return DISH_FALLBACK;
    
    // If already a full URL, use it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, prepend API base URL
    const path = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE_URL}/${path}`;
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay-backdrop fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            tabIndex={-1}
            className="surface-drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  Your order
                </p>
                <h2 className="text-xl font-semibold text-text">Cart</h2>
              </div>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                /* Premium empty state */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag size={36} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-text">
                    Your order is empty
                  </h3>
                  <p className="mt-2 max-w-60 text-sm text-secondary-text">
                    Pick a few dishes from the menu to build your order.
                  </p>
                  <Button
                    className="mt-6 gap-2"
                    onClick={onClose}
                  >
                    <UtensilsCrossed size={16} />
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="overflow-hidden rounded-card border border-border bg-card shadow-soft"
                    >
                      <div className="flex gap-3 p-3">
                        {/* Dish thumbnail */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-image bg-muted">
                          <img
                            src={getImageSrc(item?.image)}
                            alt={item.name || 'Dish'}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Item info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-text">
                                {item.name}
                              </p>
                              <p className="text-price mt-0.5 text-sm text-primary">
                                ${Number(item.price).toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 rounded-full p-1.5 text-error transition hover:bg-error/10"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Quantity + line total */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="rounded-full p-1.5 text-text transition hover:bg-card"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus size={13} />
                              </button>
                              <span className="min-w-7 text-center text-sm font-semibold text-text">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="rounded-full p-1.5 text-text transition hover:bg-card"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <p className="text-stat text-base text-text">
                              ${(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — subtotal + checkout */}
            {items.length > 0 && (
              <div className="border-t border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-text">
                    Subtotal · {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-stat text-xl text-text">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-accent">
                  <Sparkles size={13} />
                  <span>Taxes and cooking time calculated at checkout.</span>
                </div>
                <Button
                  className="mt-4 h-12 w-full gap-2 text-base"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Checkout
                  <ArrowRight size={17} />
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      ) : null}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onSuccess={() => setCheckoutOpen(false)} />
    </AnimatePresence>
  );
}

export default CartDrawer;