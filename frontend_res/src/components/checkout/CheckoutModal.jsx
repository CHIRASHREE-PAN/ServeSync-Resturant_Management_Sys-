import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock3, Receipt, Sparkles } from 'lucide-react';
import { createOrder } from '../../api/orders';
import { useCart } from '../../context/CartContext';
import { useCustomerSession } from '../../context/CustomerSessionContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

function CheckoutModal({ open, onClose, onSuccess }) {
  const { items, subtotal, clearCart } = useCart();
  const { session } = useCustomerSession();
  const [name, setName] = useState(session?.name || '');
  const [email, setEmail] = useState(session?.email || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const panelRef = useRef(null);

  const taxRate = 0.1;
  const cgst = useMemo(() => subtotal * taxRate, [subtotal]);
  const sgst = useMemo(() => subtotal * taxRate, [subtotal]);
  const grandTotal = useMemo(() => subtotal + cgst + sgst, [subtotal, cgst, sgst]);
  const estimatedCookingTime = useMemo(() => Math.max(15, items.reduce((sum, entry) => sum + (entry.cook_time || 12), 0)), [items]);

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

  const reset = () => {
    setError('');
    setSuccess(false);
    setOrderResponse(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    reset();

    if (!session?.id) {
      setError('Create or load a customer session before checking out.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        session_id: session.id,
        items: items.map((entry) => ({ menu_item_id: entry.id, quantity: entry.quantity, special_instruction: specialInstructions || null })),
      };

      const response = await createOrder(payload);
      setOrderResponse(response.data);
      setSuccess(true);
      clearCart();
      onSuccess?.(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to place the order right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
            tabIndex={-1}
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Checkout</p>
                <h2 className="text-xl font-semibold text-text">Review your order</h2>
              </div>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {success && orderResponse ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className="border border-success/20 bg-success/10 p-5">
                    <div className="flex items-center gap-3 text-success">
                      <CheckCircle2 size={20} />
                      <p className="font-semibold">Order placed successfully</p>
                    </div>
                    <p className="mt-3 text-sm text-secondary-text">Your order is now being prepared. Estimated cooking time is {orderResponse.estimated_cooking_time} minutes.</p>
                  </Card>
                  <Card className="p-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Receipt size={18} />
                      <p className="font-semibold">Receipt summary</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-secondary-text">
                      <div className="flex justify-between"><span>Subtotal</span><span>${Number(orderResponse.subtotal).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>CGST</span><span>${Number(orderResponse.cgst).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>SGST</span><span>${Number(orderResponse.sgst).toFixed(2)}</span></div>
                      <div className="flex justify-between font-semibold text-text"><span>Grand total</span><span>${Number(orderResponse.total).toFixed(2)}</span></div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Card className="p-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles size={18} />
                      <p className="font-semibold">Guest details</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text" htmlFor="checkout-name">Name</label>
                        <Input id="checkout-name" value={name} onChange={(event) => setName(event.target.value)} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text" htmlFor="checkout-email">Email</label>
                        <Input id="checkout-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text" htmlFor="checkout-instructions">Special instructions</label>
                        <textarea id="checkout-instructions" value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} className="min-h-24 w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock3 size={18} />
                      <p className="font-semibold">Order summary</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-secondary-text">
                      <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>CGST</span><span>${cgst.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>SGST</span><span>${sgst.toFixed(2)}</span></div>
                      <div className="flex justify-between font-semibold text-text"><span>Grand total</span><span>${grandTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Estimated cooking time</span><span>{estimatedCookingTime} min</span></div>
                    </div>
                  </Card>

                  {error ? <p className="text-sm text-error">{error}</p> : null}
                </form>
              )}
            </div>

            <div className="border-t border-border bg-card p-5">
              {success && orderResponse ? (
                <Button className="w-full" onClick={onClose}>Close</Button>
              ) : (
                <Button type="button" className="w-full" loading={loading} onClick={handleSubmit}>
                  Place order
                </Button>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default CheckoutModal;
