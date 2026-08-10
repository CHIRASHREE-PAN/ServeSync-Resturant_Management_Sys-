import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  ChefHat,
  LayoutGrid,
  Users,
  MessageSquareQuote,
  TrendingUp,
} from "lucide-react";

import {
  getChartOrderStatus,
  getChartRatings,
  getChartRevenue,
  getChartTopCategories,
  getChartTopItems,
  getDailyReport,
  listFeedback,
} from "../../api/admin";

import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [charts, setCharts] = useState({
    revenue: null,
    topItems: null,
    topCategories: null,
    orderStatus: null,
    ratings: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const today = new Date().toISOString().slice(0, 10);
      const year = new Date().getFullYear();

      try {
        const [
          daily,
          feedbackResponse,
          revenue,
          topItems,
          topCategories,
          orderStatus,
          ratings,
        ] = await Promise.all([
          getDailyReport(today),
          listFeedback({
            page: 1,
            page_size: 5,
          }),
          getChartRevenue(year),
          getChartTopItems(year),
          getChartTopCategories(year),
          getChartOrderStatus(year),
          getChartRatings(year),
        ]);

        if (!mounted) return;

        setReport(daily?.data ?? null);

        const feedbackData = feedbackResponse?.data;

        setFeedback(
          Array.isArray(feedbackData)
            ? feedbackData
            : feedbackData?.items ?? []
        );

        setCharts({
          revenue: revenue?.data ?? null,
          topItems: topItems?.data ?? null,
          topCategories: topCategories?.data ?? null,
          orderStatus: orderStatus?.data ?? null,
          ratings: ratings?.data ?? null,
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.detail ||
            "Unable to load the admin dashboard."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Orders",
        value: report?.orders ?? "—",
        icon: BarChart3,
      },
      {
        label: "Revenue",
        value:
          report?.revenue !== undefined &&
          report?.revenue !== null
            ? `$${Number(report.revenue).toFixed(2)}`
            : "—",
        icon: TrendingUp,
      },
      {
        label: "Feedback",
        value: report?.feedback_count ?? "—",
        icon: MessageSquareQuote,
      },
      {
        label: "Active sessions",
        value: report?.active_sessions ?? "—",
        icon: Building2,
      },
    ],
    [report]
  );

  const getChartRows = (chart) => {
    if (!chart) return [];

    const labels = chart.labels ?? [];
    const values = chart.values ?? [];

    return labels.map((label, index) => ({
      label,
      value: values[index] ?? 0,
    }));
  };

  const revenueRows = getChartRows(charts.revenue);
  const topItemRows = getChartRows(charts.topItems);
  const topCategoryRows = getChartRows(charts.topCategories);
  const orderStatusRows = getChartRows(charts.orderStatus);

  const maxRevenue = Math.max(
    ...revenueRows.map((item) => Number(item.value) || 0),
    1
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
                <Skeleton className="h-20 rounded-card" />
              </Card>
            ))
          : statCards.map(
              ({ label, value, icon: Icon }, index) => (
                <motion.div
                  key={label}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <Card className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-secondary-text">
                          {label}
                        </p>

                        <p className="mt-2 text-2xl font-bold text-text">
                          {value}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Icon
                          size={21}
                          className="text-primary"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            )}
      </div>

      {error && (
        <Card className="border-error/30 p-5 text-sm text-error">
          {error}
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <BarChart3 size={18} />

            <h3 className="font-semibold text-text">
              Revenue trend
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-44 rounded-card" />
          ) : revenueRows.length === 0 ? (
            <p className="text-sm text-secondary-text">
              No revenue data available.
            </p>
          ) : (
            <div className="space-y-4">
              {revenueRows.map(({ label, value }) => {
                const numericValue = Number(value) || 0;

                return (
                  <div
                    key={label}
                    className="space-y-1"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="truncate text-secondary-text">
                        {label}
                      </span>

                      <span className="font-semibold text-text">
                        ${numericValue.toFixed(2)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (numericValue / maxRevenue) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <MessageSquareQuote size={18} />

            <h3 className="font-semibold text-text">
              Recent feedback
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-44 rounded-card" />
          ) : feedback.length === 0 ? (
            <p className="text-sm text-secondary-text">
              No feedback submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {feedback.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="rounded-table border border-border bg-muted p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-semibold text-text">
                      {item.customer_name || "Guest"}
                    </span>

                    <span className="shrink-0 text-accent">
                      {"★".repeat(
                        Math.max(
                          0,
                          Math.min(
                            5,
                            Number(item.rating) || 0
                          )
                        )
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-secondary-text">
                    {item.comment ||
                      "No comment provided."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <ChefHat size={18} />

            <h3 className="font-semibold text-text">
              Top items
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-36 rounded-card" />
          ) : topItemRows.length === 0 ? (
            <p className="text-sm text-secondary-text">
              No item data available.
            </p>
          ) : (
            <div className="space-y-3">
              {topItemRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="truncate text-secondary-text">
                    {label}
                  </span>

                  <span className="font-semibold text-text">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <LayoutGrid size={18} />

            <h3 className="font-semibold text-text">
              Top categories
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-36 rounded-card" />
          ) : topCategoryRows.length === 0 ? (
            <p className="text-sm text-secondary-text">
              No category data available.
            </p>
          ) : (
            <div className="space-y-3">
              {topCategoryRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="truncate text-secondary-text">
                    {label}
                  </span>

                  <span className="font-semibold text-text">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Users size={18} />

            <h3 className="font-semibold text-text">
              Order status
            </h3>
          </div>

          {loading ? (
            <Skeleton className="h-36 rounded-card" />
          ) : orderStatusRows.length === 0 ? (
            <p className="text-sm text-secondary-text">
              No order status data available.
            </p>
          ) : (
            <div className="space-y-3">
              {orderStatusRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="truncate text-secondary-text">
                    {label}
                  </span>

                  <span className="font-semibold text-text">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;