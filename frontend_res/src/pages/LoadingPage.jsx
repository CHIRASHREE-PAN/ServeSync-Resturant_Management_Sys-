import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import Card from '../components/ui/Card';

function LoadingPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ChefHat size={36} className="animate-bounce" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-text">Loading your workspace</h2>
        <p className="mt-2 text-secondary-text">Fetching the latest orders, menu, and reports for your restaurant.</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary" />
        </div>
      </Card>
    </motion.div>
  );
}

export default LoadingPage;
