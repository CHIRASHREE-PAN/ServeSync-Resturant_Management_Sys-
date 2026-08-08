import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileDown, FileText, Layers3, Sparkles, TrendingUp, Users } from 'lucide-react';
import { getChartOrderStatus, getChartRatings, getChartRevenue, getChartTopCategories, getChartTopItems, getDailyReport, getMonthlyPdf, getMonthlyExcel, getMonthlyReport, getRangeReport, getYearlyReport } from '../../api/admin';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Skeleton from '../ui/Skeleton';

const reportTabs = [
  { key: 'daily', label: 'Daily' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'range', label: 'Date Range' },
];

function ReportsPanel() {
  const today = useMemo(() => new Date(), []);
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyDate, setDailyDate] = useState(today.toISOString().slice(0, 10));
  const [monthlyYear, setMonthlyYear] = useState(today.getFullYear().toString());
  const [monthlyMonth, setMonthlyMonth] = useState((today.getMonth() + 1).toString());
  const [yearlyYear, setYearlyYear] = useState(today.getFullYear().toString());
  const [rangeFrom, setRangeFrom] = useState(today.toISOString().slice(0, 10));
  const [rangeTo, setRangeTo] = useState(today.toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [charts, setCharts] = useState({ revenue: null, topItems: null, topCategories: null, orderStatus: null, ratings: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  const loadReports = async (tab = activeTab) => {
    setLoading(true);
    setError('');
    try {
      const baseYear = tab === 'yearly' ? Number(yearlyYear) : tab === 'monthly' ? Number(monthlyYear) : new Date(dailyDate).getFullYear();
      let reportResponse;
      if (tab === 'daily') {
        reportResponse = await getDailyReport(dailyDate);
      } else if (tab === 'monthly') {
        reportResponse = await getMonthlyReport(Number(monthlyYear), Number(monthlyMonth));
      } else if (tab === 'yearly') {
        reportResponse = await getYearlyReport(Number(yearlyYear));
      } else {
        reportResponse = await getRangeReport(rangeFrom, rangeTo);
      }

      const [revenue, topItems, topCategories, orderStatus, ratings] = await Promise.all([
        getChartRevenue(baseYear),
        getChartTopItems(baseYear),
        getChartTopCategories(baseYear),
        getChartOrderStatus(baseYear),
        getChartRatings(baseYear),
      ]);

      setReport(reportResponse.data);
      setCharts({
        revenue: revenue.data,
        topItems: topItems.data,
        topCategories: topCategories.data,
        orderStatus: orderStatus.data,
        ratings: ratings.data,
      });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports('daily');
  }, []);

  const handleExport = async (kind) => {
    setExporting(kind);
    try {
      const response = kind === 'pdf' ? await getMonthlyPdf(Number(monthlyYear), Number(monthlyMonth)) : await getMonthlyExcel(Number(monthlyYear), Number(monthlyMonth));
      const filePath = response.data.pdf_path || response.data.excel_path;
      if (filePath) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        window.open(`${baseUrl}/${filePath}`, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to export report.');
    } finally {
      setExporting('');
    }
  };

  const summaryCards = useMemo(() => {
    if (!report) return [];

    if (activeTab === 'daily') {
      return [
        { label: 'Orders', value: report.orders, icon: BarChart3 },
        { label: 'Revenue', value: `$${Number(report.revenue || 0).toFixed(2)}`, icon: TrendingUp },
        { label: 'Bills paid', value: report.bills_paid, icon: FileText },
        { label: 'Active sessions', value: report.active_sessions, icon: Users },
      ];
    }

    if (activeTab === 'monthly') {
      return [
        { label: 'Total orders', value: report.total_orders, icon: BarChart3 },
        { label: 'Revenue', value: `$${Number(report.revenue || 0).toFixed(2)}`, icon: TrendingUp },
        { label: 'Completed orders', value: report.completed_orders, icon: FileText },
        { label: 'Average order value', value: `$${Number(report.average_order_value || 0).toFixed(2)}`, icon: Sparkles },
      ];
    }

    if (activeTab === 'yearly') {
      return [
        { label: 'Total revenue', value: `$${Number(report.total_revenue || 0).toFixed(2)}`, icon: TrendingUp },
        { label: 'Total orders', value: report.total_orders, icon: BarChart3 },
        { label: 'Average rating', value: report.average_rating != null ? report.average_rating.toFixed(1) : '—', icon: Sparkles },
        { label: 'Monthly sales', value: report.monthly_sales?.length || 0, icon: Layers3 },
      ];
    }

    return [
      { label: 'Orders', value: report.orders, icon: BarChart3 },
      { label: 'Revenue', value: `$${Number(report.revenue || 0).toFixed(2)}`, icon: TrendingUp },
      { label: 'Paid bills', value: report.paid_bills, icon: FileText },
      { label: 'Sessions', value: report.customer_sessions, icon: Users },
    ];
  }, [activeTab, report]);

  const renderBarChart = (data, formatter = (value) => value) => {
    const values = data?.values || [];
    const maxValue = Math.max(...values, 1);

    return (
      <div className="space-y-3">
        {(data?.labels || []).map((label, index) => (
          <div key={`${label}-${index}`} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-text">{label}</span>
              <span className="font-semibold text-text">{formatter(values[index])}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(8, (Number(values[index] || 0) / maxValue) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {reportTabs.map((tab) => (
            <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'secondary'} onClick={() => {
              setActiveTab(tab.key);
              if (tab.key !== 'daily') {
                loadReports(tab.key);
              }
            }}>
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-text">Report controls</h3>
            <p className="text-sm text-secondary-text">Switch between daily, monthly, yearly, and range reports with live metrics and chart summaries.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeTab === 'daily' ? (
              <div className="min-w-[180px]">
                <label className="mb-2 block text-sm font-medium text-text">Date</label>
                <Input type="date" value={dailyDate} onChange={(event) => setDailyDate(event.target.value)} />
              </div>
            ) : null}
            {activeTab === 'monthly' ? (
              <>
                <div className="min-w-[130px]">
                  <label className="mb-2 block text-sm font-medium text-text">Year</label>
                  <Input type="number" value={monthlyYear} onChange={(event) => setMonthlyYear(event.target.value)} />
                </div>
                <div className="min-w-[140px]">
                  <label className="mb-2 block text-sm font-medium text-text">Month</label>
                  <Input type="number" min="1" max="12" value={monthlyMonth} onChange={(event) => setMonthlyMonth(event.target.value)} />
                </div>
              </>
            ) : null}
            {activeTab === 'yearly' ? (
              <div className="min-w-[140px]">
                <label className="mb-2 block text-sm font-medium text-text">Year</label>
                <Input type="number" value={yearlyYear} onChange={(event) => setYearlyYear(event.target.value)} />
              </div>
            ) : null}
            {activeTab === 'range' ? (
              <>
                <div className="min-w-[160px]">
                  <label className="mb-2 block text-sm font-medium text-text">From</label>
                  <Input type="date" value={rangeFrom} onChange={(event) => setRangeFrom(event.target.value)} />
                </div>
                <div className="min-w-[160px]">
                  <label className="mb-2 block text-sm font-medium text-text">To</label>
                  <Input type="date" value={rangeTo} onChange={(event) => setRangeTo(event.target.value)} />
                </div>
              </>
            ) : null}
            <Button onClick={() => loadReports(activeTab)} loading={loading}>Apply</Button>
          </div>
        </div>
      </Card>

      {error ? <Card className="p-4 text-sm text-error">{error}</Card> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-[20px]" />) : summaryCards.map(({ label, value, icon: Icon }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm text-secondary-text">{label}</p>
                <p className="text-lg font-semibold text-text">{value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {activeTab === 'monthly' ? (
        <Card className="flex flex-wrap items-center justify-end gap-3 p-5">
          <Button variant="secondary" loading={exporting === 'pdf'} onClick={() => handleExport('pdf')}>
            <FileDown size={16} className="mr-2" /> PDF
          </Button>
          <Button variant="secondary" loading={exporting === 'excel'} onClick={() => handleExport('excel')}>
            <FileDown size={16} className="mr-2" /> Excel
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <TrendingUp size={18} />
            <h3 className="font-semibold text-text">Revenue</h3>
          </div>
          {loading ? <Skeleton className="h-48 rounded-[20px]" /> : renderBarChart(charts.revenue, (value) => `$${Number(value || 0).toFixed(2)}`)}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <BarChart3 size={18} />
            <h3 className="font-semibold text-text">Top items</h3>
          </div>
          {loading ? <Skeleton className="h-48 rounded-[20px]" /> : renderBarChart(charts.topItems)}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Layers3 size={18} />
            <h3 className="font-semibold text-text">Top categories</h3>
          </div>
          {loading ? <Skeleton className="h-48 rounded-[20px]" /> : renderBarChart(charts.topCategories)}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <h3 className="font-semibold text-text">Ratings</h3>
          </div>
          {loading ? <Skeleton className="h-48 rounded-[20px]" /> : renderBarChart(charts.ratings)}
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-primary">
          <Users size={18} />
          <h3 className="font-semibold text-text">Order status</h3>
        </div>
        {loading ? <Skeleton className="h-40 rounded-[20px]" /> : renderBarChart(charts.orderStatus)}
      </Card>
    </div>
  );
}

export default ReportsPanel;
