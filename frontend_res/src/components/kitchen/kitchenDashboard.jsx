import { useEffect, useState } from 'react';
import { ChefHat, CheckCircle2, Clock3 } from 'lucide-react';

import {
  listKitchenOrders,
  markOrderPreparing,
  markOrderReady,
} from '../../api/kitchen';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await listKitchenOrders();
      setOrders(response.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to load kitchen orders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePreparing = async (orderId) => {
    setActionLoading(orderId);
    setError('');

    try {
      const response = await markOrderPreparing(orderId);

      const updatedOrder = response.data;

      setOrders((current) =>
        current.map((order) =>
          order.order_id === orderId
            ? updatedOrder
            : order
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to mark order as preparing.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReady = async (orderId) => {
    setActionLoading(orderId);
    setError('');

    try {
      const response = await markOrderReady(orderId);

      const updatedOrder = response.data;

      setOrders((current) =>
        current.map((order) =>
          order.order_id === orderId
            ? updatedOrder
            : order
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to mark order as ready.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <ChefHat size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text">
              Kitchen Console
            </h1>

            <p className="text-sm text-secondary-text">
              Manage incoming orders and keep the line moving.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <Card className="p-4 text-sm text-error">
          {error}
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock3
              size={18}
              className="text-primary"
            />

            <h2 className="font-semibold text-text">
              Active Orders
            </h2>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-sm text-secondary-text">
            {orders.length} orders
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-card" />
            <Skeleton className="h-32 rounded-card" />
            <Skeleton className="h-32 rounded-card" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-muted p-8 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto mb-3 text-success"
            />

            <p className="font-medium text-text">
              No active orders
            </p>

            <p className="mt-1 text-sm text-secondary-text">
              New orders will appear here as soon as they are placed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="rounded-card border border-border bg-muted p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-text">
                      Order #{order.order_id}
                    </h3>

                    <p className="mt-1 text-sm text-secondary-text">
                      Table {order.table_number}
                      {order.customer_name
                        ? ` • ${order.customer_name}`
                        : ''}
                    </p>
                  </div>

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items?.map((item, index) => (
                    <div
                      key={
                        item.order_item_id ||
                        item.id ||
                        index
                      }
                      className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-sm"
                    >
                      <span className="text-text">
                        {item.quantity} ×{' '}
                        {item.menu_item_name}
                      </span>

                      {item.special_instruction ? (
                        <span className="text-xs text-secondary-text">
                          {item.special_instruction}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-secondary-text">
                    {order.estimated_cooking_time != null
                      ? `Estimated cooking time: ${order.estimated_cooking_time} min`
                      : ''}
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'ORDER_RECEIVED' && (
                      <Button
                        onClick={() =>
                          handlePreparing(order.order_id)
                        }
                        loading={
                          actionLoading === order.order_id
                        }
                      >
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'PREPARING' && (
                      <Button
                        onClick={() =>
                          handleReady(order.order_id)
                        }
                        loading={
                          actionLoading === order.order_id
                        }
                      >
                        Mark Ready
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default KitchenDashboard;