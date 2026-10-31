import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles, Sliders, ArrowRight, MessageSquare, MapPin, ShieldCheck, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const ProductCard = ({ product, onViewDetails, onContactSupplier, strictImage = false, containImage = false, hideDemoBadge = false, chatButtonStyle = false }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, role, getOrCreateConversationForProduct } = useAuth();
  const isWishlisted = wishlist.includes(product.id);

  const handleDirectChat = () => {
    if (onContactSupplier) {
      onContactSupplier(product);
    } else {
      const conv = getOrCreateConversationForProduct(product);
      navigate(`/${role}/messages/${conv.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm hover:border-teal-500 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Product Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-50">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full ${containImage ? 'object-contain p-3' : 'object-cover object-center'} group-hover:scale-105 transition-transform duration-500`}
              loading="lazy"
              onError={(e) => {
                if (strictImage) {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                } else {
                  e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
                }
              }}
            />
          ) : null}
          {strictImage && !product.image ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-4 text-center text-xs font-medium text-slate-500">
              Image unavailable
            </div>
          ) : strictImage ? (
            <div className="hidden absolute inset-0 items-center justify-center bg-slate-100 px-4 text-center text-xs font-medium text-slate-500">
              Product image unavailable
            </div>
          ) : null}

          {/* Top Pill Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
            {!hideDemoBadge && <Badge variant="teal" size="xs">Demo Record</Badge>}
            {product.customizationAvailable && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/95 text-teal-800 border border-teal-200 shadow-xs">
                AI Customizable
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 shadow-md scale-110'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* MOQ Bottom Strip */}
          <div className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
            MOQ: {product.moq} units
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="truncate max-w-[65%] text-teal-700 font-bold">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="font-bold text-slate-900">{product.manufacturer.rating}</span>
              <span className="text-[10px] text-slate-500">({product.manufacturer.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-sm font-bold font-heading text-slate-900 line-clamp-2 hover:text-teal-700 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Price Range */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-extrabold font-heading text-slate-900">
              {product.priceINR}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">/ unit</span>
          </div>

          {/* 3 Key Technical Specifications */}
          <div className="bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/70 space-y-1 text-[11px] font-mono text-slate-700">
            {product.specifications.slice(0, 3).map((spec, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] truncate">
                <span className="text-slate-500 truncate">{spec.label}:</span>
                <span className="font-semibold text-slate-900 truncate ml-1">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Manufacturer Snippet */}
          <div className="pt-2 border-t border-teal-50 flex items-center justify-between text-[11px]">
            <div className="truncate max-w-[70%]">
              <span className="block font-semibold text-slate-900 truncate">{product.manufacturer.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <MapPin size={10} className="text-teal-600 shrink-0" />
                <span className="truncate">{product.manufacturer.location}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-100/70 px-2 py-0.5 rounded-md border border-teal-200/60">
              {product.manufacturer.responseRate} resp.
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
            className="w-full text-xs border-teal-200 text-slate-700 hover:bg-teal-50 hover:text-teal-900"
          >
            View Details
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/customize/${product.id}`)}
            leftIcon={<Sliders size={12} />}
            className="w-full text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
          >
            Customize
          </Button>
        </div>

        <button
          type="button"
          onClick={handleDirectChat}
          className={`w-full py-1.5 text-center text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${chatButtonStyle
            ? 'border border-teal-200 bg-teal-50 px-3 py-2 rounded-xl font-semibold text-teal-800 shadow-xs hover:border-teal-300 hover:bg-teal-100 hover:text-teal-900'
            : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50/50'}`}
        >
          <MessageSquare size={12} className="text-teal-600" />
          <span>Chat with Manufacturer</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
