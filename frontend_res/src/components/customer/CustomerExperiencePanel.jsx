import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellRing,
  CheckCircle2,
  MessageSquareQuote,
  Receipt,
  Send,
  Sparkles,
  Star,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  createFeedback,
  createWaiterCall,
  requestBill,
} from '../../api/customerExperience';
import { useCustomerSession } from '../../context/CustomerSessionContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

/* ---------------------------------------------------------------
   Guest Services — only the actions already supported by the
   backend are surfaced here. No new services are invented.
--------------------------------------------------------------- */
const services = [
  {
    key: 'billing',
    title: 'Billing',
    description: 'Request a bill and inspect the subtotal, tax breakdown, and grand total.',
    icon: Receipt,
    color: 'text-primary',
    bg: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    key: 'feedback',
    title: 'Feedback',
    description: 'Share a quick rating and comment after your visit.',
    icon: MessageSquareQuote,
    color: 'text-accent',
    bg: 'bg-accent/10',
    borderColor: 'border-accent/20',
  },
  {
    key: 'waiter',
    title: 'Waiter Call',
    description: 'Request assistance without leaving the page.',
    icon: BellRing,
    color: 'text-info',
    bg: 'bg-info/10',
    borderColor: 'border-info/20',
  },
];

const starLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

function CustomerExperiencePanel() {
  const { session } = useCustomerSession();
  const [bill, setBill] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState('');

  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [waiterLoading, setWaiterLoading] = useState(false);
  const [waiterError, setWaiterError] = useState('');
  const [waiterSuccess, setWaiterSuccess] = useState('');

  const hasActiveSession = session?.status === 'ACTIVE';

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
    } catch (err) {
      setBillError(
        err?.response?.data?.detail || 'Unable to request the bill.',
      );
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
      await createFeedback({
        session_id: session.id,
        rating: Number(rating),
        comment: comment.trim() || null,
      });
      setFeedbackSuccess('Feedback submitted successfully.');
      setComment('');
      setRating(5);
    } catch (err) {
      setFeedbackError(
        err?.response?.data?.detail || 'Feedback could not be submitted.',
      );
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
      setWaiterSuccess(
        `Waiter call created successfully. Reference #${response.data.id}`,
      );
    } catch (err) {
      setWaiterError(
        err?.response?.data?.detail || 'Could not raise a waiter call.',
      );
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

  const renderStatus = (error, success) => {
    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-table border border-error/30 bg-error/5 p-3.5 text-sm text-error"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
        </motion.div>
      );
    }
    if (success) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-table border border-success/30 bg-success/5 p-3.5 text-sm text-success"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1">{success}</span>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {/* BILLING */}
      <Card className={`flex flex-col border ${services[0].borderColor} transition-all duration-200 hover:shadow-lg`}>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${services[0].bg} ${services[0].color}`}
          >
            <Receipt size={24} />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-text">
              {services[0].title}
            </h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-secondary-text leading-relaxed">
          {services[0].description}
        </p>

        <div className="mt-auto pt-4">
          <Button
            className="h-11 w-full gap-2 shadow-sm"
            onClick={handleBill}
            loading={billLoading}
            disabled={!hasActiveSession}
            variant="default"
          >
            {billLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Requesting bill...
              </>
            ) : (
              'Request bill'
            )}
          </Button>

          <AnimatePresence>
            {billError && renderStatus(billError, '')}
          </AnimatePresence>

          {bill ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mt-4 rounded-xl border border-border bg-gradient-to-br from-muted to-background p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-text">
                  Bill #{bill.bill_id}
                </p>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                >
                  <Sparkles size={12} />
                  Ready
                </motion.span>
              </div>
              <div className="mt-3 space-y-2.5">
                {billSummary?.map((row, index) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-secondary-text">{row.label}</span>
                    <span className="font-semibold text-text">{row.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : billLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-2.5 rounded-xl border border-border bg-muted/50 p-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </motion.div>
          ) : null}
        </div>
      </Card>

      {/* FEEDBACK */}
      <Card className={`flex flex-col border ${services[1].borderColor} transition-all duration-200 hover:shadow-lg`}>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${services[1].bg} ${services[1].color}`}
          >
            <MessageSquareQuote size={24} />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-text">
              {services[1].title}
            </h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-secondary-text leading-relaxed">
          {services[1].description}
        </p>

        <form onSubmit={handleFeedback} className="mt-4 space-y-4">
          <div>
            <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text">
              <Star size={14} className="text-accent" />
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-0.5 outline-none transition-colors"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                >
                  <Star
                    size={22}
                    className={
                      value <= rating
                        ? 'fill-accent text-accent drop-shadow-sm'
                        : 'text-border hover:text-secondary-text'
                    }
                  />
                </motion.button>
              ))}
              <motion.span
                key={rating}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-2 text-xs font-medium text-secondary-text"
              >
                {starLabels[rating]}
              </motion.span>
            </div>
          </div>
          <div>
            <label className="mb-2.5 block text-sm font-medium text-text">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What did we get right? What can we improve?"
              className="min-h-[100px] w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full gap-2 shadow-sm"
            loading={feedbackLoading}
            disabled={!hasActiveSession}
            variant="accent"
          >
            {feedbackLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-text/30 border-t-text" />
                Submitting...
              </>
            ) : (
              <>
                Submit feedback
                <Send size={16} />
              </>
            )}
          </Button>
        </form>

        <AnimatePresence>
          {renderStatus(feedbackError, feedbackSuccess)}
        </AnimatePresence>
      </Card>

      {/* WAITER CALL */}
      <Card className={`flex flex-col border ${services[2].borderColor} transition-all duration-200 hover:shadow-lg md:col-span-2 xl:col-span-1`}>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${services[2].bg} ${services[2].color}`}
          >
            <BellRing size={24} />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-text">
              {services[2].title}
            </h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-secondary-text leading-relaxed">
          {services[2].description}
        </p>

        <div className="mt-auto pt-4">
          <Button
            className="h-11 w-full gap-2 shadow-sm"
            onClick={handleWaiterCall}
            loading={waiterLoading}
            disabled={!hasActiveSession}
            variant="outline"
          >
            {waiterLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-text/30 border-t-text" />
                Calling...
              </>
            ) : (
              <>
                Call waiter
                <BellRing size={16} />
              </>
            )}
          </Button>

          <AnimatePresence>
            {renderStatus(waiterError, waiterSuccess)}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

export default CustomerExperiencePanel;