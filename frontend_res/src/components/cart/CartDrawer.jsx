import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import CheckoutModal from '../checkout/CheckoutModal';

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

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
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
            aria-label="Your cart"
            tabIndex={-1}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Your order</p>
                <h2 className="text-xl font-semibold text-text">Cart</h2>
              </div>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <Card className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-4 text-primary">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-text">Your cart is empty</h3>
                  <p className="mt-2 text-sm text-secondary-text">Pick a few dishes to build your order.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] border border-border bg-muted p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">{item.name}</p>
                          <p className="mt-1 text-sm text-secondary-text">${Number(item.price).toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-2 text-error transition hover:bg-card"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="rounded-full border border-border bg-card p-2 text-text"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-8 text-center font-semibold text-text">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="rounded-full border border-border bg-card p-2 text-text"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-semibold text-text">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border bg-card p-5">
              <div className="flex items-center justify-between text-sm text-secondary-text">
                <span>Subtotal</span>
                <span className="text-lg font-semibold text-text">${subtotal.toFixed(2)}</span>
              </div>
              <Button className="mt-4 w-full gap-2" disabled={items.length === 0} onClick={() => setCheckoutOpen(true)}>
                Checkout <ArrowRight size={16} />
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onSuccess={() => setCheckoutOpen(false)} />
    </AnimatePresence>
  );
}

export default CartDrawer;
