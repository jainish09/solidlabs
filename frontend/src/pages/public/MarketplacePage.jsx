import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AUTOMOTIVE_PRODUCTS, PRODUCT_CATEGORIES } from '../../data/automotiveProducts';
import ProductCard from '../../components/marketplace/ProductCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sliders,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Star,
  MapPin,
  Clock,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';

export const MarketplacePage = () => {
  const navigate = useNavigate();
  const { role, getOrCreateConversationForProduct } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(400000);
  const [customizableOnly, setCustomizableOnly] = useState(false);

  // Detail Modal State
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

  const handleChatWithManufacturer = (product) => {
    if (!product) return;
    const conv = getOrCreateConversationForProduct(product);
    setActiveDetailProduct(null);
    navigate(`/${role}/messages/${conv.id}`);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return AUTOMOTIVE_PRODUCTS.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All Categories' || prod.category === selectedCategory;
      const matchesPrice = prod.priceNumeric <= maxPrice;
      const matchesCustomizable = !customizableOnly || prod.customizationAvailable;

      return matchesSearch && matchesCat && matchesPrice && matchesCustomizable;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceNumeric - b.priceNumeric;
      if (sortBy === 'price_desc') return b.priceNumeric - a.priceNumeric;
      if (sortBy === 'rating') return b.manufacturer.rating - a.manufacturer.rating;
      return 0; // featured default
    });
  }, [searchQuery, selectedCategory, maxPrice, customizableOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setMaxPrice(400000);
    setCustomizableOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="sm" dot>B2B Automotive Marketplace</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-teal-800 border border-teal-200">
              18 Production Categories
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Automotive Components & OEM Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body">
            Browse verified automotive systems, compare Indian Rupee wholesale pricing, and customize directly with AI assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customize/prod_001')}
            leftIcon={<PlusCircle size={15} />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Post Custom Requirement
          </Button>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar (6 Cols) */}
          <div className="md:col-span-6">
            <Input
              placeholder="Search by part name, category, or alloy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          {/* Category Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="price_asc">Price: Low to High (INR)</option>
              <option value="price_desc">Price: High to Low (INR)</option>
              <option value="rating">Supplier Rating</option>
            </select>
          </div>
        </div>

        {/* Filter Toggle Badges */}
        <div className="pt-2 border-t border-teal-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCustomizableOnly(!customizableOnly)}
              className={`px-3 py-1 rounded-lg font-mono border transition-colors cursor-pointer ${
                customizableOnly
                  ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-teal-900'
              }`}
            >
              ✨ AI Customizable Only
            </button>

            <span className="text-slate-500 font-mono">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of 18 records
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-mono text-slate-500 hover:text-teal-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Per Row Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(p) => setActiveDetailProduct(p)}
              onContactSupplier={(p) => navigate(`/customize/${p.id}#contact`)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-teal-100 space-y-3">
          <p className="text-base font-bold font-heading text-slate-900">No components match your search filters.</p>
          <p className="text-xs text-slate-600 font-body max-w-md mx-auto">
            Try adjusting your search query, selecting "All Categories", or clearing the price threshold.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="border-teal-200 text-teal-800">
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {activeDetailProduct && (
        <Modal
          isOpen={!!activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
          title={activeDetailProduct.name}
          description={`Category: ${activeDetailProduct.category} • Manufactured by ${activeDetailProduct.manufacturer.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="h-60 w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={activeDetailProduct.image}
                alt={activeDetailProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-slate-600 font-body leading-relaxed">
              {activeDetailProduct.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <div><span className="text-slate-500">Price:</span> <span className="font-bold text-slate-900">{activeDetailProduct.priceINR}</span></div>
              <div><span className="text-slate-500">MOQ:</span> <span className="font-bold text-slate-900">{activeDetailProduct.moq} pcs</span></div>
              <div><span className="text-slate-500">Supplier:</span> <span className="text-teal-700 font-bold">{activeDetailProduct.manufacturer.name}</span></div>
              <div><span className="text-slate-500">Lead Time:</span> <span className="text-teal-800 font-bold">{activeDetailProduct.deliveryTimeline}</span></div>
            </div>

            {/* Specifications */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Key Technical Specs:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {activeDetailProduct.specifications.map((s, i) => (
                  <div key={i} className="p-2 rounded bg-white border border-teal-100 flex justify-between">
                    <span className="text-slate-500">{s.label}:</span>
                    <span className="font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-teal-100 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setActiveDetailProduct(null)} className="border-slate-200">
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChatWithManufacturer(activeDetailProduct)}
                leftIcon={<MessageSquare size={14} className="text-teal-600" />}
                className="border-teal-200 hover:border-teal-400 text-teal-800 hover:bg-teal-50"
              >
                Chat with Manufacturer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = activeDetailProduct.id;
                  setActiveDetailProduct(null);
                  navigate(`/customize/${id}`);
                }}
                leftIcon={<Sliders size={14} />}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Customize with AI
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MarketplacePage;
