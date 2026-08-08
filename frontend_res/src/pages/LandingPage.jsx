import { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChefHat, Clock3, Flame, HeartHandshake, MenuSquare, Sparkles, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const features = [
  { icon: Clock3, title: 'Real-time order tracking', description: 'Every order moves seamlessly from the dining table to the kitchen and back.' },
  { icon: Flame, title: 'Signature menu management', description: 'Curate chef specials and best sellers with live availability controls.' },
  { icon: HeartHandshake, title: 'Guest-first service', description: 'Bill generation, feedback, and waiter assistance at the touch of a button.' },
];

const categories = ['Starters', 'Main Course', 'Wood-fired Pizza', 'Desserts', 'Beverages'];

const reviews = [
  {
    name: 'Ava',
    role: 'Head Waitress',
    quote: 'ServeSync keeps our floor running smoothly. Orders reach the kitchen instantly.',
  },
  {
    name: 'Daniel',
    role: 'Restaurant Manager',
    quote: 'A complete operations dashboard — from daily reports to guest feedback, all in one place.',
  },
];

const LandingPage = memo(function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-muted via-card to-background p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-primary">
              <Sparkles size={16} />
              Restaurant Management Platform
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-text sm:text-5xl">
              Streamline every order, from table to kitchen.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-secondary-text">
              A complete operations platform for your restaurant — managed tables, live menu updates, kitchen coordination, billing, and guest feedback.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => navigate('/menu')}>
                Browse Menu <ArrowRight size={16} />
              </Button>
              <Button variant="secondary" onClick={() => navigate('/login')}>Staff Sign In</Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-secondary-text">
              <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">OTP-secured staff access</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">Live kitchen sync</span>
              <span className="rounded-full bg-secondary/10 px-3 py-1 font-medium text-secondary">Automated billing</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
              alt="Upscale restaurant interior"
              loading="lazy"
              decoding="async"
              className="relative h-[360px] w-full rounded-[28px] object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="transition hover:-translate-y-1">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-text">{title}</h3>
                <p className="mt-1 text-sm text-secondary-text">{description}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-gradient-to-br from-muted to-card">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            <ChefHat size={16} />
            Chef Specials
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-text">Signature dishes, beautifully presented.</h2>
          <p className="mt-3 text-secondary-text">
            Highlight your finest offerings with bold imagery and an inviting restaurant-first feel.
          </p>
          <div className="mt-5 space-y-3">
            {['Wood-fired Margherita', 'Grilled Paneer Tikka', 'Belgian Chocolate Mousse'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <span className="font-medium text-text">{item}</span>
                <span className="text-sm text-secondary-text">House specialty</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80"
            alt="Chef plating a gourmet dish"
            loading="lazy"
            decoding="async"
            className="h-72 w-full object-cover"
          />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            <MenuSquare size={16} />
            Menu Categories
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {categories.map((category) => (
              <span key={category} className="rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-text">
                {category}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            <Star size={16} />
            Guest Testimonials
          </div>
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-2xl border border-border bg-muted p-4">
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${review.name}-${index}`} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-2 text-sm text-secondary-text">“{review.quote}”</p>
                <p className="mt-2 text-sm font-semibold text-text">{review.name} • {review.role}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-8 text-center shadow-soft">
        <h2 className="text-3xl font-semibold text-text">Ready to welcome your next guest?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-secondary-text">
          Take control of your restaurant operations with real-time order management, kitchen coordination, and guest insights.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
          <Button variant="secondary" onClick={() => navigate('/login')}>Staff Sign In</Button>
        </div>
      </section>
    </motion.div>
  );
});

export default LandingPage;
