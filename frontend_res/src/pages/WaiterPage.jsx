import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import WaiterDashboard from '../components/waiter/WaiterDashboard';
import Card from '../components/ui/Card';

function WaiterPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-2 text-sm font-semibold text-primary">
          <Sparkles size={16} />
          Waiter Console
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-text">Deliver exceptional table service</h1>
        <p className="mt-2 max-w-2xl text-sm text-secondary-text">
          Track ready-to-serve orders, respond to guest calls, and manage billing from one focused dashboard.
        </p>
      </Card>

      <WaiterDashboard />
    </motion.div>
  );
}

export default WaiterPage;
