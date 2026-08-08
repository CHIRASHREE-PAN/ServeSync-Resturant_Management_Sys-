import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function NotFoundPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
          <Compass size={28} />
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-text">404</h2>
        <p className="mt-2 text-secondary-text">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button>
              <Home size={16} className="mr-2" />
              Back home
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export default NotFoundPage;
