import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles, Star, ShoppingBag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMenuByCategory, listMenuItems, searchMenuItems } from '../api/menu';
import { listCategories } from '../api/admin';
import CartDrawer from '../components/cart/CartDrawer';
import MenuCard from '../components/menu/MenuCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useCustomerSession } from '../context/CustomerSessionContext';
import { groupMenuItemsByVariant } from '../utils/menuVariants';

function MenuPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [meta, setMeta] = useState({ total_pages: 1, total_items: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const { items: cartItems, addItem } = useCart();
  const { session } = useCustomerSession();
  const hasActiveSession = session?.status === 'ACTIVE';

  const loadMenu = async (nextPage = 1, nextSearch = search, category = selectedCategory, nextSortBy = sortBy, nextSortDir = sortDir) => {
    setLoading(true);
    setError('');

    try {
      let response;
      let rawItems = [];
      
      if (nextSearch.trim()) {
        response = await searchMenuItems(nextSearch.trim());
        rawItems = response.data || [];
        setMeta({ total_pages: 1, total_items: rawItems.length });
      } else if (category !== 'all' && !isNaN(Number(category))) {
        // Only call getMenuByCategory if category is a valid number
        response = await getMenuByCategory(Number(category));
        rawItems = response.data || [];
        setMeta({ total_pages: 1, total_items: rawItems.length });
      } else {
        // Handle 'all', 'chef', and 'seller' filters
        const params = { page: nextPage, page_size: pageSize, sort_by: nextSortBy, sort_dir: nextSortDir };
        if (category === 'chef') {
          params.chef_special = true;
        } else if (category === 'seller') {
          params.best_seller = true;
        }
        response = await listMenuItems(params);
        const payload = response.data;
        rawItems = payload?.items || [];
        setMeta({ total_pages: payload?.total_pages || 1, total_items: payload?.total_items || 0 });
      }
      
      // Group items with Half Plate / Full Plate variants
      const groupedItems = groupMenuItemsByVariant(rawItems);
      setItems(groupedItems);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load the menu right now.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await listCategories({ page: 1, page_size: 50 });
        setCategories(response.data?.items || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    loadMenu(page);
  }, [page, sortBy, sortDir, selectedCategory]);

  const filteredItems = useMemo(() => {
    const baseItems = [...items];
    return baseItems.sort((a, b) => {
      if (sortBy === 'price') {
        return sortDir === 'asc' ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price);
      }
      return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
  }, [items, sortBy, sortDir]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    if (!value.trim()) {
      loadMenu(1, '', selectedCategory, sortBy, sortDir);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadMenu(1, search, selectedCategory, sortBy, sortDir);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('name');
    setSortDir('asc');
    setPage(1);
    loadMenu(1, '', 'all', 'name', 'asc');
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-hero border border-border bg-gradient-to-br from-muted via-card to-background p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Menu Catalog</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">Explore our full menu</h1>
            <p className="mt-2 max-w-2xl text-sm text-secondary-text">Discover dishes with live availability, category filters, search, and chef-curated specials and best sellers.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-secondary-text">
            <span className="font-semibold text-text">{meta.total_items}</span> dishes available
          </div>
        </div>
      </motion.section>

      <Card className="space-y-4">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label htmlFor="menu-search" className="flex flex-1 items-center gap-2 rounded-table border border-border bg-muted px-3 py-2">
            <Search size={16} className="text-primary" aria-hidden="true" />
            <Input
              id="menu-search"
              className="border-0 bg-transparent p-0 shadow-none focus:ring-0"
              placeholder="Search dishes"
              value={search}
              onChange={handleSearch}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <label htmlFor="menu-category" className="flex items-center gap-2 rounded-table border border-border bg-muted px-3 py-2 text-sm text-text">
              <SlidersHorizontal size={16} className="text-primary" aria-hidden="true" />
              <select id="menu-category" className="bg-transparent outline-none" value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setPage(1); }}>
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label htmlFor="menu-sortby" className="flex items-center gap-2 rounded-table border border-border bg-muted px-3 py-2 text-sm text-text">
              <Sparkles size={16} className="text-primary" aria-hidden="true" />
              <select id="menu-sortby" className="bg-transparent outline-none" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}>
                <option value="name">Sort by name</option>
                <option value="price">Sort by price</option>
              </select>
            </label>
            <label htmlFor="menu-sortdir" className="flex items-center gap-2 rounded-table border border-border bg-muted px-3 py-2 text-sm text-text">
              <Star size={16} className="text-primary" aria-hidden="true" />
              <select id="menu-sortdir" className="bg-transparent outline-none" value={sortDir} onChange={(event) => { setSortDir(event.target.value); setPage(1); }}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
            <Button type="button" variant="secondary" onClick={resetFilters}>Reset</Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant={selectedCategory === 'all' ? 'default' : 'secondary'} onClick={() => { setSelectedCategory('all'); setPage(1); }}>
          All dishes
        </Button>
        <Button type="button" variant={selectedCategory === 'chef' ? 'default' : 'secondary'} onClick={() => { setSelectedCategory('chef'); setPage(1); }}>
          Chef specials
        </Button>
        <Button type="button" variant={selectedCategory === 'seller' ? 'default' : 'secondary'} onClick={() => { setSelectedCategory('seller'); setPage(1); }}>
          Best sellers
        </Button>
      </div>

      {/* Active dining session banner */}
      {hasActiveSession && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-table border border-success/20 bg-success/5 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">
                  You're dining at table {session?.table_number}
                </p>
                <p className="text-sm text-secondary-text">
                  {session?.name
                    ? `${session.name} — tap "Add to Order" on any dish to build your order.`
                    : 'Tap "Add to Order" on any dish to build your order.'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/session')}
              className="gap-2"
            >
              <Users size={16} />
              My Session
            </Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
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
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold text-text">We couldn’t load the menu</p>
          <p className="mt-2 text-sm text-secondary-text">{error}</p>
          <Button className="mt-4" onClick={() => loadMenu(page)}>Try again</Button>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold text-text">No dishes matched your filters</p>
          <p className="mt-2 text-sm text-secondary-text">Try a different keyword or reset the filters.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              hasActiveSession={hasActiveSession}
              onAddToCart={(menuItemData) => {
                // Extract the actual menu item and variant info
                const { selectedVariant, ...menuItem } = menuItemData;
                
                // If it's a variant item, use the selected variant's ID
                const menuItemId = selectedVariant ? selectedVariant.id : menuItem.id;
                const price = selectedVariant ? selectedVariant.price : menuItem.price;
                
                addItem({
                  id: menuItemId,
                  name: menuItem.name,
                  price: price,
                  image: menuItem.image,
                  quantity: 1,
                });
                setCartOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {!loading && !error && meta.total_pages > 1 && (
        <div className="flex items-center justify-between rounded-panel border border-border bg-card p-4">
          <p className="text-sm text-secondary-text">Page {page} of {meta.total_pages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </Button>
            <Button disabled={page >= meta.total_pages} onClick={() => setPage((value) => value + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setCartOpen(true)}
        aria-label="Open your cart"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover"
      >
        <ShoppingBag size={16} aria-hidden="true" />
        Cart {cartItems.length > 0 ? `(${cartItems.length})` : ''}
      </button>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default MenuPage;

