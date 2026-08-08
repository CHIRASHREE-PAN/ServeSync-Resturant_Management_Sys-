import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellRing,
  ReceiptText,
  CheckCircle2,
  CircleDollarSign,
  UtensilsCrossed,
  TimerReset,
} from 'lucide-react';

import {
  completeWaiterCall,
  listReadyOrders,
  listWaiterCalls,
  markBillPaid,
  markOrderServed,
} from '../../api/waiter';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionState, setActionState] = useState({
    orderId: null,
    callId: null,
    billId: null,
  });

  const [servedCount, setServedCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersResponse, callsResponse] = await Promise.all([
        listReadyOrders(),
        listWaiterCalls(),
      ]);

      setOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : ordersResponse.data?.items || [],
      );

      setCalls(
        Array.isArray(callsResponse.data)
          ? callsResponse.data
          : callsResponse.data?.items || [],
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to load waiter queue.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleServe = async (orderId) => {
    setError('');

    try {
      setActionState((current) => ({
        ...current,
        orderId,
      }));

      const response = await markOrderServed(orderId);

      const servedOrderId =
        response?.data?.order_id ?? orderId;

      setOrders((current) =>
        current.filter(
          (order) => order.order_id !== servedOrderId,
        ),
      );

      setServedCount((current) => current + 1);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to mark order as served.',
      );
    } finally {
      setActionState((current) => ({
        ...current,
        orderId: null,
      }));
    }
  };

  const handleCompleteCall = async (callId) => {
    setError('');

    try {
      setActionState((current) => ({
        ...current,
        callId,
      }));

      const response = await completeWaiterCall(callId);

      const completedCallId =
        response?.data?.call_id ?? callId;

      setCalls((current) =>
        current.filter(
          (call) => call.call_id !== completedCallId,
        ),
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to complete waiter call.',
      );
    } finally {
      setActionState((current) => ({
        ...current,
        callId: null,
      }));
    }
  };

  const handlePaid = async (billId) => {
    setError('');

    try {
      setActionState((current) => ({
        ...current,
        billId,
      }));

      await markBillPaid(billId);

      setPaidCount((current) => current + 1);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to mark bill as paid.',
      );
    } finally {
      setActionState((current) => ({
        ...current,
        billId: null,
      }));
    }
  };

  const stats = useMemo(
    () => [
      {
        label: 'Ready orders',
        value: orders.length,
        icon: UtensilsCrossed,
        tone: 'text-primary',
      },
      {
        label: 'Open calls',
        value: calls.length,
        icon: BellRing,
        tone: 'text-accent',
      },
      {
        label: 'Served',
        value: servedCount,
        icon: CheckCircle2,
        tone: 'text-success',
      },
      {
        label: 'Paid',
        value: paidCount,
        icon: CircleDollarSign,
        tone: 'text-info',
      },
    ],
    [orders.length, calls.length, servedCount, paidCount],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="p-5"
              >
                <Skeleton className="h-20 rounded-[16px]" />
              </Card>
            ))
          : stats.map(
              ({ label, value, icon: Icon, tone }) => (
                <motion.div
                  key={label}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  <Card className="p-5">
                    <div
                      className={`rounded-2xl bg-muted p-3 ${tone}`}
                    >
                      <Icon size={20} />

                      <p className="mt-3 text-sm text-secondary-text">
                        {label}
                      </p>

                      <p className="mt-1 text-2xl font-bold text-text">
                        {value}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ),
            )}
      </div>

      {error ? (
        <Card className="p-4 text-sm text-error">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <UtensilsCrossed size={18} />
            <h3 className="font-semibold text-text">
              Ready orders
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-60 rounded-[20px]" />
          ) : orders.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-border bg-muted p-6 text-sm text-secondary-text">
              No ready orders right now.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={order.order_id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-[16px] border border-border bg-muted p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">
                        Table {order.table_number}
                        {order.customer_name
                          ? ` • ${order.customer_name}`
                          : ''}
                      </p>

                      <p className="mt-1 text-sm text-secondary-text">
                        {order.ordered_items
                          ?.map(
                            (item) =>
                              `${item.quantity}× ${item.menu_item_name}`,
                          )
                          .join(', ') ||
                          'No items listed'}
                      </p>
                    </div>

                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {order.order_status}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary-text">
                    <span className="inline-flex items-center gap-2">
                      <TimerReset size={14} />
                      Est.{' '}
                      {order.estimated_cooking_time ?? 0} min
                    </span>

                    <span className="font-semibold text-text">
                      ${Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() =>
                        handleServe(order.order_id)
                      }
                      loading={
                        actionState.orderId ===
                        order.order_id
                      }
                    >
                      Mark served
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <BellRing size={18} />
            <h3 className="font-semibold text-text">
              Waiter calls
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-60 rounded-[20px]" />
          ) : calls.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-border bg-muted p-6 text-sm text-secondary-text">
              No active waiter calls.
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
                <motion.div
                  key={call.call_id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-[16px] border border-border bg-muted p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">
                        Table {call.table_number}
                        {call.customer_name
                          ? ` • ${call.customer_name}`
                          : ''}
                      </p>

                      {call.customer_email ? (
                        <p className="mt-1 text-sm text-secondary-text">
                          {call.customer_email}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                      {call.status}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-secondary-text">
                    <span>
                      {call.number_of_people ?? 0} guests
                    </span>

                    <Button
                      onClick={() =>
                        handleCompleteCall(call.call_id)
                      }
                      loading={
                        actionState.callId === call.call_id
                      }
                      variant="secondary"
                    >
                      Complete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-primary">
          <ReceiptText size={18} />
          <h3 className="font-semibold text-text">
            Billing
          </h3>
        </div>

        <div className="rounded-[16px] border border-dashed border-border bg-muted p-6 text-sm text-secondary-text">
          Mark a bill as paid using the bill ID returned by
          your billing flow.
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              const billId = window.prompt(
                'Enter bill ID',
              );

              if (billId) {
                handlePaid(Number(billId));
              }
            }}
            loading={actionState.billId !== null}
          >
            Mark bill paid
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default WaiterDashboard;