import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CUSTOMER_MARKETPLACE_PRODUCTS } from '../../data/automotiveProducts';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import {
  Heart,
  Star,
  Sliders,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Box,
  Layers,
  FileText,
  AlertCircle,
  Share2,
  MessageSquare,
} from 'lucide-react';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, showToast, role, getOrCreateConversationForProduct } = useAuth();

  const product = CUSTOMER_MARKETPLACE_PRODUCTS.find((p) => p.id === id) || CUSTOMER_MARKETPLACE_PRODUCTS[0];
  const isWishlisted = wishlist.includes(product.id);

  const handleChatWithManufacturer = () => {
    const conv = getOrCreateConversationForProduct(product);
    navigate(`/${role}/messages/${conv.id}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product URL copied to clipboard');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/marketplace" className="hover:text-teal-700 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-teal-700 font-bold">{product.category}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Header & Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Gallery (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-teal-100 shadow-sm aspect-4/3 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge variant="teal" size="sm">Demo Specification</Badge>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/95 text-teal-800 border border-teal-200 shadow-xs">
                B2B Manufacturing
              </span>
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xs transition-colors ${
                isWishlisted ? 'bg-rose-50 text-rose-500 shadow-md' : 'bg-white/80 text-slate-400 hover:text-rose-500 shadow-sm'
              }`}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Key Production Stats Strip */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Minimum Order</p>
              <p className="text-sm font-bold font-heading text-slate-900 mt-0.5">{product.moq} units</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Capacity</p>
              <p className="text-sm font-bold font-heading text-teal-700 mt-0.5 truncate">{product.productionCapacity.split('/')[0]}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Lead Time</p>
              <p className="text-sm font-bold font-heading text-teal-800 mt-0.5">{product.deliveryTimeline}</p>
            </div>
          </div>
        </div>

        {/* Right Info & Actions (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
                {product.category}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 font-mono"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="font-bold text-slate-900">{product.manufacturer.rating}</span>
                <span className="text-slate-500">({product.manufacturer.reviewCount} reviews)</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-teal-700 font-semibold">{product.manufacturer.responseRate} Response Rate</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-xs space-y-2">
            <span className="text-xs text-slate-500 font-mono uppercase">Wholesale Manufacturing Pricing:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-heading text-slate-900">{product.priceINR}</span>
              <span className="text-xs font-mono text-slate-500">/ piece (excl. GST)</span>
            </div>
            <p className="text-xs text-slate-600 font-body leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-teal-300 text-teal-800 hover:bg-teal-50"
              onClick={handleChatWithManufacturer}
              leftIcon={<MessageSquare size={18} className="text-teal-600" />}
            >
              Chat with Manufacturer
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => navigate(`/customize/${product.id}`)}
              leftIcon={<Sliders size={18} />}
            >
              Customization Studio
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 border border-teal-200 text-teal-900 hover:bg-teal-50"
              onClick={() => navigate(`/customize/${product.id}#post-requirement`)}
            >
              Post Requirement
            </Button>
          </div>

          {/* Sample Manufacturer Profile Card */}
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white p-5 rounded-2xl border border-teal-700/60 shadow-md space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-200 uppercase tracking-wider block">
                  Demonstration Supplier Profile
                </span>
                <h3 className="text-base font-bold font-heading text-white mt-0.5">
                  {product.manufacturer.name}
                </h3>
                <p className="text-xs text-teal-100/80 font-mono flex items-center gap-1.5 mt-1">
                  <MapPin size={12} className="text-teal-400" />
                  <span>{product.manufacturer.location}</span>
                  <span>•</span>
                  <span>{product.manufacturer.yearsInBusiness} Years in Business</span>
                </p>
              </div>
              <Badge variant="teal" size="xs">Sample Profile</Badge>
            </div>

            <div className="pt-2 border-t border-teal-700/50 flex flex-wrap gap-2 text-[10px] font-mono text-teal-100">
              {product.manufacturer.certifications.map((cert, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-teal-800/60 border border-teal-700/70">
                  {cert}
                </span>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="white"
                size="sm"
                onClick={handleChatWithManufacturer}
                leftIcon={<MessageSquare size={14} className="text-teal-800" />}
                className="w-full sm:w-auto text-xs bg-white text-teal-900 hover:bg-teal-50 font-bold"
              >
                Direct Message Supplier
              </Button>
            </div>

            <p className="text-[10px] text-teal-200/60 font-body italic pt-1">
              * Note: All demonstration manufacturer profiles are sample profiles and not real verified businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Specifications Detailed Table */}
      <Card className="bg-white border border-teal-100 shadow-xs">
        <CardHeader>
          <CardTitle className="text-slate-900">Technical Engineering Specifications</CardTitle>
          <CardDescription className="text-slate-500">
            Category-specific mechanical and physical attributes for {product.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {product.specifications.map((spec, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-teal-50/50 border border-teal-100">
                <span className="text-slate-500 font-medium">{spec.label}</span>
                <span className="text-slate-900 font-bold">{spec.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 rounded-xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 font-medium">Standard Material</span>
              <span className="text-slate-900 font-bold">{product.material}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-teal-50/50 border border-teal-100">
              <span className="text-slate-500 font-medium">Customization Support</span>
              <span className="text-teal-700 font-bold">Available via AI Studio</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailsPage;
