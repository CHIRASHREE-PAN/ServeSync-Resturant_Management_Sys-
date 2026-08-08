import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function ForbiddenPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
          <ShieldAlert size={28} />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-text">403</h2>
        <p className="mt-2 text-secondary-text">Your current role does not have permission to access this section.</p>
        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button variant="secondary">Return home</Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export default ForbiddenPage;
