import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChefHat,
  Clock3,
  Flame,
  HandCoins,
  Menu as MenuIcon,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { listMenuItems } from '../api/menu';
import { IMAGE_FALLBACK } from '../lib/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

// Get API base URL for constructing absolute image paths
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8007';

/* ---------------------------------------------------------------
   Restaurant experience features — static content, no backend needed
--------------------------------------------------------------- */
const experience = [
  {
    icon: MenuIcon,
    title: 'Explore Our Menu',
    description: 'Discover carefully selected dishes, from wood-fired pizza to chef specials.',
  },
  {
    icon: Clock3,
    title: 'Seamless Dining',
    description: 'Start your table session and order in a few taps — no waiting at the counter.',
  },
  {
    icon: ChefHat,
    title: 'Freshly Prepared',
    description: 'Your order enters the restaurant workflow and is crafted the moment you submit it.',
  },
  {
    icon: HandCoins,
    title: 'Guest Services',
    description: 'Request the bill, share feedback, or call a waiter whenever you need assistance.',
  },
];

/* ---------------------------------------------------------------
   Featured-foods hero image assets — existing Unsplash URLs already used
--------------------------------------------------------------- */
const heroImage =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80';

const chefImage =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80';

function LandingPage() {
  const navigate = useNavigate();

  const [featuredItems, setFeaturedItems] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  /* Fetch real menu items from the existing API.
     If it fails, we still render a graceful empty-state panel. */
  useEffect(() => {
    let mounted = true;

    const loadFeatured = async () => {
      try {
        const response = await listMenuItems({
          page: 1,
          page_size: 6,
          sort_by: 'name',
          sort_dir: 'asc',
        });

        const payload = response?.data;
        const items = Array.isArray(payload)
          ? payload
          : payload?.items || [];

        if (mounted) {
          setFeaturedItems(items);
        }
      } catch (error) {
        if (mounted) {
          setFeaturedItems([]);
        }
      } finally {
        if (mounted) {
          setFeaturedLoading(false);
        }
      }
    };

    loadFeatured();

    return () => {
      mounted = false;
    };
  }, []);

  const goToMenu = () => navigate('/menu');
  const goToDining = () => navigate('/session');
  const goToStaff = () => navigate('/login');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-20"
    >
      {/* ------------------------------------------------
          HERO
      ------------------------------------------------ */}
      <section className="relative overflow-hidden rounded-hero border border-border bg-gradient-to-br from-muted via-card to-background shadow-soft">
        <div className="grid items-stretch gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-primary shadow-soft">
                <UtensilsCrossed size={16} />
                Welcome to ServeSync
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight text-text sm:text-5xl lg:text-[3.4rem]">
                Good food.
                <br />
                <span className="text-primary">Great moments.</span>
                <br />
                Seamless dining.
              </h1>

              <p className="mt-5 max-w-md text-lg leading-relaxed text-secondary-text">
                Step into a dining experience designed around you — browse the
                menu, start your table, and let our kitchen take care of the rest.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  className="h-12 gap-2 px-6 text-base"
                  onClick={goToMenu}
                >
                  Explore Menu
                  <ArrowRight size={18} />
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 gap-2 px-6 text-base"
                  onClick={goToDining}
                >
                  <ShoppingBag size={18} />
                  Start Dining
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-secondary-text">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">
                  <Star size={14} fill="currentColor" />
                  Guest favourite
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  <Flame size={14} />
                  Chef specials
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 font-medium text-success">
                  <Sparkles size={14} />
                  Live kitchen
                </span>
              </div>
            </motion.div>
          </div>

          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <img
              src={heroImage}
              alt="Elegant restaurant dining room"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-muted/60 via-transparent to-transparent lg:from-card/40" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------
          RESTAURANT EXPERIENCE
      ------------------------------------------------ */}
      <section className="page-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            The Experience
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
            Every moment, thoughtfully served
          </h2>
          <p className="mt-4 text-secondary-text">
            From the moment you arrive to the last bite, ServeSync brings your
            dining experience together.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {experience.map(
            ({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-dropdown">
                  <div className="flex h-12 w-12 items-center justify-center rounded-button bg-primary/10 text-primary">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-text">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-text">
                    {description}
                  </p>
                </Card>
              </motion.div>
            ),
          )}
        </div>
      </section>

      {/* ------------------------------------------------
          FEATURED FOOD
      ------------------------------------------------ */}
      <section className="page-shell">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Featured Dishes
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
              What's cooking today
            </h2>
            <p className="mt-4 max-w-xl text-secondary-text">
              A curated look at dishes from the live menu — ready to order the
              moment you start your table.
            </p>
          </div>
          <Button variant="ghost" className="gap-2" onClick={goToMenu}>
            View full menu
            <ArrowRight size={16} />
          </Button>
        </div>

        {featuredLoading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden p-0">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              </Card>
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.slice(0, 6).map((item, index) => {
              // Convert relative path to absolute URL
              const getImageSrc = () => {
                if (!item?.image || item?.imageError) return IMAGE_FALLBACK;
                
                // If image path is already a full URL, use it as is
                if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
                  return item.image;
                }
                
                // Otherwise, prepend API base URL
                const imagePath = item.image.startsWith('/') ? item.image.slice(1) : item.image;
                return `${API_BASE_URL}/${imagePath}`;
              };
              
              const imageSrc = getImageSrc();

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
                >
                  <Card className="group flex h-full flex-col overflow-hidden p-0">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={imageSrc}
                        alt={item.name || 'Dish'}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      {(item.chef_special || item.best_seller) && (
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {item.chef_special && (
                            <span className="rounded-full border border-white/40 bg-primary/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                              Chef special
                            </span>
                          )}
                          {item.best_seller && (
                            <span className="rounded-full border border-white/40 bg-accent/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                              Best seller
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-text">
                          {item.name}
                        </h3>
                        <span className="text-price text-primary">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-secondary-text">
                        {item.description ||
                          'Freshly prepared with care.'}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm text-secondary-text">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {item.cook_time ? `${item.cook_time} min` : 'Fresh'}
                        </span>
                        <span
                          className={
                            item.availability
                              ? 'font-medium text-success'
                              : 'font-medium text-error'
                          }
                        >
                          {item.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <Button
                        className="mt-4 w-full gap-2"
                        onClick={goToDining}
                      >
                        <ShoppingBag size={16} />
                        Order now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="mt-10 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChefHat size={26} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-text">
              Fresh dishes coming right up
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-secondary-text">
              The menu is being prepared at the moment. Explore the full menu or
              start your dining experience now.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={goToMenu}>Explore Menu</Button>
              <Button variant="secondary" onClick={goToDining}>
                Start Dining
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* ------------------------------------------------
          CULINARY IMAGE SPLIT
      ------------------------------------------------ */}
      <section className="page-shell">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden p-0">
              <img
                src={chefImage}
                alt="Chef preparing a fresh dish"
                loading="lazy"
                decoding="async"
                className="h-72 w-full object-cover sm:h-80"
              />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Crafted with care
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
              Plated to order, served fresh
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-secondary-text">
              Every dish is freshly prepared when you order. Our kitchen tracks
              progress in real time, so you always know exactly where your meal
              is — from the pass to your table.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Live kitchen order tracking',
                'Fresh preparation for every guest',
                'Special instructions honoured',
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-text"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
                    <Sparkles size={13} />
                  </span>
                  <span className="text-sm font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------
          CTA
      ------------------------------------------------ */}
      <section className="page-shell">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover p-8 text-center shadow-dialog sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Ready for a memorable dining experience?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Explore the menu, start your table, and let ServeSync take care of
              everything in between.
            </p>
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4">
                <Button
                  className="h-12 w-full sm:w-auto px-6 sm:px-8 gap-2 border-0 bg-primary text-base text-white shadow-lg hover:scale-110"
                  onClick={goToMenu}
                >
                  Explore Menu
                  <ArrowRight size={18} />
                </Button>
                <Button
                  className="h-12 w-full sm:w-auto px-6 sm:px-8 gap-2 border-0 bg-primary text-base text-white shadow-lg hover:scale-110"
                  onClick={goToDining}
                >
                  <ShoppingBag size={18} />
                  Start Dining
                </Button>
              </div>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------
          STAFF LOGIN (secondary)
      ------------------------------------------------ */}
      <section className="mx-auto max-w-md text-center">
        <p className="text-sm text-secondary-text">Staff member?</p>
        <button
          type="button"
          onClick={goToStaff}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          Staff Login
          <ArrowRight size={14} />
        </button>
        <p className="mt-8 text-xs text-secondary-text/70">
          ServeSync — © 2026 Restaurant Experience
        </p>
      </section>
    </motion.div>
  );
}

export default memo(LandingPage);