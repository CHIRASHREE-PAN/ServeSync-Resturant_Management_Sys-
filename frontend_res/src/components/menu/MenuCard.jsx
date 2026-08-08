import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Clock3, Sparkles, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { IMAGE_FALLBACK } from '../../lib/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';

const MenuCard = memo(function MenuCard({ item, onOpenCart }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();
  const imageSrc = !imageError && item?.image ? item.image : IMAGE_FALLBACK;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-soft">
        <div className="relative h-48 overflow-hidden bg-muted">
          {!imageLoaded ? (
            <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
          ) : null}
          <img
            src={imageSrc}
            alt={item?.name || 'Menu item'}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {(item?.chef_special || item?.best_seller) && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {item?.chef_special && (
                <span className="rounded-full border border-white/40 bg-primary/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                  Chef special
                </span>
              )}
              {item?.best_seller && (
                <span className="rounded-full border border-white/40 bg-accent/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                  Best seller
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-text">{item?.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-secondary-text">{item?.description || 'Freshly prepared with care.'}</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-primary">${Number(item?.price || 0).toFixed(2)}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-secondary-text">
            {item?.calories ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Flame size={14} /> {item.calories} kcal
              </span>
            ) : null}
            {item?.cook_time ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Clock3 size={14} /> {item.cook_time} min
              </span>
            ) : null}
            {item?.best_seller ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Star size={14} /> Popular
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm text-secondary-text">
            <span className="inline-flex items-center gap-1 font-medium text-accent">
              <Sparkles size={14} /> Chef crafted
            </span>
            <span className={item?.availability ? 'font-medium text-success' : 'font-medium text-error'}>
              {item?.availability ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <Button className="mt-4 gap-2" onClick={() => { addItem(item); onOpenCart?.(); }}>
            <ShoppingCart size={16} /> Add to cart
          </Button>
        </div>
      </Card>
    </motion.article>
  );
});

export default MenuCard;
