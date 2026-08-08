import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Compass, CookingPot } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Welcome</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Your restaurant operations are ready.</h2>
          <p className="mt-2 max-w-xl text-secondary-text">Manage guest sessions, the live menu, and staff workflows from one unified workspace.</p>
        </div>
        <Button onClick={() => navigate('/menu')}>Explore Menu</Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-text">End-to-end navigation</h3>
              <p className="text-sm text-secondary-text">Seamless routes for guests, waiters, kitchen, and admin dashboards.</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <CookingPot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-text">Order pipeline ready</h3>
              <p className="text-sm text-secondary-text">Orders flow through received, preparing, ready, and served states.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-success" size={20} />
          <p className="text-sm text-secondary-text">Core modules live: customer sessions, menu discovery, OTP login, billing, feedback, and reporting.</p>
        </div>
      </Card>
    </motion.div>
  );
}

export default WelcomePage;
