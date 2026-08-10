import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Star,
  Clock3,
  Sparkles,
  ShoppingCart,
  CalendarCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getVariantPrice, getVariantImage } from '../../utils/menuVariants';

const FOOD_PLACEHOLDER =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80';

// Get API base URL for constructing absolute image paths
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8007';

const MenuCard = memo(function MenuCard({
  item,
  onAddToCart,
  hasActiveSession,
}) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSessionPrompt, setShowSessionPrompt] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    item.hasVariants ? item.variants[0]?.name : null
  );

  /*
   * Image logic:
   * - Use backend `item.image` if present.
   * - If image is null/empty or fails to load, fall back to a food placeholder.
   * - Never show a broken image.
   */
  const hasValidImage = Boolean(item?.image && !imageError);

  // Get the effective image based on selected variant
  const getEffectiveImage = () => {
    if (!item.hasVariants) {
      // Regular item - use original logic
      if (!hasValidImage) return FOOD_PLACEHOLDER;

      if (
        item.image.startsWith('http://') ||
        item.image.startsWith('https://')
      ) {
        return item.image;
      }

      const imagePath = item.image.startsWith('/')
        ? item.image.slice(1)
        : item.image;

      return `${API_BASE_URL}/${imagePath}`;
    }

    // Variant item - use variant-aware image logic
    const variantImage = getVariantImage(item, selectedVariant);

    if (!variantImage) return FOOD_PLACEHOLDER;

    if (
      variantImage.startsWith('http://') ||
      variantImage.startsWith('https://')
    ) {
      return variantImage;
    }

    const imagePath = variantImage.startsWith('/')
      ? variantImage.slice(1)
      : variantImage;

    return `${API_BASE_URL}/${imagePath}`;
  };

  const imageSrc = getEffectiveImage();

  // Get effective price based on selected variant
  const effectivePrice = item.hasVariants
    ? getVariantPrice(item, selectedVariant)
    : item.price;

  const handleOrderClick = () => {
    if (hasActiveSession && item?.availability) {
      // For variant items, pass the selected variant's data
      if (item.hasVariants && selectedVariant) {
        const variant = item.variants.find(
          (v) => v.name === selectedVariant
        );

        onAddToCart?.({
          ...item,
          selectedVariant: variant,
        });
      } else {
        onAddToCart?.({ ...item });
      }

      return;
    }

    // No active session → show friendly "Ready to order?" prompt
    setShowSessionPrompt(true);
  };

  const handleVariantChange = (variantName) => {
    setSelectedVariant(variantName);
  };

  const closePrompt = () => setShowSessionPrompt(false);
  const goToDining = () => navigate('/session');

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="h-full"
      >
        <Card className="flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-soft">

          {/* Image */}
          <div className="relative z-0 h-56 shrink-0 overflow-hidden rounded-image bg-muted">
            {!imageLoaded ? (
              <div
                className="absolute inset-0 animate-pulse bg-muted"
                aria-hidden="true"
              />
            ) : null}

            <img
              src={imageSrc}
              alt={item?.name || 'Menu item'}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />

            {/* Chef Special / Best Seller badges */}
            {(item?.chef_special || item?.best_seller) && (
              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                {item?.chef_special && (
                  <span className="rounded-md bg-primary px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                    Chef Special
                  </span>
                )}

                {item?.best_seller && (
                  <span className="rounded-md bg-accent px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                    Best Seller
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="min-h-[3.5rem] text-lg font-semibold leading-7 text-text">
                  {item?.name}
                </h3>

                <p className="mt-1 min-h-[2.5rem] line-clamp-2 text-sm leading-5 text-secondary-text">
                  {item?.description || 'Freshly prepared with care.'}
                </p>
              </div>

              <div className="shrink-0 rounded-full bg-muted px-3 py-1 text-price text-primary">
                ${Number(effectivePrice || 0).toFixed(2)}
              </div>
            </div>

            <div className="mt-4 min-h-[5.5rem] flex flex-wrap content-start gap-3 text-sm text-secondary-text">
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

            {/* Variant Selection */}
            {item.hasVariants && item.variants.length > 0 && (
              <div className="mt-4 min-h-[7rem] space-y-2">
                <p className="text-sm font-medium text-text">
                  Choose portion:
                </p>

                <div className="space-y-2">
                  {item.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition ${
                        selectedVariant === variant.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`variant-${item.id}`}
                          checked={selectedVariant === variant.name}
                          onChange={() =>
                            handleVariantChange(variant.name)
                          }
                          className="text-primary focus:ring-primary"
                          disabled={!variant.availability}
                        />

                        <span
                          className={`text-sm ${
                            !variant.availability
                              ? 'text-secondary-text/50 line-through'
                              : 'text-text'
                          }`}
                        >
                          {variant.name}
                        </span>
                      </div>

                      <span
                        className={`text-sm font-semibold ${
                          !variant.availability
                            ? 'text-secondary-text/50'
                            : 'text-primary'
                        }`}
                      >
                        ${Number(variant.price || 0).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex min-h-[3rem] items-center justify-between border-t border-border pt-4 text-sm text-secondary-text">
              <span className="inline-flex items-center gap-1 font-medium text-accent">
                <Sparkles size={14} /> Chef crafted
              </span>

              <span
                className={
                  item?.availability
                    ? 'font-medium text-success'
                    : 'font-medium text-error'
                }
              >
                {item?.availability ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <Button
              className="mt-4 h-14 w-full shrink-0 gap-2"
              onClick={handleOrderClick}
              disabled={!item?.availability}
            >
              {hasActiveSession ? (
                <>
                  <ShoppingCart size={16} /> Add to Order
                </>
              ) : (
                <>
                  <UtensilsCrossed size={16} /> Order this dish
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.article>

      {/* Friendly session prompt — shown when guests try to order without an active session */}
      {showSessionPrompt && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-text/40 px-4 backdrop-blur-sm animate-fade-in"
          onClick={closePrompt}
          role="presentation"
        >
          <div
            className="surface-dialog w-full max-w-md p-6 text-center outline-none animate-slide-up"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Start dining to order"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarCheck size={28} />
            </div>

            <h3 className="mt-4 text-xl font-semibold text-text">
              Ready to order?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              Start your dining session to add dishes to your order.
            </p>

            <Button className="mt-6 w-full gap-2" onClick={goToDining}>
              <CalendarCheck size={16} /> Start Dining
            </Button>

            <button
              type="button"
              onClick={closePrompt}
              className="mt-3 w-full rounded-button px-4 py-2 text-sm font-medium text-secondary-text transition hover:bg-muted"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default MenuCard;