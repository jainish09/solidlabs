import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { FEATURES } from '../../utils/featureAccess';
import { PLAN_IDS } from '../../data/subscriptionPlans';
import {
  CUSTOMER_MARKETPLACE_PRODUCTS,
  PRODUCT_CATEGORIES,
} from '../../data/automotiveProducts';
import ProductCard from '../../components/marketplace/ProductCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  MessageSquare,
  PlusCircle,
  RotateCcw,
  Search,
  Sliders,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

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

const indicativeUnitPriceValue = (priceRange = '') => {
  const values =
    String(priceRange)
      .match(/[\d,]+/g)
      ?.map((value) => Number(value.replaceAll(',', '')))
      .filter(Number.isFinite) ?? [];

  if (values.length === 0) return 0;

  const [minimum, maximum = minimum] = values;
  return Math.round((minimum + maximum) / 2);
};

const indicativeUnitPrice = (priceRange) => {
  const value = indicativeUnitPriceValue(priceRange);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const CATEGORY_PRODUCT_COUNTS = new Map(
  PRODUCT_CATEGORIES.map((category) => [
    category,
    category === 'All Categories'
      ? CUSTOMER_MARKETPLACE_PRODUCTS.length
      : CUSTOMER_MARKETPLACE_PRODUCTS.filter(
          (product) => product.category === category
        ).length,
  ])
);

export const CustomerMarketplacePage = () => {
  const navigate = useNavigate();

  const { getOrCreateConversationForProduct } = useAuth();

  const { hasAccess, openUpgradeModal } = useSubscription();

  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('q') || ''
  );

  const [selectedCategory, setSelectedCategory] =
    useState('All Categories');

  const [sortBy, setSortBy] = useState('featured');

  const [selectedProduct, setSelectedProduct] = useState(null);

  const requireFeature = (
    feature,
    title,
    description,
    callback
  ) => {
    if (!hasAccess(feature)) {
      openUpgradeModal(
        PLAN_IDS.PROFESSIONAL,
        title,
        description
      );
      return;
    }

    callback?.();
  };

  const handleChatProduct = (product) => {
    requireFeature(
      FEATURES.MANUFACTURER_CHAT,
      'Direct Manufacturer Messaging',
      'Direct chat with suppliers and quotation negotiation require a Professional plan.',
      () => {
        const conversation =
          getOrCreateConversationForProduct(product);

        setSelectedProduct(null);

        navigate(`/customer/messages/${conversation.id}`);
      }
    );
  };

  const handlePostRequirement = (product = null) => {
    requireFeature(
      FEATURES.SUBMIT_REQUIREMENTS,
      'Post Custom Requirement',
      'Submitting custom engineering requirements and RFQs to manufacturers requires a Professional plan.',
      () => {
        if (product) {
          navigate(
            `/customer/post-requirement?part=${encodeURIComponent(
              product.name
            )}&mfg=${encodeURIComponent(
              product.manufacturer?.name || ''
            )}`
          );
        } else {
          navigate('/customer/post-requirement');
        }
      }
    );
  };

  const handleCustomizeProduct = (product) => {
    requireFeature(
      FEATURES.CUSTOMIZE_PRODUCTS,
      'AI Customization Studio',
      'Custom product modification and parametric design require a Professional plan.',
      () => {
        setSelectedProduct(null);
        navigate(`/customize/${product.id}`);
      }
    );
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const products = CUSTOMER_MARKETPLACE_PRODUCTS.filter(
      (product) => {
        const searchable = [
          product.name,
          product.category,
          product.description,
          product.material,
          product.manufacturer?.name,
          product.manufacturer?.location,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return (
          (!query || searchable.includes(query)) &&
          (selectedCategory === 'All Categories' ||
            product.category === selectedCategory)
        );
      }
    );

    if (sortBy === 'price_asc') {
      return products.sort(
        (a, b) =>
          indicativeUnitPriceValue(a.priceINR) -
          indicativeUnitPriceValue(b.priceINR)
      );
    }

    if (sortBy === 'price_desc') {
      return products.sort(
        (a, b) =>
          indicativeUnitPriceValue(b.priceINR) -
          indicativeUnitPriceValue(a.priceINR)
      );
    }

    if (sortBy === 'rating') {
      return products.sort(
        (a, b) =>
          (b.manufacturer?.rating ?? 0) -
          (a.manufacturer?.rating ?? 0)
      );
    }

    return products;
  }, [searchQuery, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('featured');
  };

  const displayedProduct = (product) => ({
    ...product,
    image:
      CUSTOMER_IMAGE_OVERRIDES[product.id] ?? product.image,
    priceINR: indicativeUnitPrice(product.priceINR),
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-teal-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="teal" size="xs" dot>
              Customer Marketplace
            </Badge>
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
          onClick={() => handlePostRequirement()}
          leftIcon={<PlusCircle size={15} />}
          className="shrink-0 bg-teal-600 font-bold text-white hover:bg-teal-700"
        >
          Post Requirement
        </Button>
      </header>

      <div className="space-y-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-xs sm:p-5">
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
          <label className="relative md:col-span-7">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search product, category, material, or manufacturer"
              aria-label="Search products"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>

          <label className="relative md:col-span-3">
            <SlidersHorizontal
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
              size={14}
            />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              aria-label="Filter by category"
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
            <span className="font-mono text-slate-500">
              Categories
            </span>

            <div className="flex min-w-0 max-w-full flex-1 items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

                  <span className="ml-1 opacity-70">
                    {CATEGORY_PRODUCT_COUNTS.get(category) ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Showing{' '}
              <strong className="text-slate-900">
                {filteredProducts.length}
              </strong>{' '}
              of {CUSTOMER_MARKETPLACE_PRODUCTS.length} products
            </span>

            {(searchQuery ||
              selectedCategory !== 'All Categories' ||
              sortBy !== 'featured') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900"
              >
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
              onContactSupplier={handleChatProduct}
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
          <p className="font-heading text-base font-bold text-slate-900">
            No products match those filters.
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Try another search or reset the category.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-4 border-teal-200 text-teal-800"
          >
            Reset filters
          </Button>
        </div>
      )}

      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          description={`${selectedProduct.category} · Manufacturer: ${
            selectedProduct.manufacturer?.name ||
            'Not specified'
          }`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {displayedProduct(selectedProduct).image && (
              <div className="h-52 overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={displayedProduct(selectedProduct).image}
                  alt={selectedProduct.name}
                  className="h-full w-full object-contain p-3"
                />
              </div>
            )}

            <p className="text-sm leading-relaxed text-slate-600">
              {selectedProduct.description}
            </p>

            <div className="grid grid-cols-1 gap-2 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs sm:grid-cols-2">
              <div>
                <span className="text-slate-500">
                  Indicative price per unit:
                </span>{' '}
                <strong className="text-slate-900">
                  {displayedProduct(selectedProduct).priceINR}
                </strong>
              </div>

              <div>
                <span className="text-slate-500">
                  Minimum order:
                </span>{' '}
                <strong className="text-slate-900">
                  {selectedProduct.moq} units
                </strong>
              </div>

              <div>
                <span className="text-slate-500">Material:</span>{' '}
                <strong className="text-slate-900">
                  {selectedProduct.material || 'Not specified'}
                </strong>
              </div>

              <div>
                <span className="text-slate-500">Lead time:</span>{' '}
                <strong className="text-slate-900">
                  {selectedProduct.deliveryTimeline ||
                    'Contact manufacturer'}
                </strong>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                Technical specifications
              </h3>

              <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {(selectedProduct.specifications || []).map(
                  (spec) => (
                    <div
                      key={spec.label}
                      className="flex justify-between gap-3 border-b border-slate-100 pb-1"
                    >
                      <dt className="text-slate-500">
                        {spec.label}
                      </dt>

                      <dd className="text-right font-semibold text-slate-900">
                        {spec.value}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedProduct.manufacturer?.name ||
                    'Manufacturer not specified'}
                </p>

                <p className="text-slate-500">
                  {selectedProduct.manufacturer?.location ||
                    'Location not specified'}

                  {selectedProduct.manufacturer?.responseRate
                    ? ` · ${selectedProduct.manufacturer.responseRate} response rate`
                    : ''}
                </p>

                {selectedProduct.manufacturer?.rating != null && (
                  <p className="text-amber-700">
                    Rating{' '}
                    <Star
                      size={11}
                      className="inline fill-current"
                    />{' '}
                    {selectedProduct.manufacturer.rating}

                    {selectedProduct.manufacturer.reviewCount != null
                      ? ` (${selectedProduct.manufacturer.reviewCount} reviews)`
                      : ''}
                  </p>
                )}
              </div>
            </div>

            {selectedProduct.customizableOptions &&
              Object.keys(selectedProduct.customizableOptions).length >
                0 && (
                <div className="rounded-xl border border-teal-100 p-3">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-teal-800">
                    Customization options
                  </h3>

                  <div className="space-y-2 text-xs">
                    {Object.entries(
                      selectedProduct.customizableOptions
                    ).map(([key, options]) => (
                      <p key={key}>
                        <span className="font-semibold capitalize text-slate-700">
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </span>{' '}

                        <span className="text-slate-600">
                          {Array.isArray(options)
                            ? options.join(', ')
                            : String(options)}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-teal-100 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChatProduct(selectedProduct)}
                leftIcon={<MessageSquare size={14} />}
                className="border-teal-200 text-teal-800"
              >
                Chat with Manufacturer
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePostRequirement(selectedProduct)
                }
                className="border-teal-200 text-teal-800"
              >
                Request a Quote
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleCustomizeProduct(selectedProduct)
                }
                leftIcon={<Sliders size={14} />}
                className="bg-teal-600 font-bold text-white hover:bg-teal-700"
              >
                Customize with AI
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default CustomerMarketplacePage;