import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, MessageSquareQuote, BellRing } from 'lucide-react';
import { createFeedback, createWaiterCall, getBill, requestBill } from '../../api/customerExperience';
import { useCustomerSession } from '../../context/CustomerSessionContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

function CustomerExperiencePanel() {
  const { session } = useCustomerSession();
  const [bill, setBill] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [waiterLoading, setWaiterLoading] = useState(false);
  const [waiterError, setWaiterError] = useState('');
  const [waiterSuccess, setWaiterSuccess] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const handleBill = async () => {
    if (!session?.id) {
      setBillError('Create or load a customer session first.');
      return;
    }

    setBillLoading(true);
    setBillError('');
    try {
      const response = await requestBill({ session_id: session.id });
      setBill(response.data);
      setBillError('');
    } catch (err) {
      setBillError(err?.response?.data?.detail || 'Unable to request the bill.');
    } finally {
      setBillLoading(false);
    }
  };

  const handleFeedback = async (event) => {
    event.preventDefault();
    if (!session?.id) {
      setFeedbackError('Create or load a customer session first.');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbackSuccess('');

    try {
      await createFeedback({ session_id: session.id, rating: Number(rating), comment: comment.trim() || null });
      setFeedbackSuccess('Feedback submitted successfully.');
      setComment('');
      setRating('5');
    } catch (err) {
      setFeedbackError(err?.response?.data?.detail || 'Feedback could not be submitted.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleWaiterCall = async () => {
    if (!session?.id) {
      setWaiterError('Create or load a customer session first.');
      return;
    }

    setWaiterLoading(true);
    setWaiterError('');
    setWaiterSuccess('');

    try {
      const response = await createWaiterCall({ session_id: session.id });
      setWaiterSuccess(`Waiter call created successfully. Reference #${response.data.id}`);
    } catch (err) {
      setWaiterError(err?.response?.data?.detail || 'Could not raise a waiter call.');
    } finally {
      setWaiterLoading(false);
    }
  };

  const billSummary = useMemo(() => {
    if (!bill) return null;
    return [
      { label: 'Subtotal', value: `$${Number(bill.subtotal).toFixed(2)}` },
      { label: 'CGST', value: `$${Number(bill.cgst).toFixed(2)}` },
      { label: 'SGST', value: `$${Number(bill.sgst).toFixed(2)}` },
      { label: 'Grand total', value: `$${Number(bill.grand_total).toFixed(2)}` },
    ];
  }, [bill]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-3">
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Receipt size={18} />
          <h3 className="font-semibold text-text">Billing</h3>
        </div>
        <p className="text-sm text-secondary-text">Request a bill and inspect the subtotal, tax breakdown, and grand total.</p>
        <Button onClick={handleBill} loading={billLoading} className="w-full">
          {billLoading ? 'Requesting bill...' : 'Request bill'}
        </Button>
        {billError ? <p className="text-sm text-error">{billError}</p> : null}
        {bill ? (
          <div className="rounded-[16px] border border-border bg-muted p-4 text-sm text-secondary-text">
            <p className="font-semibold text-text">Bill #{bill.bill_id}</p>
            <div className="mt-3 space-y-2">
              {billSummary?.map((row) => (
                <div key={row.label} className="flex justify-between gap-3">
                  <span>{row.label}</span>
                  <span className="font-semibold text-text">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MessageSquareQuote size={18} />
          <h3 className="font-semibold text-text">Feedback</h3>
        </div>
        <p className="text-sm text-secondary-text">Share a quick rating and comment after your visit.</p>
        <form onSubmit={handleFeedback} className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-text">Rating</label>
            <select value={rating} onChange={(event) => setRating(event.target.value)} className="w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text">Comment</label>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="min-h-24 w-full rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <Button type="submit" loading={feedbackLoading} className="w-full">
            Submit feedback
          </Button>
        </form>
        {feedbackError ? <p className="text-sm text-error">{feedbackError}</p> : null}
        {feedbackSuccess ? <p className="text-sm text-success">{feedbackSuccess}</p> : null}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BellRing size={18} />
          <h3 className="font-semibold text-text">Waiter call</h3>
        </div>
        <p className="text-sm text-secondary-text">Request assistance without leaving the page.</p>
        <Button onClick={handleWaiterCall} loading={waiterLoading} className="w-full">
          Call waiter
        </Button>
        {waiterError ? <p className="text-sm text-error">{waiterError}</p> : null}
        {waiterSuccess ? <p className="text-sm text-success">{waiterSuccess}</p> : null}
      </Card>
    </motion.div>
  );
}

export default CustomerExperiencePanel;
