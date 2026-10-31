import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
import { useSubscription } from '../../context/SubscriptionContext';
import { FEATURES } from '../../utils/featureAccess';
import { PLAN_IDS } from '../../data/subscriptionPlans';
import { AUTOMOTIVE_PRODUCTS } from '../../data/automotiveProducts';
import { MOCK_MANUFACTURER_PROFILES } from '../../data/mockData';
=======
import { AUTOMOTIVE_PRODUCTS, PRODUCT_CATEGORIES } from '../../data/automotiveProducts';
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
import ProductCard from '../../components/marketplace/ProductCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { MessageSquare, PlusCircle, RotateCcw, Search, SlidersHorizontal, Star } from 'lucide-react';

const CUSTOMER_IMAGE_OVERRIDES = {
  prod_004: '/images/voltcore-agm-battery.png',
  prod_009: '/images/proride-monotube-shock-absorber.png',
  prod_010: '/images/optiwire-engine-wiring-harness.png',
  prod_011: '/images/sightview-power-folding-side-mirror.png',
  prod_012: '/images/fluxdrive-150kw-ev-motor.png',
  prod_013: '/images/titanpack-48kwh-ev-battery-pack.png',
  prod_014: '/images/sensiq-77ghz-automotive-radar-sensor.png',
  prod_015: '/images/coolcore-dual-pass-radiator.png',
  prod_017: '/images/synchromesh-helical-differential-gear-set.png',
  prod_018: '/images/precisiontrack-eps-rack.png',
};

const indicativeUnitPriceValue = (priceRange) => {
  const values = priceRange.match(/[\d,]+/g)?.map((value) => Number(value.replaceAll(',', ''))) ?? [];
  const [minimum, maximum = minimum] = values;
  return Math.round((minimum + maximum) / 2);
};

const indicativeUnitPrice = (priceRange) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(indicativeUnitPriceValue(priceRange));
};

export const CustomerMarketplacePage = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { role, getOrCreateConversationForProduct } = useAuth();
  const { hasAccess, openUpgradeModal, showToast } = useSubscription();
=======
  const { getOrCreateConversationForProduct } = useAuth();
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);

<<<<<<< HEAD
  const handleContactManufacturer = (mfg) => {
    if (!hasAccess(FEATURES.SUBMIT_REQUIREMENTS)) {
      openUpgradeModal(
        PLAN_IDS.PROFESSIONAL,
        'Post Custom Requirement',
        'Broadcasting custom engineering requirements and RFQs to verified machine shops requires a Professional plan.'
      );
      return;
    }
    // Navigate to post requirement with this manufacturer pre-selected or chat
    navigate(`/customer/post-requirement?mfg=${encodeURIComponent(mfg.name)}`);
  };

  const handleChatProduct = (product) => {
    if (!hasAccess(FEATURES.MANUFACTURER_CHAT)) {
      openUpgradeModal(
        PLAN_IDS.PROFESSIONAL,
        'Direct Manufacturer Messaging',
        'Direct chat with suppliers and quotation negotiation require a Professional plan.'
      );
      return;
    }
    const conv = getOrCreateConversationForProduct(product);
    setSelectedProduct(null);
    navigate(`/customer/messages/${conv.id}`);
  };

  // Filter Manufacturers
  const filteredManufacturers = useMemo(() => {
    return ALL_MANUFACTURERS.filter((mfg) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mfg.name.toLowerCase().includes(q) ||
        mfg.tagline.toLowerCase().includes(q) ||
        mfg.industry.toLowerCase().includes(q) ||
        mfg.processes.some((p) => p.toLowerCase().includes(q)) ||
        mfg.materials.some((m) => m.toLowerCase().includes(q)) ||
        mfg.sampleProducts.some((p) => p.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'All Categories' ||
        mfg.industry.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory === 'Metal & Steel' ||
        selectedCategory === 'Automotive';

      const matchesProcess =
        selectedProcess === 'All Processes' ||
        mfg.processes.some((p) => p.toLowerCase().includes(selectedProcess.toLowerCase()));

      const matchesMaterial =
        selectedMaterial === 'All Materials' ||
        mfg.materials.some((m) => m.toLowerCase().includes(selectedMaterial.toLowerCase()));

      const matchesVerified = !verifiedOnly || mfg.verified;
      const matchesMoq = mfg.moq <= maxMoq;

      return matchesSearch && matchesCat && matchesProcess && matchesMaterial && matchesVerified && matchesMoq;
    });
  }, [searchQuery, selectedCategory, selectedProcess, selectedMaterial, verifiedOnly, maxMoq]);

  // Filter Products
=======
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const products = AUTOMOTIVE_PRODUCTS.filter((product) => {
      const searchable = [
        product.name,
        product.category,
        product.description,
        product.material,
        product.manufacturer?.name,
        product.manufacturer?.location,
      ].filter(Boolean).join(' ').toLowerCase();

      return (!query || searchable.includes(query)) &&
        (selectedCategory === 'All Categories' || product.category === selectedCategory);
    });

    if (sortBy === 'price_asc') return products.sort((a, b) => indicativeUnitPriceValue(a.priceINR) - indicativeUnitPriceValue(b.priceINR));
    if (sortBy === 'price_desc') return products.sort((a, b) => indicativeUnitPriceValue(b.priceINR) - indicativeUnitPriceValue(a.priceINR));
    if (sortBy === 'rating') return products.sort((a, b) => b.manufacturer.rating - a.manufacturer.rating);
    return products;
  }, [searchQuery, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('featured');
  };

  const chatWithManufacturer = (product) => {
    const conversation = getOrCreateConversationForProduct(product);
    setSelectedProduct(null);
    navigate(`/customer/messages/${conversation.id}`);
  };

  const displayedProduct = (product) => ({
    ...product,
    image: CUSTOMER_IMAGE_OVERRIDES[product.id] ?? product.image,
    priceINR: indicativeUnitPrice(product.priceINR),
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-teal-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="teal" size="xs" dot>Customer Marketplace</Badge>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Automotive Parts Catalogue
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-600 sm:text-sm">
            Browse automotive components, compare indicative unit pricing, and connect with manufacturers.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/customer/post-requirement')}
          leftIcon={<PlusCircle size={15} />}
          className="shrink-0 bg-teal-600 font-bold text-white hover:bg-teal-700"
        >
          Post Requirement
        </Button>
      </header>

      <div className="space-y-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-xs sm:p-5">
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
          <label className="relative md:col-span-7">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search product, category, material, or manufacturer"
              aria-label="Search products"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="relative md:col-span-3">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-700" size={14} />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Filter by category"
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort products"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2"
          >
            <option value="featured">Featured order</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-teal-50 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-slate-500">Categories</span>
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                    selectedCategory === category
                      ? 'border-teal-700 bg-teal-700 font-bold text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of 18 products</span>
            {(searchQuery || selectedCategory !== 'All Categories' || sortBy !== 'featured') && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900">
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredProducts.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={displayedProduct(product)}
              onContactSupplier={chatWithManufacturer}
              onViewDetails={setSelectedProduct}
              strictImage
              hideDemoBadge
              containImage
              chatButtonStyle
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-teal-100 bg-white p-10 text-center">
          <p className="font-heading text-base font-bold text-slate-900">No products match those filters.</p>
          <p className="mt-1 text-xs text-slate-600">Try another search or reset the category.</p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 border-teal-200 text-teal-800">
            Reset filters
          </Button>
        </div>
      )}

      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          description={`${selectedProduct.category} · Manufacturer: ${selectedProduct.manufacturer.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {displayedProduct(selectedProduct).image && (
              <div className="h-52 overflow-hidden rounded-xl bg-slate-100">
                <img src={displayedProduct(selectedProduct).image} alt={selectedProduct.name} className="h-full w-full object-contain p-3" />
              </div>
            )}
            <p className="text-sm leading-relaxed text-slate-600">{selectedProduct.description}</p>
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs sm:grid-cols-2">
              <div><span className="text-slate-500">Indicative price per unit:</span> <strong className="text-slate-900">{displayedProduct(selectedProduct).priceINR}</strong></div>
              <div><span className="text-slate-500">Minimum order:</span> <strong className="text-slate-900">{selectedProduct.moq} units</strong></div>
              <div><span className="text-slate-500">Material:</span> <strong className="text-slate-900">{selectedProduct.material}</strong></div>
              <div><span className="text-slate-500">Lead time:</span> <strong className="text-slate-900">{selectedProduct.deliveryTimeline}</strong></div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Technical specifications</h3>
              <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {selectedProduct.specifications.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-3 border-b border-slate-100 pb-1">
                    <dt className="text-slate-500">{spec.label}</dt><dd className="text-right font-semibold text-slate-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
<<<<<<< HEAD
            <div className="flex justify-end gap-2 pt-2 border-t border-teal-100 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  showToast(`Simulated Order: ${selectedProduct.name} (${selectedProduct.moq} units) confirmed at listed rate.`);
                  setSelectedProduct(null);
                  navigate('/customer/orders');
                }}
                className="bg-slate-900 hover:bg-black text-white font-bold"
              >
                Order Listed Batch
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChatProduct(selectedProduct)}
                leftIcon={<MessageSquare size={14} className="text-teal-600" />}
                className="border-teal-200 text-teal-800 hover:bg-teal-50"
              >
                Chat with Supplier
=======
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900">{selectedProduct.manufacturer.name}</p>
                <p className="text-slate-500">{selectedProduct.manufacturer.location} · {selectedProduct.manufacturer.responseRate} response rate</p>
                <p className="text-amber-700">Rating <Star size={11} className="inline fill-current" /> {selectedProduct.manufacturer.rating} ({selectedProduct.manufacturer.reviewCount} reviews)</p>
              </div>
            </div>
            {selectedProduct.customizableOptions && (
              <div className="rounded-xl border border-teal-100 p-3">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-teal-800">Customization options</h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(selectedProduct.customizableOptions).map(([key, options]) => (
                    <p key={key}><span className="font-semibold capitalize text-slate-700">{key.replace(/([A-Z])/g, ' $1')}:</span> <span className="text-slate-600">{options.join(', ')}</span></p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2 border-t border-teal-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>Close</Button>
              <Button variant="outline" size="sm" onClick={() => chatWithManufacturer(selectedProduct)} leftIcon={<MessageSquare size={14} />} className="border-teal-200 text-teal-800">
                Chat with Manufacturer
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
              </Button>
              <Button
                variant="primary"
                size="sm"
<<<<<<< HEAD
                onClick={() => {
                  const p = selectedProduct;
                  if (!hasAccess(FEATURES.CUSTOMIZE_PRODUCTS)) {
                    openUpgradeModal(
                      PLAN_IDS.PROFESSIONAL,
                      'AI Customization Studio',
                      'Custom product modification and parametric design require a Professional plan.'
                    );
                    return;
                  }
                  setSelectedProduct(null);
                  navigate(`/customize/${p.id}`);
                }}
                leftIcon={<Sliders size={14} />}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Customize with AI
=======
                onClick={() => navigate(`/customize/${selectedProduct.id}`)}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Customize with AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/customer/post-requirement?part=${encodeURIComponent(selectedProduct.name)}&mfg=${encodeURIComponent(selectedProduct.manufacturer.name)}`)}
                className="border-teal-200 text-teal-800"
              >
                Request a Quote
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default CustomerMarketplacePage;
